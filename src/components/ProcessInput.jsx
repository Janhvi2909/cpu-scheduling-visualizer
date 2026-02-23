import { useState } from 'react'
import styles from './ProcessInput.module.css'

const initialForm = { pid: '', arrival: '', burst: '', priority: '', queueLevel: '0' }

export default function ProcessInput({ processes, onAdd, onRemove, onClear, algorithm }) {
  const [form, setForm] = useState(initialForm)

  const needsPriority = algorithm === 'priority'
  const needsQueueLevel = algorithm === 'mlq'

  const handleSubmit = (e) => {
    e.preventDefault()
    const pid = form.pid.trim()
    const arrival = parseInt(form.arrival, 10)
    const burst = parseInt(form.burst, 10)
    const priority = form.priority === '' ? 0 : parseInt(form.priority, 10)
    const queueLevel = form.queueLevel === '' ? 0 : Math.max(0, Math.min(2, parseInt(form.queueLevel, 10)))
    if (!pid || isNaN(arrival) || isNaN(burst) || arrival < 0 || burst < 1) return
    onAdd({
      pid,
      arrival,
      burst,
      ...(needsPriority && { priority: isNaN(priority) ? 0 : priority }),
      ...(needsQueueLevel && { queueLevel }),
    })
    setForm(initialForm)
  }

  const showPriority = needsPriority || processes.some((p) => p.priority !== undefined)
  const showQueueLevel = needsQueueLevel || processes.some((p) => p.queueLevel !== undefined)

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Add process</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <label className={styles.label}>
            <span>Process ID</span>
            <input
              type="text"
              value={form.pid}
              onChange={(e) => setForm((f) => ({ ...f, pid: e.target.value }))}
              placeholder="e.g. P1"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            <span>Arrival time</span>
            <input
              type="number"
              min="0"
              value={form.arrival}
              onChange={(e) => setForm((f) => ({ ...f, arrival: e.target.value }))}
              placeholder="0"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            <span>Burst time</span>
            <input
              type="number"
              min="1"
              value={form.burst}
              onChange={(e) => setForm((f) => ({ ...f, burst: e.target.value }))}
              placeholder="1"
              className={styles.input}
            />
          </label>
        </div>
        {(showPriority || showQueueLevel) && (
          <div className={styles.row}>
            {showPriority && (
              <label className={styles.label}>
                <span>Priority (lower = higher)</span>
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  placeholder="0"
                  className={styles.input}
                />
              </label>
            )}
            {showQueueLevel && (
              <label className={styles.label}>
                <span>Queue (0=RR, 1=RR, 2=FCFS)</span>
                <select
                  value={form.queueLevel}
                  onChange={(e) => setForm((f) => ({ ...f, queueLevel: e.target.value }))}
                  className={styles.select}
                >
                  <option value="0">0 (RR TQ=2)</option>
                  <option value="1">1 (RR TQ=4)</option>
                  <option value="2">2 (FCFS)</option>
                </select>
              </label>
            )}
          </div>
        )}
        <div className={styles.actions}>
          <button type="submit" className={styles.addBtn}>
            Add process
          </button>
          {processes.length > 0 && (
            <button type="button" onClick={onClear} className={styles.clearBtn}>
              Clear all
            </button>
          )}
        </div>
      </form>
      {processes.length > 0 && (
        <div className={styles.list}>
          <span className={styles.listLabel}>Processes</span>
          <ul className={styles.chips}>
            {processes.map((p, i) => (
              <li key={`${p.pid}-${i}`} className={styles.chip}>
                <span className={styles.chipColor} style={{ backgroundColor: `var(--color-p${(i % 8) + 1})` }} />
                <span className={styles.chipText}>
                  {p.pid} (AT: {p.arrival}, BT: {p.burst}
                  {p.priority !== undefined ? `, P: ${p.priority}` : ''}
                  {p.queueLevel !== undefined ? `, Q: ${p.queueLevel}` : ''})
                </span>
                <button type="button" onClick={() => onRemove(i)} className={styles.removeChip} aria-label={`Remove ${p.pid}`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
