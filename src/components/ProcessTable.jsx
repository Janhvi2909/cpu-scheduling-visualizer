import styles from './ProcessTable.module.css'

export default function ProcessTable({
  processResults,
  avgWaiting,
  avgTurnaround,
  avgResponseTime,
  cpuUtilization,
  throughput,
  contextSwitches,
}) {
  if (!processResults?.length) return null

  const hasResponseTime = processResults.some((p) => p.responseTime !== undefined)
  const hasPriority = processResults.some((p) => p.priority !== undefined)
  const hasQueueLevel = processResults.some((p) => p.queueLevel !== undefined)

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Process</th>
              <th>Arrival</th>
              <th>Burst</th>
              {hasPriority && <th>Priority</th>}
              {hasQueueLevel && <th>Queue</th>}
              <th>Waiting</th>
              <th>Turnaround</th>
              {hasResponseTime && <th>Response</th>}
            </tr>
          </thead>
          <tbody>
            {processResults.map((row) => (
              <tr key={row.pid}>
                <td>
                  <span className={styles.colorDot} style={{ backgroundColor: row.color }} />
                  <span className={styles.pid}>{row.pid}</span>
                </td>
                <td className={styles.mono}>{row.arrival}</td>
                <td className={styles.mono}>{row.burst}</td>
                {hasPriority && <td className={styles.mono}>{row.priority ?? '—'}</td>}
                {hasQueueLevel && <td className={styles.mono}>{row.queueLevel ?? '—'}</td>}
                <td className={styles.mono}>{row.waitingTime}</td>
                <td className={styles.mono}>{row.turnaroundTime}</td>
                {hasResponseTime && <td className={styles.mono}>{row.responseTime ?? '—'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Avg waiting time</span>
          <span className={styles.statValue}>{avgWaiting.toFixed(2)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Avg turnaround time</span>
          <span className={styles.statValue}>{avgTurnaround.toFixed(2)}</span>
        </div>
        {avgResponseTime != null && (
          <div className={styles.stat}>
            <span className={styles.statLabel}>Avg response time</span>
            <span className={styles.statValue}>{avgResponseTime.toFixed(2)}</span>
          </div>
        )}
        {cpuUtilization != null && (
          <div className={styles.stat}>
            <span className={styles.statLabel}>CPU utilization</span>
            <span className={styles.statValue}>{cpuUtilization.toFixed(1)}%</span>
          </div>
        )}
        {throughput != null && (
          <div className={styles.stat}>
            <span className={styles.statLabel}>Throughput</span>
            <span className={styles.statValue}>{throughput.toFixed(3)}</span>
          </div>
        )}
        {contextSwitches != null && (
          <div className={styles.stat}>
            <span className={styles.statLabel}>Context switches</span>
            <span className={styles.statValue}>{contextSwitches}</span>
          </div>
        )}
      </div>
    </div>
  )
}
