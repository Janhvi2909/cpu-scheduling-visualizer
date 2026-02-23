import { ALGORITHMS } from '../utils/constants'
import { getAlgorithmName } from '../utils/algorithms'
import styles from './AlgorithmSelector.module.css'

export default function AlgorithmSelector({
  value,
  onChange,
  disabled,
  timeQuantum,
  onTimeQuantumChange,
  priorityPreemptive,
  onPriorityPreemptiveChange,
}) {
  const showTimeQuantum = value === 'rr'
  const showPriorityPreemptive = value === 'priority'

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Algorithm</h2>
      <div className={styles.grid}>
        {ALGORITHMS.map((algo) => (
          <button
            key={algo.id}
            type="button"
            className={value === algo.id ? styles.btnActive : styles.btn}
            onClick={() => onChange(algo.id)}
            disabled={disabled}
            title={algo.name}
          >
            <span className={styles.label}>{algo.short}</span>
            <span className={styles.full}>{algo.description}</span>
          </button>
        ))}
      </div>
      {showTimeQuantum && (
        <div className={styles.param}>
          <label className={styles.paramLabel}>
            <span>Time quantum</span>
            <input
              type="number"
              min="1"
              max="20"
              value={timeQuantum}
              onChange={(e) => onTimeQuantumChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className={styles.paramInput}
            />
          </label>
        </div>
      )}
      {showPriorityPreemptive && (
        <div className={styles.param}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={priorityPreemptive}
              onChange={(e) => onPriorityPreemptiveChange(e.target.checked)}
            />
            <span>Preemptive</span>
          </label>
        </div>
      )}
      {value && (
        <p className={styles.current}>
          Selected: <strong>{getAlgorithmName(value)}</strong>
        </p>
      )}
    </section>
  )
}
