# CPU Scheduling Visualizer

A React-based visualizer for **six** CPU scheduling algorithms with comparison, full OS metrics, and a clear UI.

## Algorithms

| Algorithm | Preemptive? | Description |
|-----------|-------------|-------------|
| **FCFS** | No | First-Come First-Served — arrival order |
| **SJF** | No | Shortest Job First — smallest burst |
| **SRTF** | Yes | Shortest Remaining Time First |
| **Round Robin** | Yes | Time quantum (configurable) |
| **Priority** | Optional | Highest priority first (preemptive toggle) |
| **Multilevel Queue** | Mixed | Q0: RR TQ=2, Q1: RR TQ=4, Q2: FCFS |

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Features

- **Process input**: PID, Arrival time, Burst time; optional **Priority** (for Priority) and **Queue level** (for MLQ)
- **Six algorithms**: FCFS, SJF, SRTF, Round Robin (with time quantum), Priority (preemptive/non-preemptive), Multilevel Queue
- **Gantt chart** with time axis, idle blocks, and per-process colors
- **Process table**: Waiting, Turnaround, Response time; optional Priority/Queue columns
- **Metrics**: Avg waiting/turnaround/response time, CPU utilization %, throughput, context switches
- **Compare algorithms**: Same process set — side-by-side bar charts for all metrics
- **OS concepts**: Collapsible “OS concepts used” card (preemption, time quantum, context switch, etc.)
