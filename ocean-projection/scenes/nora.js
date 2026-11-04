window.OceanScenes = window.OceanScenes || {};
OceanScenes.nora = (() => {

const BLUE = "#0022FF";
const BALLOON_SIZE = 600;
const BALLOON_R = 285;
const PIXEL = 10;
let balloonSurface, vaseSurface;
let jellyTime = 0;
let elapsed = 0;
function init() {
  balloonSurface = createGraphics(600, 600);
  vaseSurface = createGraphics(420, 620);
  balloonSurface.pixelDensity(1);
  vaseSurface.pixelDensity(1);
}
function update(dt) {
  elapsed += dt;
  jellyTime += dt * 30 * PI / 20;
}
function render(name) {
  if (name === "balloon") { drawTide(balloonSurface, elapsed); return balloonSurface; }
  drawJellyfish(vaseSurface);
  return vaseSurface;
}
function waterline(x, t) {
  // One cycle: empty -> fully flooded -> empty, in about eight seconds.
  let cycle = ((t + 2) % 8) / 8;
  let tide = (1 - cos(TWO_PI * cycle)) / 2;
  let level = lerp(710, -110, tide);
  let swell = 46 * sin(x * 0.013 - t * 3.1);
  let chop = 13 * sin(x * 0.035 + t * 5.2);
  return level + swell + chop;
}

function pixelNoise(a, b) {
  let n = sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - floor(n);
}

function drawTide(pg, t) {
  pg.background(0);
  let ctx = pg.drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.arc(BALLOON_SIZE / 2, BALLOON_SIZE / 2, BALLOON_R, 0, TWO_PI);
  ctx.clip();
  pg.noStroke();

  // Columns of square pixels give the blue sea a stepped edge.
  for (let col = 0; col < BALLOON_SIZE / PIXEL; col++) {
    let x = col * PIXEL;
    let edge = floor(waterline(x + PIXEL / 2, t) / PIXEL) * PIXEL;

    pg.fill(BLUE);
    pg.rect(x, edge, PIXEL, BALLOON_SIZE - edge);

    // White foam occupies the top rows; its lower edge breaks into pixels.
    for (let row = 0; row < 4; row++) {
      let chance = [1, 0.9, 0.68, 0.23][row];
      let flicker = pixelNoise(col, row + floor(t * 8));
      if (flicker < chance) {
        pg.fill(255);
        pg.rect(x, edge + row * PIXEL, PIXEL, PIXEL);
      }
    }

    // A few detached flecks make the crest feel turbulent.
    if (pixelNoise(col, floor(t * 9) + 80) > 0.78) {
      pg.fill(255);
      pg.rect(x, edge - PIXEL * 2, PIXEL * 0.55, PIXEL * 0.55);
    }
  }

  // Sparse white data pixels drift across the blue surface.
  pg.fill(255, 170);
  for (let i = 0; i < 95; i++) {
    let x = (i * 137 + t * (28 + i % 5 * 9)) % BALLOON_SIZE;
    let y = (i * 173 + t * (18 + i % 4 * 6)) % BALLOON_SIZE;
    if (y > waterline(x, t) + 55) {
      let size = i % 7 === 0 ? 5 : 3;
      pg.rect(floor(x / PIXEL) * PIXEL, floor(y / PIXEL) * PIXEL,
        size, size);
    }
  }

  ctx.restore();
}

// The original point-formula jellyfish, now drawn into the vase texture.

function drawJellyfish(pg) {
  pg.background(0);
  pg.push();
  pg.translate(pg.width / 2, pg.height / 2);
  pg.scale(1.3);
  pg.stroke(255, 85);
  pg.strokeWeight(1);

  for (let i = 0; i < 10000; i++) {
    let x = i % 200;
    let y = i / 43;

    let wave = 5 * cos(x / 14) * cos(y / 30);
    let depth = y / 8 - 13;
    let distance = (wave * wave + depth * depth) / 59 + 4;
    let length = 60 + wave *
      (3 + 4 / distance * sin(distance * distance - jellyTime * 2));
    let angle = distance / 2 - jellyTime / 18;

    let pointX = length * sin(angle);
    let pointY = (length + distance * 9) * cos(angle);
    pg.point(pointX, pointY);
  }
  pg.pop();
}

// These solid colors appear only while testing placement (T).
return { init, update, render };
})();
