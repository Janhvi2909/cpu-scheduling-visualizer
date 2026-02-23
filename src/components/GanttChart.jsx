import { useMemo } from 'react'
import styles from './GanttChart.module.css'

const SCALE = 32

export default function GanttChart({ ganttBlocks, totalTime }) {
  const width = useMemo(() => Math.max(totalTime * SCALE, 400), [totalTime])
  const timeTicks = useMemo(() => {
    const ticks = []
    for (let t = 0; t <= totalTime; t++) ticks.push(t)
    return ticks
  }, [totalTime])

  if (!ganttBlocks?.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>◷</div>
        <p>Add processes and run an algorithm to see the Gantt chart.</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.chartWrap} style={{ width }}>
        <div className={styles.blocks}>
          {ganttBlocks.map((block, i) => {
            const w = (block.end - block.start) * SCALE
            const delay = i * 0.04
            if (block.type === 'idle') {
              return (
                <div
                  key={`idle-${i}`}
                  className={styles.blockIdle}
                  style={{ width: w, animationDelay: `${delay}s` }}
                  title={`Idle (${block.start}–${block.end})`}
                >
                  <span className={styles.idleLabel}>Idle</span>
                </div>
              )
            }
            return (
              <div
                key={`${block.pid}-${i}`}
                className={styles.block}
                style={{
                  width: w,
                  backgroundColor: block.color,
                  animationDelay: `${delay}s`,
                }}
                title={`${block.pid} (${block.start}–${block.end}), BT: ${block.burst}`}
              >
                <span className={styles.blockPid}>{block.pid}</span>
                <span className={styles.blockTime}>
                  {block.start}–{block.end}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div className={styles.timeAxis} style={{ width }}>
        {timeTicks.map((t) => (
          <div key={t} className={styles.tick} style={{ left: t * SCALE }}>
            <span className={styles.tickLabel}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
