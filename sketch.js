// Programming for Digital Media
// Assignment 2 /  
// Student Name – Student Number – email address

// === Global Variables ===

// Currently selected tool (e.g. pen, brush, spray, etc.)
let currentTool = 'pen';

// Tracks drawing state
let isDrawing = false;

// Start position for drawing shapes
let startX, startY;

// Stores loaded sticker images
let stickerImgs = {};

// Default drawing and background colors
let selectedColor=  "#000000"; 
let bgColor="#004400";

// Canvas object reference
let canvas;

// Array to keep placed stickers
let stickers = [];

// Tracks currently dragged sticker
let draggingSticker = null;

// Stores preloaded sticker images
let stickerImages = {};

const toolSizes = {
  pen: 2,
  brush: 10,
  line: 2,
  spray: 1,
  rectangle: 5,
  eraser: 20,
  calligraphy: 5,
  pixel: 8
};
let toolSize = toolSizes[currentTool]; // active size
const toolMaxSizes = {
  pen: 10,
  brush: 50,
  line: 20,
  spray: 3,
  rectangle: 40,
  eraser: 100,
  calligraphy: 15,
  pixel: 20
};
const toolCursorEmojiMap = {
  colorpicker: "🖌️",
  pen: "✏️",
  brush: "🖍️",
  line: "📏",
  spray: "💨",
  rectangle: "⬛",
  bucket: "🪣",
  eraser: "🧽",
  calligraphy: "🪶",
  pixel: "🧱"
};

// === Preload assets before setup ===
function preload() {
  // Load sticker images from base64 strings (defined elsewhere)
  stickerImages.snail = loadImage(snailBase64);
  stickerImages.sb1 = loadImage(spongebobBase64);
}

// === Initial Setup ===
function setup() {
  canvas = createCanvas(600, 400); // Create canvas of specified size
  canvas.parent('canvas-holder');  // Attach canvas to HTML container
  background(bgColor);             // Fill initial background

  // Enable drag-and-drop for stickers
  canvas.elt.addEventListener('dragover', (e) => { 
    e.preventDefault();
    currentTool = "sticker"; // Activate sticker tool on drag
  });

  canvas.elt.addEventListener('drop', handleDrop); // Handle sticker drop
  setupStickerDrag(); // Set up drag handlers for sticker elements

  

  
  function updateCursor(toolName) {
    const emoji = toolCursorEmojiMap[toolName];
    if (!emoji) return;
  
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
        <text x="0" y="24" font-size="24">${emoji}</text>
      </svg>`;
    
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    document.querySelector("#canvas-holder").style.cursor = toolName=="sticker" ? "default" :`url(${url}) 0 24, auto`;
  }
  // Tool selection buttons (pen, brush, etc.)
  updateCursor(currentTool)
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if(btn.dataset.tool != "colorpicker"){
        // Highlight selected tool and deactivate others
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove("active"))
        currentTool = btn.dataset.tool;
        updateCursor(currentTool)
        document.querySelector(`[data-tool="${currentTool}"]`).classList.add("active")
              // Update slider to reflect selected tool's size
              toolSize = toolSizes[currentTool];
              document.getElementById('tool-size').value = toolSize;
              document.getElementById('tool-size').max = toolMaxSizes[currentTool];
              display.textContent = toolSize;
              
      }
    });
  });

  const display = document.getElementById("tool-size-display");
  document.getElementById("tool-size").addEventListener("input", function () {
    toolSize = parseInt(this.value);
    toolSizes[currentTool] = toolSize;
    display.textContent = toolSize;
  });
  
  // === Color Picker Logic ===
  const hiddenPicker = document.getElementById('hidden-color-picker');

  hiddenPicker.addEventListener('input', (e) => {
    selectedColor = e.target.value;
    document.querySelector('[data-tool="colorpicker"]').style.color = selectedColor;
    // bgColor = selectedColor; // Sync background color with selection
  });

  // Open color picker UI
  document.querySelector('[data-tool="colorpicker"]').addEventListener('click', () => {
    hiddenPicker.click();
  });
  const slider = document.getElementById('tool-size');
slider.value = toolSizes[currentTool];
slider.max = toolMaxSizes[currentTool];
document.getElementById('tool-size-display').textContent = toolSize;

}

// Stores the currently selected sticker for placement
let currentSticker = null;

// === Mouse Interaction ===
function mousePressed() {
  if (currentTool === 'sticker' && currentSticker) {
    // Place sticker on canvas
    stickers.push({ img: stickerImgs[currentSticker], x: mouseX, y: mouseY });
    currentSticker = null;
    currentTool = 'pen'; // Return to pen tool
  } else if (currentTool === 'colorpicker') {
    let picked = get(mouseX, mouseY); // Not currently used
    currentTool = 'pen'; // Return to drawing
  } else {
    isDrawing = true;
    startX = mouseX;
    startY = mouseY;
  }
}
function touchMoved() {
  mouseIsPressed();
}
function mouseReleased() {
  isDrawing = false; // Stop drawing
}

// === Main Drawing Loop ===
function draw() {
  // Render all placed stickers
  for (let s of stickers) {
    image(stickerImages[s.name], s.x, s.y, 60, 60);
  }

  // Draw if the mouse is pressed and not interacting with a sticker
  if (mouseIsPressed && !draggingSticker && currentTool !== 'sticker') {
    useTool(); // Call active drawing tool
  }
}

// === Handle Drag-and-Drop for Stickers ===
function handleDrop(e) {
  e.preventDefault();
  
  const stickerType = e.dataTransfer.getData('sticker');
  if (stickerImages[stickerType]) {
    const bounds = e.target.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    stickers.push({ name: stickerType, x, y });
  }
}

// === Setup Dragging for Sticker Images in the UI ===
function setupStickerDrag() {
  document.querySelectorAll('.sticker').forEach(sticker => {
    sticker.addEventListener('dragstart', (e) => {
      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove("active"))
      document.querySelector("#canvas-holder").style.cursor='default'
      e.dataTransfer.setData('sticker', e.target.id);
    });
  });
}

// === Tool Usage Logic ===
function useTool() {
  stroke(selectedColor);
  fill(selectedColor);

  switch (currentTool) {
    case 'pen':
      strokeWeight(toolSize);
      line(pmouseX, pmouseY, mouseX, mouseY);
      break;
      case 'bucket':
        newFloodFill(int(mouseX), int(mouseY), color(selectedColor));
        break;
  
  
        case 'brush':
          strokeWeight(toolSize * 1.5); // exaggerate brush
          line(pmouseX, pmouseY, mouseX, mouseY);
          break;
    
    case 'line':
      strokeWeight(toolSize);
      line(startX, startY, mouseX, mouseY);
      break;
      case 'spray':
        strokeWeight(2)
        // Simulate spray effect using random points
        for (let i = 0; i < 20*toolSize; i++) {
          let offsetX = random(-10*toolSize, 10*toolSize);
          let offsetY = random(-10*toolSize, 10*toolSize);
          point(mouseX + offsetX, mouseY + offsetY);
        }
        break;


    case 'rectangle':
      strokeWeight(2)
      noFill();
      rect(mouseX - toolSize, mouseY - toolSize, toolSize * 2, toolSize * 2);
      break;

    case 'eraser':
      stroke(bgColor);
      strokeWeight(toolSize * 2);
      line(pmouseX, pmouseY, mouseX, mouseY);
      break;

    case 'calligraphy':
      strokeWeight(1);
      for (let i = 0; i < toolSize; i++) {
        line(mouseX, mouseY, mouseX + i, mouseY + i / 2);
      }
      break;

    case 'pixel':
      noSmooth();
      strokeWeight(toolSize);
      point(mouseX, mouseY);
      break;
  }
}

// === Utility: Clear the Canvas and Reset Stickers ===
function clearCanvas() {
  background("#004400");
  stickers = [];
}

// === Utility: Save Canvas as Image File ===
function saveCanvas() {
  save('spongebob-art.png');
}

// === Flood Fill Tool (Bucket Tool) ===
function newFloodFill(x, y, newColor) {
  loadPixels(); // Access pixel array
  const w = width;
  const h = height;

  const pixelIndex = (x, y) => 4 * (y * w + x);

  const targetIdx = pixelIndex(x, y);
  const targetColor = [
    pixels[targetIdx],
    pixels[targetIdx + 1],
    pixels[targetIdx + 2],
    pixels[targetIdx + 3],
  ];

  const fillR = red(newColor);
  const fillG = green(newColor);
  const fillB = blue(newColor);
  const fillA = 255;

  if (colorsEqual(targetColor, [fillR, fillG, fillB, fillA])) return;

  const stack = [[x, y]];

  // Flood fill algorithm using stack
  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;

    const idx = pixelIndex(cx, cy);
    const currentColor = [
      pixels[idx],
      pixels[idx + 1],
      pixels[idx + 2],
      pixels[idx + 3],
    ];

    if (colorsEqual(currentColor, targetColor)) {
      pixels[idx] = fillR;
      pixels[idx + 1] = fillG;
      pixels[idx + 2] = fillB;
      pixels[idx + 3] = fillA;

      // Spread to neighboring pixels
      stack.push([cx + 1, cy]);
      stack.push([cx - 1, cy]);
      stack.push([cx, cy + 1]);
      stack.push([cx, cy - 1]);
    }
  }

  updatePixels(); // Apply changes to canvas
}

// === Helper: Compare Two Colors with Tolerance ===
function colorsEqual(c1, c2) {
  const tolerance = 10;
  return (
    abs(c1[0] - c2[0]) < tolerance &&
    abs(c1[1] - c2[1]) < tolerance &&
    abs(c1[2] - c2[2]) < tolerance &&
    abs(c1[3] - c2[3]) < tolerance
  );
}

// === UI: Handle Start Button and Show Drawing Canvas ===
document.getElementById("start-btn").addEventListener("click", () => {
  if (window.innerWidth < 800) return alert("This paint tool is built for larger screens. Please switch to a desktop or tablet (width > 800px) for the best experience.")

  document.getElementById("intro-screen").classList.add("not-visible");
  document.querySelector("main").classList.remove("not-visible");
  document.getElementById("intro-screen").classList.remove("visible");
  document.querySelector("main").classList.add("visible");
});
 // Detect when the window is resized
 function resize(){
   if (window.innerWidth < 800 &&    document.getElementById("intro-screen").classList.contains("not-visible")) {
     alert("This paint tool is built for larger screens. Please switch to a desktop or tablet (width > 800px) for the best experience.")
     
     document.getElementById("intro-screen").classList.remove("not-visible");
     document.querySelector("main").classList.add("not-visible");
     document.getElementById("intro-screen").classList.add("visible");
     document.querySelector("main").classList.remove("visible");
    }}
    
    window.addEventListener('resize', resize);