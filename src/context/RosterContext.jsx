import React, { createContext, useContext, useState } from 'react'
import { datesOverlap } from '../lib/dateUtils.js'

import workersData from '../data/workers.json'
import careRecipientsData from '../data/careRecipients.json'
import shiftsData from '../data/shifts.json'
import leaveRequestsData from '../data/leaveRequests.json'
import complianceDocsData from '../data/complianceDocs.json'
import shiftRequestsData from '../data/shiftRequests.json'
import configData from '../data/config.json'

const RosterContext = createContext(null)

export function RosterProvider({ children }) {
  const [workers, setWorkers] = useState(workersData)
  const [careRecipients] = useState(careRecipientsData)
  const [shifts, setShifts] = useState(shiftsData)
  const [leaveRequests, setLeaveRequests] = useState(leaveRequestsData)
  const [complianceDocs] = useState(complianceDocsData)
  const [shiftRequests, setShiftRequests] = useState(shiftRequestsData)
  const [config] = useState(configData)

  // UI state
  const [selectedShiftId, setSelectedShiftId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [shiftsDateRange, setShiftsDateRange] = useState({
    start: config.currentWeekStart,
    end: new Date(new Date(config.currentWeekStart + 'T00:00:00').getTime() + 13 * 86400000)
      .toISOString()
      .slice(0, 10),
  })
  const [shiftsFilter, setShiftsFilter] = useState('all')
  const [workersFilter, setWorkersFilter] = useState('all')
  const [complianceFilter, setComplianceFilter] = useState('all')

  // ─── UI Actions ────────────────────────────────────────────────────────────

  function openShiftDrawer(shiftId) {
    setSelectedShiftId(shiftId)
    setDrawerOpen(true)
  }

  function closeShiftDrawer() {
    setDrawerOpen(false)
    setSelectedShiftId(null)
  }

  // ─── Shift Assignment (Mode A) ─────────────────────────────────────────────

  function assignWorkerToShift(shiftId, workerId) {
    setShifts(prev =>
      prev.map(s => {
        if (s.id !== shiftId) return s

        // Build new flags — remove needs_filling, originally_filled markers; add broken_shift if applicable
        const newFlags = s.flags.filter(f => f !== 'originally_filled')

        return {
          ...s,
          assignedWorkerId: workerId,
          status: 'filled',
          fillMode: null,
          flags: newFlags,
        }
      })
    )

    // Check for broken shift: same worker, same date, gap between shifts
    setShifts(prev => {
      const assignedShift = prev.find(s => s.id === shiftId)
      if (!assignedShift) return prev

      const sameDay = prev.filter(
        s => s.id !== shiftId && s.assignedWorkerId === workerId && s.date === assignedShift.date
      )

      if (sameDay.length === 0) return prev

      // Check for a gap (non-overlapping same-day shifts = broken shift)
      const hasBrokenShift = sameDay.some(other => {
        const gap1 = assignedShift.startTime > other.endTime
        const gap2 = other.startTime > assignedShift.endTime
        return gap1 || gap2
      })

      if (!hasBrokenShift) return prev

      return prev.map(s => {
        if (s.id === shiftId || (s.assignedWorkerId === workerId && s.date === assignedShift.date)) {
          return { ...s, flags: [...new Set([...s.flags, 'broken_shift'])] }
        }
        return s
      })
    })

    // Update worker's approved upcoming hours (simplified: add shift duration)
    setWorkers(prev =>
      prev.map(w => {
        if (w.id !== workerId) return w
        const shift = shifts.find(s => s.id === shiftId)
        return {
          ...w,
          hoursApprovedUpcoming: (w.hoursApprovedUpcoming || 0) + (shift?.durationHours || 0),
        }
      })
    )
  }

  // ─── Mode B: Request Management ───────────────────────────────────────────

  function approveShiftRequest(shiftId, requestId) {
    const request = shiftRequests.find(r => r.id === requestId)
    if (!request) return

    const workerId = request.workerId
    const shift = shifts.find(s => s.id === shiftId)
    if (!shift) return

    // EC-04: Auto-withdraw from conflicting shift request queues
    const conflictingRequestIds = shiftRequests
      .filter(r => {
        if (r.id === requestId || r.workerId !== workerId || r.status !== 'pending') return false
        const otherShift = shifts.find(s => s.id === r.shiftId)
        if (!otherShift || otherShift.date !== shift.date) return false
        return (
          shift.startTime < otherShift.endTime && otherShift.startTime < shift.endTime
        )
      })
      .map(r => r.id)

    // Remove worker from conflicting shift request queues
    setShifts(prev =>
      prev.map(s => {
        const hasConflict = s.requestIds?.some(rid =>
          conflictingRequestIds.some(cid => {
            const cr = shiftRequests.find(r => r.id === cid)
            return cr && cr.shiftId === s.id
          })
        )
        if (!hasConflict) return s
        return { ...s, requestIds: s.requestIds.filter(rid => !conflictingRequestIds.includes(rid)) }
      })
    )

    // Mark conflicting requests as withdrawn
    setShiftRequests(prev =>
      prev.map(r => {
        if (conflictingRequestIds.includes(r.id)) return { ...r, status: 'withdrawn' }
        if (r.id === requestId) return { ...r, status: 'approved' }
        return r
      })
    )

    // Assign the worker
    assignWorkerToShift(shiftId, workerId)

    // Update shift: remove from open_requests, mark filled
    setShifts(prev =>
      prev.map(s => {
        if (s.id !== shiftId) return s
        return {
          ...s,
          requestIds: s.requestIds.filter(rid => rid !== requestId),
          status: 'filled',
          assignedWorkerId: workerId,
        }
      })
    )
  }

  function declineShiftRequest(shiftId, requestId) {
    setShiftRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'declined' } : r))
    )
    setShifts(prev =>
      prev.map(s => {
        if (s.id !== shiftId) return s
        const remaining = s.requestIds.filter(rid => rid !== requestId)
        return {
          ...s,
          requestIds: remaining,
          status: remaining.length > 0 ? 'open_requests' : 'needs_filling',
          fillMode: remaining.length > 0 ? 'mode_b' : 'mode_a',
        }
      })
    )
  }

  function declineAllRequestsAndConvertToModeA(shiftId) {
    const shift = shifts.find(s => s.id === shiftId)
    if (!shift) return

    // Decline all pending requests for this shift
    setShiftRequests(prev =>
      prev.map(r =>
        shift.requestIds.includes(r.id) && r.status === 'pending'
          ? { ...r, status: 'declined' }
          : r
      )
    )

    // Convert shift to Mode A
    setShifts(prev =>
      prev.map(s => {
        if (s.id !== shiftId) return s
        return { ...s, requestIds: [], status: 'needs_filling', fillMode: 'mode_a' }
      })
    )
  }

  // ─── Leave Management ──────────────────────────────────────────────────────

  function approveLeaveRequest(leaveRequestId) {
    const leave = leaveRequests.find(lr => lr.id === leaveRequestId)
    if (!leave) return

    // Mark leave as approved
    setLeaveRequests(prev =>
      prev.map(lr => (lr.id === leaveRequestId ? { ...lr, status: 'approved' } : lr))
    )

    // EC-07/EC-09: Find all shifts assigned to this worker during leave period → reopen as vacant
    setShifts(prev =>
      prev.map(s => {
        if (
          s.assignedWorkerId === leave.workerId &&
          datesOverlap(s.date, s.date, leave.startDate, leave.endDate)
        ) {
          return {
            ...s,
            previousAssignedWorkerId: s.assignedWorkerId,
            assignedWorkerId: null,
            status: 'originally_filled_vacant',
            fillMode: 'mode_a',
            flags: [...new Set([...s.flags, 'originally_filled'])],
          }
        }
        return s
      })
    )

    // EC-09: Remove worker from any pending shift request queues that overlap leave dates
    const conflictingRequestIds = shiftRequests
      .filter(r => {
        if (r.workerId !== leave.workerId || r.status !== 'pending') return false
        const shift = shifts.find(s => s.id === r.shiftId)
        return shift && datesOverlap(shift.date, shift.date, leave.startDate, leave.endDate)
      })
      .map(r => r.id)

    if (conflictingRequestIds.length > 0) {
      setShiftRequests(prev =>
        prev.map(r =>
          conflictingRequestIds.includes(r.id) ? { ...r, status: 'withdrawn' } : r
        )
      )
      setShifts(prev =>
        prev.map(s => ({
          ...s,
          requestIds: (s.requestIds || []).filter(rid => !conflictingRequestIds.includes(rid)),
        }))
      )
    }
  }

  function declineLeaveRequest(leaveRequestId) {
    setLeaveRequests(prev =>
      prev.map(lr => (lr.id === leaveRequestId ? { ...lr, status: 'declined' } : lr))
    )
  }

  // ─── Context Value ─────────────────────────────────────────────────────────

  const value = {
    // Data
    workers,
    careRecipients,
    shifts,
    leaveRequests,
    complianceDocs,
    shiftRequests,
    config,

    // UI state
    selectedShiftId,
    drawerOpen,
    shiftsDateRange,
    shiftsFilter,
    workersFilter,
    complianceFilter,

    // Actions
    openShiftDrawer,
    closeShiftDrawer,
    assignWorkerToShift,
    approveShiftRequest,
    declineShiftRequest,
    declineAllRequestsAndConvertToModeA,
    approveLeaveRequest,
    declineLeaveRequest,
    setShiftsDateRange: range => setShiftsDateRange(range),
    setShiftsFilter,
    setWorkersFilter,
    setComplianceFilter,
  }

  return <RosterContext.Provider value={value}>{children}</RosterContext.Provider>
}

export function useRoster() {
  const ctx = useContext(RosterContext)
  if (!ctx) throw new Error('useRoster must be used within RosterProvider')
  return ctx
}
