const gridContainer = document.querySelector("#grid-container");

for (let i = 0; i < 16; i++) {
  let rowWrapper = document.createElement("div");
  rowWrapper.style.display = "flex";
  rowWrapper.style.flexDirection = "row";
  rowWrapper.style.width = "960px";
  rowWrapper.style.height = `${960 / 16}px`;
  for (let j = 0; j < 16; j++) {
    let gridCell = document.createElement("div");
    gridCell.classList.add("grid-cell");
    gridCell.style.width = `${960 / 16}px`;
    gridCell.style.height = `${960 / 16}px`;
    gridCell.style.border = "1px solid black";
    rowWrapper.appendChild(gridCell);
  }

  gridContainer.appendChild(rowWrapper);
}

gridContainer.addEventListener("mouseover", (event) => {
  const targetCell = event.target;

  if (targetCell.classList.contains("grid-cell"))
    targetCell.style.backgroundColor = "yellow";
});
