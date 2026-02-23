/**
 * Compute aggregate metrics from scheduling result.
 * Used for single-algorithm view and for comparison.
 */

/**
 * CPU utilization: fraction of total time the CPU was busy (not idle).
 * @param {Array} ganttBlocks
 * @param {number} totalTime
 * @returns {number} 0–100
 */
export function cpuUtilization(ganttBlocks, totalTime) {
  if (!totalTime) return 0
  let busy = 0
  for (const b of ganttBlocks) {
    if (b.type === 'process') busy += b.end - b.start
  }
  return (busy / totalTime) * 100
}

/**
 * Throughput: processes completed per unit time.
 */
export function throughput(numProcesses, totalTime) {
  if (!totalTime) return 0
  return numProcesses / totalTime
}

/**
 * Context switches: number of times the CPU switched to a different process (or to/from idle).
 */
export function contextSwitchesFromGantt(ganttBlocks) {
  if (!ganttBlocks.length) return 0
  let count = 0
  let prevPid = null
  for (const b of ganttBlocks) {
    const current = b.type === 'idle' ? 'idle' : b.pid
    if (prevPid !== null && prevPid !== current) count++
    prevPid = current
  }
  return count
}

/**
 * All metrics for a single run.
 */
export function computeAllMetrics(result) {
  if (!result?.ganttBlocks?.length) {
    return {
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      cpuUtilization: 0,
      throughput: 0,
      contextSwitches: 0,
    }
  }
  const pr = result.processResults
  const n = pr.length
  const avgWaitingTime = n ? pr.reduce((s, p) => s + p.waitingTime, 0) / n : 0
  const avgTurnaroundTime = n ? pr.reduce((s, p) => s + p.turnaroundTime, 0) / n : 0
  const avgResponseTime = n && pr.some(p => p.responseTime !== undefined)
    ? pr.reduce((s, p) => s + (p.responseTime ?? 0), 0) / n
    : 0
  return {
    avgWaitingTime,
    avgTurnaroundTime,
    avgResponseTime,
    cpuUtilization: cpuUtilization(result.ganttBlocks, result.totalTime),
    throughput: throughput(n, result.totalTime),
    contextSwitches: result.contextSwitches ?? contextSwitchesFromGantt(result.ganttBlocks),
  }
}