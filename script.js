const gridContainer = document.querySelector("#grid-container");
const GRID_SIZE = 720;

// WebSocket connection for real-time sync
const wsProtocol = location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${wsProtocol}://${location.host}/ws`);

ws.addEventListener("message", (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.type === "init") {
      createGrid(data.gridSize || 16);
      // Apply snapshot
      for (const cell of data.cells || []) {
        const el = getCell(cell.row, cell.col);
        if (el) {
          el.style.backgroundColor = cell.color;
          el.style.opacity = String(cell.opacity);
        }
      }
    } else if (data.type === "grid") {
      createGrid(data.gridSize || 16);
    } else if (data.type === "paint") {
      const el = getCell(data.row, data.col);
      if (el) {
        el.style.backgroundColor = data.color;
        el.style.opacity = String(data.opacity);
      }
    }
  } catch (_) {
    // ignore
  }
});

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function createGrid(numberOfSquares) {
  gridContainer.innerHTML = "";
  gridContainer.style.setProperty("--grid-size", String(numberOfSquares));
  for (let i = 0; i < numberOfSquares; i++) {
    for (let j = 0; j < numberOfSquares; j++) {
      const gridCell = document.createElement("div");
      gridCell.classList.add("grid-cell");
      gridCell.style.backgroundColor = "white";
      gridCell.style.opacity = "1";
      gridCell.dataset.row = String(i);
      gridCell.dataset.col = String(j);
      gridContainer.appendChild(gridCell);
    }
  }
}

function getCell(row, col) {
  return gridContainer.querySelector(
    `.grid-cell[data-row="${row}"][data-col="${col}"]`
  );
}

const createGridButton = document.querySelector("#create-grid-button");
createGridButton.addEventListener("click", () => {
  let numberOfSquares;
  do {
    numberOfSquares = parseInt(
      prompt("Enter the amount of squares per side (16 <= amount <= 100): ")
    );
  } while (
    isNaN(numberOfSquares) ||
    numberOfSquares > 100 ||
    numberOfSquares < 16
  );

  createGrid(numberOfSquares);
  // Broadcast grid re-init
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "grid", gridSize: numberOfSquares }));
  }
});

function paintCell(cellEl) {
  const newColor = getRandomColor();
  cellEl.style.backgroundColor = newColor;
  if (parseFloat(cellEl.style.opacity) > 0) {
    cellEl.style.opacity = String(parseFloat(cellEl.style.opacity) - 0.1);
  }
  const row = Number(cellEl.dataset.row);
  const col = Number(cellEl.dataset.col);
  const opacity = parseFloat(cellEl.style.opacity);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({ type: "paint", row, col, color: newColor, opacity })
    );
  }
}

// Pointer/touch drawing support
let isDrawing = false;

gridContainer.addEventListener(
  "pointerdown",
  (event) => {
    const target = event.target;
    if (target.classList && target.classList.contains("grid-cell")) {
      isDrawing = true;
      target.setPointerCapture?.(event.pointerId);
      paintCell(target);
      event.preventDefault();
    }
  },
  { passive: false }
);

gridContainer.addEventListener(
  "pointermove",
  (event) => {
    if (!isDrawing) return;
    const el = document.elementFromPoint(event.clientX, event.clientY);
    if (el && el.classList && el.classList.contains("grid-cell")) {
      paintCell(el);
      event.preventDefault();
    }
  },
  { passive: false }
);

window.addEventListener(
  "pointerup",
  () => {
    isDrawing = false;
  },
  { passive: true }
);

createGrid(16);
