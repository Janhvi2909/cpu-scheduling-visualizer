/**
 * CPU Scheduling Algorithms
 * Each returns { ganttBlocks, processResults, totalTime, contextSwitches }
 * Process: { pid, arrival, burst, priority?, queueLevel? }
 */

import { getColor, PROCESS_COLORS } from './constants'

function ensurePriority(p) {
  return { ...p, priority: p.priority ?? 0 }
}

function ensureQueueLevel(p) {
  return { ...p, queueLevel: p.queueLevel ?? 0 }
}

/**
 * First-Come First-Served (FCFS) - Non-preemptive
 */
export function runFCFS(processes) {
  if (!processes?.length) return { ganttBlocks: [], processResults: [], totalTime: 0, contextSwitches: 0 }

  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival)
  const ganttBlocks = []
  const processResults = []
  let currentTime = 0
  let contextSwitches = 0

  sorted.forEach((p, idx) => {
    if (currentTime < p.arrival) {
      ganttBlocks.push({ type: 'idle', start: currentTime, end: p.arrival, label: 'Idle' })
      contextSwitches++
      currentTime = p.arrival
    }
    const start = currentTime
    const finish = start + p.burst
    const waitingTime = start - p.arrival
    const turnaroundTime = finish - p.arrival
    ganttBlocks.push({
      type: 'process',
      pid: p.pid,
      start,
      end: finish,
      burst: p.burst,
      color: getColor(idx),
    })
    processResults.push({
      pid: p.pid,
      arrival: p.arrival,
      burst: p.burst,
      waitingTime,
      turnaroundTime,
      responseTime: start - p.arrival,
      color: getColor(idx),
    })
    currentTime = finish
    contextSwitches++
  })

  return { ganttBlocks, processResults, totalTime: currentTime, contextSwitches }
}

/**
 * Shortest Job First (SJF) - Non-preemptive
 */
export function runSJF(processes) {
  if (!processes?.length) return { ganttBlocks: [], processResults: [], totalTime: 0, contextSwitches: 0 }

  const ganttBlocks = []
  const processResults = []
  let time = 0
  let contextSwitches = 0
  const remaining = processes.map((p, idx) => ({ ...p, colorIndex: idx }))

  while (remaining.length > 0) {
    const available = remaining.filter((p) => p.arrival <= time)
    if (available.length === 0) {
      const nextArrival = Math.min(...remaining.map((p) => p.arrival))
      ganttBlocks.push({ type: 'idle', start: time, end: nextArrival, label: 'Idle' })
      contextSwitches++
      time = nextArrival
      continue
    }
    available.sort((a, b) => a.burst - b.burst)
    const current = available[0]
    const start = time
    const finish = start + current.burst
    const waitingTime = start - current.arrival
    const turnaroundTime = finish - current.arrival
    ganttBlocks.push({
      type: 'process',
      pid: current.pid,
      start,
      end: finish,
      burst: current.burst,
      color: getColor(current.colorIndex),
    })
    processResults.push({
      pid: current.pid,
      arrival: current.arrival,
      burst: current.burst,
      waitingTime,
      turnaroundTime,
      responseTime: start - current.arrival,
      color: getColor(current.colorIndex),
    })
    time = finish
    contextSwitches++
    remaining.splice(remaining.indexOf(current), 1)
  }

  return { ganttBlocks, processResults, totalTime: time, contextSwitches }
}

/**
 * Shortest Remaining Time First (SRTF) - Preemptive
 */
export function runSRTF(processes) {
  if (!processes?.length) return { ganttBlocks: [], processResults: [], totalTime: 0, contextSwitches: 0 }

  const n = processes.length
  const colorIndex = (pid) => processes.findIndex((p) => p.pid === pid)
  const remaining = processes.map((p) => ({ ...p, remaining: p.burst, firstRun: null }))
  const ganttBlocks = []
  let time = 0
  let contextSwitches = 0

  while (remaining.some((p) => p.remaining > 0)) {
    const arrived = remaining.filter((p) => p.arrival <= time && p.remaining > 0)
    if (arrived.length === 0) {
      const nextArrival = Math.min(...remaining.filter((p) => p.remaining > 0).map((p) => p.arrival))
      ganttBlocks.push({ type: 'idle', start: time, end: nextArrival, label: 'Idle' })
      contextSwitches++
      time = nextArrival
      continue
    }
    arrived.sort((a, b) => a.remaining - b.remaining || a.arrival - b.arrival)
    const current = arrived[0]
    if (current.firstRun === null) current.firstRun = time
    const nextEvent = Math.min(
      ...remaining.filter((p) => p.arrival > time && p.remaining > 0).map((p) => p.arrival),
      time + current.remaining
    )
    const duration = nextEvent - time
    const isPreempted = duration < current.remaining
    const end = time + duration
    ganttBlocks.push({
      type: 'process',
      pid: current.pid,
      start: time,
      end,
      burst: duration,
      color: getColor(colorIndex(current.pid)),
    })
    contextSwitches++
    current.remaining -= duration
    time = end
    if (isPreempted && current.remaining > 0) contextSwitches++
  }

  const processResults = processes.map((p, idx) => {
    const runs = ganttBlocks.filter((b) => b.type === 'process' && b.pid === p.pid)
    const firstRun = runs[0]?.start ?? p.arrival
    const lastRun = runs[runs.length - 1]
    const finish = lastRun ? lastRun.end : p.arrival
    const waitingTime = finish - p.arrival - p.burst
    const turnaroundTime = finish - p.arrival
    const responseTime = firstRun - p.arrival
    return {
      pid: p.pid,
      arrival: p.arrival,
      burst: p.burst,
      waitingTime,
      turnaroundTime,
      responseTime,
      color: getColor(idx),
    }
  })

  return { ganttBlocks, processResults, totalTime: time, contextSwitches }
}

/**
 * Round Robin (RR) - Preemptive, time quantum
 */
export function runRoundRobin(processes, timeQuantum = 2) {
  if (!processes?.length) return { ganttBlocks: [], processResults: [], totalTime: 0, contextSwitches: 0 }

  const colorIndex = (pid) => processes.findIndex((p) => p.pid === pid)
  const queue = []
  const remaining = processes.map((p) => ({ ...p, remaining: p.burst, firstRun: null }))
  const ganttBlocks = []
  let time = 0
  let contextSwitches = 0
  const maxSteps = 10000

  function enqueue(p) {
    if (p.remaining > 0 && !queue.includes(p)) queue.push(p)
  }

  while (time < maxSteps) {
    remaining.filter((p) => p.arrival <= time).forEach(enqueue)
    if (queue.length === 0) {
      if (remaining.every((p) => p.remaining === 0)) break
      const nextArrivals = remaining.filter((p) => p.remaining > 0 && p.arrival > time).map((p) => p.arrival)
      if (nextArrivals.length === 0) break
      const next = Math.min(...nextArrivals)
      ganttBlocks.push({ type: 'idle', start: time, end: next, label: 'Idle' })
      contextSwitches++
      time = next
      continue
    }
    const current = queue.shift()
    if (current.firstRun === null) current.firstRun = time
    const slice = Math.min(timeQuantum, current.remaining)
    const end = time + slice
    ganttBlocks.push({
      type: 'process',
      pid: current.pid,
      start: time,
      end,
      burst: slice,
      color: getColor(colorIndex(current.pid)),
    })
    contextSwitches++
    current.remaining -= slice
    time = end
    if (current.remaining > 0) queue.push(current)
  }

  const processResults = processes.map((p, idx) => {
    const runs = ganttBlocks.filter((b) => b.type === 'process' && b.pid === p.pid)
    const firstRun = runs[0]?.start ?? p.arrival
    const lastRun = runs[runs.length - 1]
    const finish = lastRun ? lastRun.end : p.arrival
    const waitingTime = finish - p.arrival - p.burst
    const turnaroundTime = finish - p.arrival
    const responseTime = firstRun - p.arrival
    return {
      pid: p.pid,
      arrival: p.arrival,
      burst: p.burst,
      waitingTime,
      turnaroundTime,
      responseTime,
      color: getColor(idx),
    }
  })

  return { ganttBlocks, processResults, totalTime: time, contextSwitches }
}

/**
 * Priority Scheduling - optional preemptive
 * Lower priority number = higher priority (1 = highest)
 */
export function runPriority(processes, preemptive = false) {
  if (!processes?.length) return { ganttBlocks: [], processResults: [], totalTime: 0, contextSwitches: 0 }

  const withPriority = processes.map(ensurePriority)
  const colorIndex = (pid) => withPriority.findIndex((p) => p.pid === pid)

  if (!preemptive) {
    const ganttBlocks = []
    const processResults = []
    let time = 0
    let contextSwitches = 0
    const remaining = withPriority.map((p, i) => ({ ...p, colorIndex: i }))

    while (remaining.length > 0) {
      const available = remaining.filter((p) => p.arrival <= time)
      if (available.length === 0) {
        const nextArrival = Math.min(...remaining.map((p) => p.arrival))
        ganttBlocks.push({ type: 'idle', start: time, end: nextArrival, label: 'Idle' })
        contextSwitches++
        time = nextArrival
        continue
      }
      available.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival)
      const current = available[0]
      const start = time
      const finish = start + current.burst
      ganttBlocks.push({
        type: 'process',
        pid: current.pid,
        start,
        end: finish,
        burst: current.burst,
        color: getColor(current.colorIndex),
      })
      processResults.push({
        pid: current.pid,
        arrival: current.arrival,
        burst: current.burst,
        priority: current.priority,
        waitingTime: start - current.arrival,
        turnaroundTime: finish - current.arrival,
        responseTime: start - current.arrival,
        color: getColor(current.colorIndex),
      })
      time = finish
      contextSwitches++
      remaining.splice(remaining.indexOf(current), 1)
    }
    return { ganttBlocks, processResults, totalTime: time, contextSwitches }
  }

  // Preemptive: at each time step run highest-priority arrived process
  const remaining = withPriority.map((p) => ({ ...p, remaining: p.burst, firstRun: null }))
  const ganttBlocks = []
  let time = 0
  let contextSwitches = 0

  while (remaining.some((p) => p.remaining > 0)) {
    const arrived = remaining.filter((p) => p.arrival <= time && p.remaining > 0)
    if (arrived.length === 0) {
      const nextArrival = Math.min(...remaining.filter((p) => p.remaining > 0).map((p) => p.arrival))
      ganttBlocks.push({ type: 'idle', start: time, end: nextArrival, label: 'Idle' })
      contextSwitches++
      time = nextArrival
      continue
    }
    arrived.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival)
    const current = arrived[0]
    if (current.firstRun === null) current.firstRun = time
    const nextArrivalTime = Math.min(
      ...remaining.filter((p) => p.arrival > time && p.remaining > 0).map((p) => p.arrival),
      Infinity
    )
    const runUntil = nextArrivalTime === Infinity
      ? time + current.remaining
      : Math.min(time + current.remaining, nextArrivalTime)
    const duration = runUntil - time
    ganttBlocks.push({
      type: 'process',
      pid: current.pid,
      start: time,
      end: runUntil,
      burst: duration,
      color: getColor(colorIndex(current.pid)),
    })
    contextSwitches++
    current.remaining -= duration
    time = runUntil
  }

  const processResults = withPriority.map((p, idx) => {
    const runs = ganttBlocks.filter((b) => b.type === 'process' && b.pid === p.pid)
    const firstRun = runs[0]?.start ?? p.arrival
    const lastRun = runs[runs.length - 1]
    const finish = lastRun ? lastRun.end : p.arrival
    return {
      pid: p.pid,
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority,
      waitingTime: finish - p.arrival - p.burst,
      turnaroundTime: finish - p.arrival,
      responseTime: firstRun - p.arrival,
      color: getColor(idx),
    }
  })

  return { ganttBlocks, processResults, totalTime: time, contextSwitches }
}

/**
 * Multilevel Queue: Q0 = RR TQ=2, Q1 = RR TQ=4, Q2 = FCFS
 * Processes with lower queueLevel have higher priority (0 = top).
 */
export function runMultilevelQueue(processes) {
  if (!processes?.length) return { ganttBlocks: [], processResults: [], totalTime: 0, contextSwitches: 0 }

  const withLevel = processes.map(ensureQueueLevel)
  const TQ = [2, 4, Infinity]
  const colorIndex = (pid) => withLevel.findIndex((p) => p.pid === pid)

  const queues = [[], [], []]
  const remaining = withLevel.map((p) => ({
    ...p,
    remaining: p.burst,
    firstRun: null,
  }))

  const ganttBlocks = []
  let time = 0
  let contextSwitches = 0

  function getNextArrival() {
    return Math.min(
      ...remaining.filter((p) => p.remaining > 0).map((p) => p.arrival),
      Infinity
    )
  }

  function refillQueues(t) {
    remaining.forEach((p) => {
      if (p.arrival <= t && p.remaining > 0) {
        const q = p.queueLevel
        if (q >= 0 && q <= 2 && !queues[q].includes(p)) queues[q].push(p)
      }
    })
  }

  function getActiveProcess() {
    for (let q = 0; q < 3; q++) {
      if (queues[q].length > 0) return { process: queues[q][0], queueIndex: q }
    }
    return null
  }

  refillQueues(0)

  while (remaining.some((p) => p.remaining > 0)) {
    const active = getActiveProcess()
    if (!active) {
      const nextArrival = getNextArrival()
      if (nextArrival === Infinity) break
      ganttBlocks.push({ type: 'idle', start: time, end: nextArrival, label: 'Idle' })
      contextSwitches++
      time = nextArrival
      refillQueues(time)
      continue
    }

    const { process: current, queueIndex: q } = active
    queues[q].shift()
    if (current.firstRun === null) current.firstRun = time
    const tq = TQ[q]
    const slice = Math.min(tq, current.remaining)
    const end = time + slice
    ganttBlocks.push({
      type: 'process',
      pid: current.pid,
      start: time,
      end,
      burst: slice,
      color: getColor(colorIndex(current.pid)),
    })
    contextSwitches++
    current.remaining -= slice
    time = end
    for (let t = time - slice + 1; t <= time; t++) refillQueues(t)
    if (current.remaining > 0) queues[q].push(current)
  }

  const processResults = withLevel.map((p, idx) => {
    const runs = ganttBlocks.filter((b) => b.type === 'process' && b.pid === p.pid)
    const firstRun = runs[0]?.start ?? p.arrival
    const lastRun = runs[runs.length - 1]
    const finish = lastRun ? lastRun.end : p.arrival
    return {
      pid: p.pid,
      arrival: p.arrival,
      burst: p.burst,
      queueLevel: p.queueLevel,
      waitingTime: finish - p.arrival - p.burst,
      turnaroundTime: finish - p.arrival,
      responseTime: firstRun - p.arrival,
      color: getColor(idx),
    }
  })

  return { ganttBlocks, processResults, totalTime: time, contextSwitches }
}

export function getAlgorithmName(key) {
  const names = {
    fcfs: 'First-Come First-Served (FCFS)',
    sjf: 'Shortest Job First (SJF)',
    srtf: 'Shortest Remaining Time First (SRTF)',
    rr: 'Round Robin (RR)',
    priority: 'Priority Scheduling',
    mlq: 'Multilevel Queue (MLQ)',
  }
  return names[key] || key
}

export { PROCESS_COLORS, getColor } from './constants'