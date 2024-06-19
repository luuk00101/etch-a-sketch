const gridContainer = document.querySelector("#grid-container");
const GRID_SIZE = 720;

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function createGrid(numberOfSquares) {
  gridContainer.innerHTML = "";

  for (let i = 0; i < numberOfSquares; i++) {
    let rowWrapper = document.createElement("div");
    rowWrapper.style.display = "flex";
    rowWrapper.style.flexDirection = "row";
    rowWrapper.style.width = "960px";
    rowWrapper.style.height = `${GRID_SIZE / numberOfSquares}px`;
    for (let j = 0; j < numberOfSquares; j++) {
      let gridCell = document.createElement("div");
      gridCell.classList.add("grid-cell");
      gridCell.style.width = `${GRID_SIZE / numberOfSquares}px`;
      gridCell.style.height = `${GRID_SIZE / numberOfSquares}px`;
      gridCell.style.boxSizing = "border-box";
      gridCell.style.border = "1px solid black";
      gridCell.style.backgroundColor = "white";
      gridCell.style.opacity = "1";
      rowWrapper.appendChild(gridCell);
    }

    gridContainer.appendChild(rowWrapper);
  }
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
});

gridContainer.addEventListener("mouseover", (event) => {
  const targetCell = event.target;

  if (targetCell.classList.contains("grid-cell")) {
    targetCell.style.backgroundColor = getRandomColor();
    if (parseFloat(targetCell.style.opacity) > 0)
      targetCell.style.opacity = parseFloat(targetCell.style.opacity) - 0.1;
  }
});

createGrid(16);
