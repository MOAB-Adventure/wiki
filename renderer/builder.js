let originInFront = false;
const parts = [];
let scale = 8;

let anchor = document.createElement("draggable-part");
anchor.style.borderRadius = "100%";
anchor.width = 100;
anchor.height = 100;
anchor.x = Math.round(visualViewport.width / 20);
anchor.y = Math.round(visualViewport.height / 20);
anchor.description = "Origin";
anchor.resizable = false;
anchor.deletable = false;
anchor.rotatable = false;
anchor.posCorrection = 0;
anchor.coordinateScale = 8;
anchor.id = "anchor"
anchor.updateStyles();
anchor.onmove = (event) => {
  if (!event.shiftKey)
    for (let part of parts) {
      part.updateStyles(event);
    }
  grid.style.top = anchor.style.top;
  grid.style.left = anchor.style.left;
  anchor.style.textAlign = "center";
};
document.body.appendChild(anchor);

let blomp = document.createElement("draggable-part");
blomp.anchor = anchor;
blomp.description = "Reference Image";
blomp.style.zIndex = "-1";
blomp.id = "ref";
blomp.width = 230;
blomp.height = 150;
blomp.serialisable = false;
blomp.coordinateScale = scale;
blomp.deletable = false;
document.body.appendChild(blomp);
blomp.style.pointerEvents = "none";
parts.push(blomp);

function updatePreviewBlimp() {
  let input = document.getElementById("export-scale");
  blomp.width = 230 / input.value;
  blomp.height = 150 / input.value;
  blomp.updateStyles();
}

function makePart(x = 0, y = 0, width = 10, height = 10) {
  let elt = document.createElement("draggable-part");
  elt.x = x;
  elt.y = y;
  elt.width = width;
  elt.height = height;
  elt.anchor = anchor;
  elt.serialisable = true;
  elt.coordinateScale = scale;
  elt.style.pointerEvents = "none"
  document.body.appendChild(elt);
  parts.push(elt);
  return elt;
}

function handleKeyboardShortcut(event) {
  if (event.key === " ") {
    makePart();
  }
}
document.addEventListener("keydown", handleKeyboardShortcut);
function delAll() {
  for (let part of parts) {
    if (part.deletable) part.remove();
  }
  parts.splice(1);
}
function toggleOriginInFront() {
  if (originInFront) {
    anchor.style.zIndex = "auto";
  } else {
    anchor.style.zIndex = "99";
  }
  originInFront = !originInFront;
}

function importJSON(json) {
  let scl = 1
  let obj = JSON.parse(json);
  delAll();
  if (!obj instanceof Array) return;
  for (let part of obj) {
    console.log("creating", part);
    let created = makePart(
      part.x / scl,
      part.y / scl,
      part.width / scl,
      part.height / scl
    );
    created.rotation = part.rotation;
    created.updateStyles();
  }
  console.log(obj);
}
