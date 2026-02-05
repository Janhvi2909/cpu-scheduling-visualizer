const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336"];
let colorIndex = 0;

function getColor() {
  const color = colors[colorIndex % colors.length];
  colorIndex++;
  return color;
}



let processes = [];

function addProcess() {
  const pid = document.getElementById("pid").value;
  const arrival = parseInt(document.getElementById("arrival").value);
  const burst = parseInt(document.getElementById("burst").value);

  if (!pid || isNaN(arrival) || isNaN(burst)) {
    alert("Please fill all fields");
    return;
  }

  processes.push({ pid, arrival, burst });
  alert("Process added!");
}


document.getElementById("algoName").innerHTML = "<b>Algorithm:</b> FCFS (Non-Preemptive)";
function runFCFS() {
  processes.sort((a, b) => a.arrival - b.arrival);

  const gantt = document.getElementById("gantt");
  const table = document.getElementById("processTable");

  gantt.innerHTML = "";
  table.innerHTML = "";

  let currentTime = 0;

  processes.forEach(p => {
    if (currentTime < p.arrival) {
      currentTime = p.arrival;
    }

    const start = currentTime;
    const finish = start + p.burst;

    const waitingTime = start - p.arrival;
    const turnaroundTime = finish - p.arrival;

    // Gantt block
    const block = document.createElement("div");
    block.className = "block";
    block.style.backgroundColor = getColor();
    block.innerText = `${p.pid} (${start}-${finish})`;
    gantt.appendChild(block);

    // Table row
    const row = `
      <tr>
        <td>${p.pid}</td>
        <td>${p.arrival}</td>
        <td>${p.burst}</td>
        <td>${waitingTime}</td>
        <td>${turnaroundTime}</td>
      </tr>
    `;
    table.innerHTML += row;

    currentTime = finish;
  });
}


document.getElementById("algoName").innerHTML = "<b>Algorithm:</b> SJF (Non-Preemptive)";
function runSJF() {
  const gantt = document.getElementById("gantt");
  const table = document.getElementById("processTable");

  gantt.innerHTML = "";
  table.innerHTML = "";

  let time = 0;
  let completed = [];
  let remaining = [...processes];

  while (remaining.length > 0) {
    // Get processes that have arrived
    const available = remaining.filter(p => p.arrival <= time);

    if (available.length === 0) {
      time++;
      continue;
    }

    // Pick shortest job
    available.sort((a, b) => a.burst - b.burst);
    const current = available[0];

    const start = time;
    const finish = start + current.burst;

    const waitingTime = start - current.arrival;
    const turnaroundTime = finish - current.arrival;

    // Gantt block
    const block = document.createElement("div");
    block.className = "block";
    block.style.backgroundColor = getColor();

    block.innerText = `${current.pid} (${start}-${finish})`;
    gantt.appendChild(block);

    // Table row
    const row = `
      <tr>
        <td>${current.pid}</td>
        <td>${current.arrival}</td>
        <td>${current.burst}</td>
        <td>${waitingTime}</td>
        <td>${turnaroundTime}</td>
      </tr>
    `;
    table.innerHTML += row;

    time = finish;
    completed.push(current);
    remaining = remaining.filter(p => p !== current);
  }
}