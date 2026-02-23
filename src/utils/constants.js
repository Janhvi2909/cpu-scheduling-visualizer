/**
 * Shared constants for CPU scheduling visualizer.
 * Process colors used across Gantt chart, process list, and tables.
 */

export const PROCESS_COLORS = [
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#10b981', // emerald
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
]

export function getColor(index) {
  return PROCESS_COLORS[index % PROCESS_COLORS.length]
}

/** Algorithm metadata for UI and comparison */
export const ALGORITHMS = [
  { id: 'fcfs', name: 'First-Come First-Served (FCFS)', short: 'FCFS', preemptive: false, description: 'Arrival order' },
  { id: 'sjf', name: 'Shortest Job First (SJF)', short: 'SJF', preemptive: false, description: 'Smallest burst' },
  { id: 'srtf', name: 'Shortest Remaining Time First (SRTF)', short: 'SRTF', preemptive: true, description: 'Smallest remaining time' },
  { id: 'rr', name: 'Round Robin (RR)', short: 'RR', preemptive: true, description: 'Time quantum' },
  { id: 'priority', name: 'Priority Scheduling', short: 'Priority', preemptive: 'optional', description: 'Highest priority first' },
  { id: 'mlq', name: 'Multilevel Queue (MLQ)', short: 'MLQ', preemptive: 'mixed', description: 'Multiple queues' },
]