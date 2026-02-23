import { useState, useMemo } from 'react'
import ProcessInput from './components/ProcessInput'
import AlgorithmSelector from './components/AlgorithmSelector'
import GanttChart from './components/GanttChart'
import ProcessTable from './components/ProcessTable'
import ComparisonChart from './components/ComparisonChart'
import ConceptsCard from './components/ConceptsCard'
import {
  runFCFS,
  runSJF,
  runSRTF,
  runRoundRobin,
  runPriority,
  runMultilevelQueue,
} from './utils/algorithms'
import { computeAllMetrics } from './utils/metrics'
import styles from './App.module.css'

function runSelectedAlgorithm(algorithm, processes, opts) {
  if (!processes.length) return null
  const { timeQuantum = 2, priorityPreemptive = false } = opts || {}
  switch (algorithm) {
    case 'fcfs':
      return runFCFS(processes)
    case 'sjf':
      return runSJF(processes)
    case 'srtf':
      return runSRTF(processes)
    case 'rr':
      return runRoundRobin(processes, timeQuantum)
    case 'priority':
      return runPriority(processes, priorityPreemptive)
    case 'mlq':
      return runMultilevelQueue(processes)
    default:
      return runFCFS(processes)
  }
}

export default function App() {
  const [processes, setProcesses] = useState([])
  const [algorithm, setAlgorithm] = useState('fcfs')
  const [timeQuantum, setTimeQuantum] = useState(2)
  const [priorityPreemptive, setPriorityPreemptive] = useState(false)
  const [activeView, setActiveView] = useState('visualize')

  const fixResult = useMemo(() => {
    if (!processes.length) return null
    return runSelectedAlgorithm(algorithm, processes, { timeQuantum, priorityPreemptive })
  }, [algorithm, processes, timeQuantum, priorityPreemptive])

  const metrics = useMemo(() => computeAllMetrics(fixResult), [fixResult])

  const handleAddProcess = (p) => setProcesses((prev) => [...prev, p])
  const handleRemoveProcess = (index) => setProcesses((prev) => prev.filter((_, i) => i !== index))
  const handleClear = () => setProcesses([])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◷</span>
            <h1 className={styles.title}>CPU Scheduling Visualizer</h1>
          </div>
          <p className={styles.subtitle}>
            FCFS, SJF, SRTF, Round Robin, Priority & Multilevel Queue — with comparison and full OS metrics
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          <div className={styles.col}>
            <ProcessInput
              processes={processes}
              onAdd={handleAddProcess}
              onRemove={handleRemoveProcess}
              onClear={handleClear}
              algorithm={algorithm}
            />
            <AlgorithmSelector
              value={algorithm}
              onChange={setAlgorithm}
              disabled={processes.length === 0}
              timeQuantum={timeQuantum}
              onTimeQuantumChange={setTimeQuantum}
              priorityPreemptive={priorityPreemptive}
              onPriorityPreemptiveChange={setPriorityPreemptive}
            />
            <ConceptsCard />
          </div>

          <div className={styles.col}>
            <div className={styles.tabs}>
              <button
                type="button"
                className={activeView === 'visualize' ? styles.tabActive : styles.tab}
                onClick={() => setActiveView('visualize')}
              >
                Visualize
              </button>
              <button
                type="button"
                className={activeView === 'compare' ? styles.tabActive : styles.tab}
                onClick={() => setActiveView('compare')}
              >
                Compare algorithms
              </button>
            </div>

            {activeView === 'visualize' && (
              <>
                <section className={styles.output}>
                  <div className={styles.outputHeader}>
                    <h2 className={styles.outputTitle}>Gantt chart</h2>
                    {algorithm === 'rr' && (
                      <span className={styles.outputSubtitle}>Time quantum: {timeQuantum}</span>
                    )}
                  </div>
                  <GanttChart
                    ganttBlocks={fixResult?.ganttBlocks ?? []}
                    totalTime={fixResult?.totalTime ?? 0}
                  />
                </section>

                {fixResult?.processResults?.length > 0 && (
                  <section className={styles.output}>
                    <h2 className={styles.outputTitle}>Process details & metrics</h2>
                    <ProcessTable
                      processResults={fixResult.processResults}
                      avgWaiting={metrics.avgWaitingTime}
                      avgTurnaround={metrics.avgTurnaroundTime}
                      avgResponseTime={metrics.avgResponseTime}
                      cpuUtilization={metrics.cpuUtilization}
                      throughput={metrics.throughput}
                      contextSwitches={metrics.contextSwitches}
                    />
                  </section>
                )}
              </>
            )}

            {activeView === 'compare' && (
              <section className={styles.output}>
                <ComparisonChart
                  processes={processes}
                  timeQuantum={timeQuantum}
                  priorityPreemptive={priorityPreemptive}
                />
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <span>CPU Scheduling Visualizer</span>
        <span className={styles.footerDot}>·</span>
        <span>FCFS, SJF, SRTF, RR, Priority, Multilevel Queue</span>
      </footer>
    </div>
  )
}
