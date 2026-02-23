import { useState } from 'react'
import styles from './ConceptsCard.module.css'

export default function ConceptsCard() {
  const [open, setOpen] = useState(false)
  return (
    <section className={styles.section}>
      <button type="button" className={styles.trigger} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>OS concepts used</span>
        <span className={styles.chevron}>{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className={styles.content}>
          <ul>
            <li><strong>Preemption</strong> — CPU can switch to another process before current finishes (SRTF, RR, preemptive Priority).</li>
            <li><strong>Time quantum</strong> — Max time a process runs before being preempted (Round Robin).</li>
            <li><strong>Context switch</strong> — Overhead when the CPU saves one process and loads another.</li>
            <li><strong>Response time</strong> — Time from arrival until the process first gets the CPU.</li>
            <li><strong>Waiting time</strong> — Total time spent ready but not running.</li>
            <li><strong>Turnaround time</strong> — Time from arrival to completion.</li>
            <li><strong>CPU utilization</strong> — % of total time the CPU was busy.</li>
            <li><strong>Throughput</strong> — Processes completed per unit time.</li>
          </ul>
        </div>
      )}
    </section>
  )
}
