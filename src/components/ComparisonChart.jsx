import { useMemo } from 'react'
import { ALGORITHMS } from '../utils/constants'
import { getAlgorithmName } from '../utils/algorithms'
import { computeAllMetrics } from '../utils/metrics'
import {
  runFCFS,
  runSJF,
  runSRTF,
  runRoundRobin,
  runPriority,
  runMultilevelQueue,
} from '../utils/algorithms'
import styles from './ComparisonChart.module.css'

function runAlgorithm(id, processes, opts) {
  switch (id) {
    case 'fcfs':
      return runFCFS(processes)
    case 'sjf':
      return runSJF(processes)
    case 'srtf':
      return runSRTF(processes)
    case 'rr':
      return runRoundRobin(processes, opts.timeQuantum ?? 2)
    case 'priority':
      return runPriority(processes, opts.priorityPreemptive ?? false)
    case 'mlq':
      return runMultilevelQueue(processes)
    default:
      return { ganttBlocks: [], processResults: [], totalTime: 0, contextSwitches: 0 }
  }
}

const METRIC_KEYS = [
  { key: 'avgWaitingTime', label: 'Avg waiting time', format: (v) => v.toFixed(2) },
  { key: 'avgTurnaroundTime', label: 'Avg turnaround time', format: (v) => v.toFixed(2) },
  { key: 'avgResponseTime', label: 'Avg response time', format: (v) => v.toFixed(2) },
  { key: 'cpuUtilization', label: 'CPU utilization %', format: (v) => v.toFixed(1) },
  { key: 'throughput', label: 'Throughput', format: (v) => v.toFixed(3) },
  { key: 'contextSwitches', label: 'Context switches', format: (v) => String(Math.round(v)) },
]

export default function ComparisonChart({ processes, timeQuantum, priorityPreemptive }) {
  const comparison = useMemo(() => {
    if (!processes?.length) return []
    const opts = { timeQuantum: timeQuantum ?? 2, priorityPreemptive: priorityPreemptive ?? false }
    return ALGORITHMS.map((algo) => {
      const result = runAlgorithm(algo.id, processes, opts)
      const metrics = computeAllMetrics(result)
      return { id: algo.id, name: getAlgorithmName(algo.id), short: algo.short, metrics }
    })
  }, [processes, timeQuantum, priorityPreemptive])

  if (!processes?.length) {
    return (
      <div className={styles.empty}>
        <p>Add processes and run comparison to see how each algorithm performs.</p>
      </div>
    )
  }

  const maxByKey = {}
  METRIC_KEYS.forEach(({ key }) => {
    const values = comparison.map((c) => c.metrics[key])
    if (key === 'contextSwitches' || key === 'throughput') {
      maxByKey[key] = Math.max(...values, 1)
    } else {
      maxByKey[key] = Math.max(...values, 0.01)
    }
  })

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Algorithm comparison</h3>
      <p className={styles.subtext}>Same process set — lower is better for time metrics; higher is better for CPU % and throughput.</p>
      <div className={styles.grid}>
        {METRIC_KEYS.map(({ key, label, format }) => (
          <div key={key} className={styles.metricCard}>
            <div className={styles.metricLabel}>{label}</div>
            <div className={styles.bars}>
              {comparison.map((row) => {
                const value = row.metrics[key]
                const max = maxByKey[key]
                const isInverse = key === 'cpuUtilization' || key === 'throughput'
                const width = max ? (value / max) * 100 : 0
                return (
                  <div key={row.id} className={styles.barRow}>
                    <span className={styles.barLabel} title={row.name}>
                      {row.short}
                    </span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${Math.min(100, width)}%`,
                          backgroundColor: isInverse ? 'var(--accent)' : 'var(--color-chart)',
                        }}
                      />
                    </div>
                    <span className={styles.barValue}>{format(value)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
