/*
 * Projection Mapping — ONE shared B+C surface with SIX control points.
 * Top row:    TL -- TM -- TR
 * Bottom row: BL -- BM -- BR
 *
 * B and C are ONE continuous 2:1 texture with a shared center column.
 * The two middle points are independently draggable and always connect both halves.
 * p5.mapper still handles the umbrella and top surfaces.
 */

// Put your images next to index.html and mapping.js.
// For the shared B+C image (and later coral/fish layers), use 800x400 or 2:1.
const IMAGE_FILES = {
  umbrella: "umbrella_background.png", // Temporary blue umbrella base; replace with your own later
  umbrellaTrash1: "trash_01_top_bag.png",   // 海洋垃圾 1：塑料袋
  umbrellaTrash2: "trash_02_top_bottle.png", // 海洋垃圾 2：塑料瓶
  umbrellaTrash3: "trash_03_left_bottle.png",// 海洋垃圾 3：塑料瓶
  umbrellaTrash4: "trash_04_right_bag.png",  // 海洋垃圾 4：购物袋
  umbrellaTrash5: "trash_05_bottom_bag.png", // 海洋垃圾 5：塑料袋
  umbrellaFishRing: "umbrella_fish_ring.png", // Your new circular fish artwork
  top: "top_background.png",
  sides: "BC_background.png", // Shared B+C background, 2:1
  coral1: "coral_1.png",  // 近景珊瑚，透明图层
  coral2: "coral_2.png",  // 中景珊瑚，透明图层
  coral3: "coral_3.png",  // 远景珊瑚，透明图层
  fish: "fish_atlas.png"      // Automatically separated original hand-painted fish
};

let pMapper;
const surfaces = {};
const images = {};
const imageErrors = {};
let solidMode = false;
let panelVisible = true;
let sixCalibration = true;

// B+C: ONE surface, SIX linked vertices, ONE shared composited image.
let sharedBC;
let umbrellaBuffer; // One composited umbrella texture: blue base -> orbiting fish -> plastic
let coralMeshes = []; // 每层独立的连续 WEBGL 网格，避免分块裂缝
let sixPoints = [];
let draggingPoint = -1;
const POINT_RADIUS = 12;

// Natural underwater coral movement.
// The roots stay steady while the upper tips sway independently.
let coralSwayTime = 0;
const CORAL_SWAY_SPEED = 0.030;  // stronger but still relaxed underwater motion
const CORAL_SWAY_AMOUNT = 34;   // 原来是 10；提高顶端位移，底部保持固定
const CORAL_LAYER_SPEED = [0.78, 1.0, 1.23];
const CORAL_LAYER_AMPLITUDE = [0.8, 1.0, 1.18];
const CORAL_LAYER_PHASE = [0.0, 1.8, 3.4];
const CORAL_COLUMNS = 28;       // connected mesh columns
const CORAL_ROWS = 12;          // connected mesh rows

// ===== INDIVIDUAL FISH: ORIGINAL ARTWORK CUT INTO SPRITES =====
// One atlas file holds individual watercolor fish; each fish has its own trajectory.
// Modify these three values to adjust movement without changing the art.
const FISH_SPEED_MULTIPLIER = 1.0; // 1 normal, 1.5 faster, 0.6 calmer
const FISH_WANDER_MULTIPLIER = 1.0; // 1 normal, 1.8 larger vertical wandering
const FISH_OPACITY = 210;           // 0 transparent ... 255 fully visible
const FISH_SPRITES = [{"sx":6,"sy":6,"sw":127,"sh":42,"x":65.85,"y":28.03,"width":31.5,"height":10.42},{"sx":141,"sy":6,"sw":132,"sh":44,"x":179.32,"y":32.74,"width":32.74,"height":10.91},{"sx":281,"sy":6,"sw":125,"sh":46,"x":401.68,"y":33.48,"width":31.0,"height":11.41},{"sx":414,"sy":6,"sw":175,"sh":60,"x":300.73,"y":38.69,"width":43.4,"height":14.88},{"sx":597,"sy":6,"sw":119,"sh":43,"x":211.69,"y":43.03,"width":29.52,"height":10.67},{"sx":724,"sy":6,"sw":229,"sh":77,"x":100.82,"y":47.5,"width":56.8,"height":19.1},{"sx":961,"sy":6,"sw":187,"sh":69,"x":342.15,"y":46.75,"width":46.38,"height":17.11},{"sx":1156,"sy":6,"sw":74,"sh":31,"x":380.23,"y":45.02,"width":18.35,"height":7.69},{"sx":1238,"sy":6,"sw":259,"sh":86,"x":258.57,"y":56.05,"width":64.24,"height":21.33},{"sx":1505,"sy":6,"sw":119,"sh":39,"x":31.87,"y":51.71,"width":29.52,"height":9.67},{"sx":1632,"sy":6,"sw":225,"sh":82,"x":175.48,"y":63.0,"width":55.81,"height":20.34},{"sx":1865,"sy":6,"sw":120,"sh":39,"x":366.34,"y":63.87,"width":29.76,"height":9.67},{"sx":6,"sy":100,"sw":129,"sh":43,"x":124.88,"y":64.61,"width":32.0,"height":10.67},{"sx":143,"sy":100,"sw":158,"sh":55,"x":66.47,"y":66.35,"width":39.19,"height":13.64},{"sx":309,"sy":100,"sw":124,"sh":40,"x":216.78,"y":69.2,"width":30.76,"height":9.92},{"sx":441,"sy":100,"sw":256,"sh":89,"x":324.92,"y":76.27,"width":63.49,"height":22.07},{"sx":705,"sy":100,"sw":209,"sh":69,"x":406.14,"y":75.03,"width":51.84,"height":17.11},{"sx":922,"sy":100,"sw":215,"sh":76,"x":34.6,"y":76.89,"width":53.33,"height":18.85},{"sx":1145,"sy":100,"sw":131,"sh":47,"x":103.55,"y":77.01,"width":32.49,"height":11.66},{"sx":1284,"sy":100,"sw":129,"sh":43,"x":271.96,"y":77.01,"width":32.0,"height":10.67},{"sx":1421,"sy":100,"sw":282,"sh":81,"x":223.72,"y":86.69,"width":69.94,"height":20.09},{"sx":1711,"sy":100,"sw":106,"sh":38,"x":126.0,"y":83.59,"width":26.29,"height":9.43},{"sx":1825,"sy":100,"sw":154,"sh":55,"x":367.58,"y":89.17,"width":38.2,"height":13.64},{"sx":6,"sy":197,"sw":207,"sh":79,"x":74.53,"y":94.37,"width":51.34,"height":19.59},{"sx":221,"sy":197,"sw":273,"sh":98,"x":157.13,"y":96.73,"width":67.71,"height":24.31},{"sx":502,"sy":197,"sw":109,"sh":36,"x":320.33,"y":93.01,"width":27.03,"height":8.93},{"sx":619,"sy":197,"sw":176,"sh":66,"x":276.8,"y":98.96,"width":43.65,"height":16.37},{"sx":803,"sy":197,"sw":112,"sh":39,"x":21.83,"y":101.57,"width":27.78,"height":9.67},{"sx":923,"sy":197,"sw":178,"sh":63,"x":405.52,"y":106.03,"width":44.15,"height":15.63},{"sx":1109,"sy":197,"sw":172,"sh":59,"x":199.41,"y":107.02,"width":42.66,"height":14.63},{"sx":1289,"sy":197,"sw":194,"sh":73,"x":297.38,"y":115.7,"width":48.12,"height":18.11},{"sx":1491,"sy":197,"sw":153,"sh":56,"x":107.02,"y":113.84,"width":37.95,"height":13.89},{"sx":1652,"sy":197,"sw":109,"sh":36,"x":357.78,"y":112.36,"width":27.03,"height":8.93},{"sx":1769,"sy":197,"sw":162,"sh":65,"x":234.88,"y":116.45,"width":40.18,"height":16.12},{"sx":6,"sy":303,"sw":216,"sh":73,"x":45.39,"y":119.43,"width":53.57,"height":18.11},{"sx":230,"sy":303,"sw":103,"sh":36,"x":159.61,"y":118.8,"width":25.55,"height":8.93},{"sx":341,"sy":303,"sw":101,"sh":37,"x":419.54,"y":119.92,"width":25.05,"height":9.18},{"sx":450,"sy":303,"sw":121,"sh":41,"x":336.2,"y":124.39,"width":30.01,"height":10.17},{"sx":579,"sy":303,"sw":227,"sh":76,"x":388.53,"y":129.47,"width":56.3,"height":18.85},{"sx":814,"sy":303,"sw":127,"sh":41,"x":258.32,"y":127.86,"width":31.5,"height":10.17},{"sx":949,"sy":303,"sw":103,"sh":35,"x":80.98,"y":128.35,"width":25.55,"height":8.68},{"sx":1060,"sy":303,"sw":126,"sh":46,"x":130.96,"y":130.21,"width":31.25,"height":11.41},{"sx":1194,"sy":303,"sw":119,"sh":40,"x":188.62,"y":134.18,"width":29.52,"height":9.92},{"sx":1321,"sy":303,"sw":123,"sh":47,"x":290.32,"y":138.28,"width":30.51,"height":11.66},{"sx":1452,"sy":303,"sw":138,"sh":48,"x":21.58,"y":139.14,"width":34.23,"height":11.91},{"sx":1598,"sy":303,"sw":296,"sh":110,"x":84.58,"y":146.83,"width":73.42,"height":27.28},{"sx":6,"sy":421,"sw":245,"sh":73,"x":232.28,"y":144.48,"width":60.77,"height":18.11},{"sx":259,"sy":421,"sw":167,"sh":56,"x":159.11,"y":143.61,"width":41.42,"height":13.89},{"sx":434,"sy":421,"sw":218,"sh":83,"x":330.12,"y":149.19,"width":54.07,"height":20.59},{"sx":660,"sy":421,"sw":102,"sh":32,"x":417.68,"y":149.81,"width":25.3,"height":7.94},{"sx":770,"sy":421,"sw":111,"sh":37,"x":32.37,"y":155.39,"width":27.53,"height":9.18},{"sx":889,"sy":421,"sw":132,"sh":61,"x":384.94,"y":158.37,"width":32.74,"height":15.13},{"sx":1029,"sy":421,"sw":155,"sh":54,"x":137.53,"y":159.73,"width":38.44,"height":13.39},{"sx":1192,"sy":421,"sw":128,"sh":47,"x":267.87,"y":160.85,"width":31.75,"height":11.66},{"sx":1328,"sy":421,"sw":104,"sh":36,"x":352.94,"y":163.45,"width":25.79,"height":8.93},{"sx":1440,"sy":421,"sw":167,"sh":56,"x":191.35,"y":166.18,"width":41.42,"height":13.89},{"sx":1615,"sy":421,"sw":145,"sh":50,"x":299.74,"y":168.91,"width":35.96,"height":12.4},{"sx":1768,"sy":421,"sw":149,"sh":54,"x":93.63,"y":169.65,"width":36.96,"height":13.39},{"sx":6,"sy":512,"sw":206,"sh":76,"x":251.75,"y":178.08,"width":51.09,"height":18.85},{"sx":220,"sy":512,"sw":224,"sh":81,"x":388.41,"y":180.69,"width":55.56,"height":20.09},{"sx":452,"sy":512,"sw":242,"sh":76,"x":46.63,"y":182.55,"width":60.02,"height":18.85},{"sx":702,"sy":512,"sw":168,"sh":53,"x":157.0,"y":185.4,"width":41.67,"height":13.15},{"sx":878,"sy":512,"sw":111,"sh":39,"x":108.51,"y":186.39,"width":27.53,"height":9.67},{"sx":997,"sy":512,"sw":131,"sh":39,"x":330.74,"y":187.14,"width":32.49,"height":9.67}];
const fishActors = FISH_SPRITES.map((s,i)=>({
  ...s,
  // Consistent pseudo-random variety from fish index; no sudden flicker.
  speed: 7 + ((i*37)%23),                    // 7 to 29 px/s
  verticalAmp: 1.0 + ((i*17)%12)*0.34,       // separate drifting distances
  verticalFreq: 0.38 + ((i*11)%17)*0.065,   // separate wave timing
  phase: i*2.3999632,
  heading: (i%9===0 ? -1 : 1),             // a few fish travel the other way
  tilt: 0.015 + ((i*13)%9)*0.006,
  floatOffset: ((i*19)%9-4)*0.5
}));
// ========== UMBRELLA: gentle vortex around the center ==========
// All positions use the independent 512x512 umbrella texture, not screen pixels.
const UMBRELLA_SIZE = 512;
const UMBRELLA_FISH_COUNT = 20;
const UMBRELLA_ORBIT_SPEED = 1.0;  // Overall angular speed multiplier
const UMBRELLA_RADIAL_WANDER = 1.0; // How much paths drift toward/away from the center
const UMBRELLA_FISH_OPACITY = 170;
// Your supplied circular fish art stays intact, drifting as a soft ocean current.
// Separate small fish continue orbiting at individual speeds above it.
const UMBRELLA_RING_ROTATION_SPEED = 0.038; // radians/second (slow clockwise spin)
const UMBRELLA_RING_OPACITY = 232;           // original watercolor detail
const UMBRELLA_RING_SIZE = 1.0;             // 1.0 fills the 512x512 umbrella texture

// ===== UMBRELLA: INDIVIDUAL PLASTIC TRASH IN THE CURRENT =====
// Five isolated transparent PNGs; each item moves independently.
// All positions below are within the 512x512 umbrella texture.
const TRASH_ORBIT_SPEED = 1.0;     // overall orbit speed; 1.5 = 50% faster
const TRASH_DRIFT_AMOUNT = 1.0;   // inward/outward wobble multiplier
const TRASH_ROTATION_SPEED = 1.0; // individual self-rotation multiplier
const TRASH_OPACITY = 235;
const UMBRELLA_TRASH = [
  // key, start angle (radians), orbit radius, radians/second, width in pixels, initial tilt
  {key:"umbrellaTrash1", angle:-1.80, radius:158, speed:0.105, width:76, tilt:-0.25, phase:0.15, spin: 0.13},
  {key:"umbrellaTrash2", angle:-0.48, radius:183, speed:0.142, width:46, tilt: 0.20, phase:1.30, spin:-0.18},
  {key:"umbrellaTrash3", angle: 2.77, radius:172, speed:0.086, width:51, tilt:-0.38, phase:2.75, spin: 0.11},
  {key:"umbrellaTrash4", angle: 1.52, radius:164, speed:0.123, width:83, tilt: 0.12, phase:4.05, spin:-0.10},
  {key:"umbrellaTrash5", angle: 0.59, radius:169, speed:0.157, width:75, tilt: 0.30, phase:5.20, spin: 0.15}
];
// =============================================================

// Reuse the exact same isolated watercolor fish atlas as B+C.
// Stable variation: no random positions are regenerated on every frame.
const umbrellaFish = Array.from({ length: UMBRELLA_FISH_COUNT }, (_, i) => {
  const spriteIndex = (i * 19 + 3) % FISH_SPRITES.length;
  const sprite = FISH_SPRITES[spriteIndex];
  const ring = i % 4;
  const startAngle = i * 2.399963229728653; // golden angle, avoids evenly spaced rings
  const baseRadius = 69 + ring * 36 + ((i * 13) % 21 - 10);
  return {
    ...sprite,
    startAngle,
    baseRadius,
    angularSpeed: 0.095 + ((i * 17) % 20) * 0.0065, // 0.095–0.219 radians/s
    phase: i * 1.791,
    radialAmplitude: 4.5 + ((i * 7) % 12),
    radialFrequency: 0.21 + ((i * 9) % 12) * 0.038,
    wobble: 0.018 + ((i * 11) % 8) * 0.009,
    size: 0.62 + ((i * 5) % 10) * 0.055,
    // All fish follow the same general ocean current (clockwise),
    // but their individual speeds, radii and path curves differ.
  };
});
// =============================================================

// =============================================================

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  if (typeof createProjectionMapper !== "function") {
    showError("未加载 p5.mapper。请检查网络连接和 index.html 中的库地址。");
    noLoop();
    return;
  }

  pMapper = createProjectionMapper(this);

  // Only the umbrella and the top use p5.mapper surfaces.
  // B+C is a single, custom six-control-point textured surface below.
  surfaces.umbrella = pMapper.createPolyMap(10);
  surfaces.top = pMapper.createQuadMap(220, 160, 8, 6);

  umbrellaBuffer = createGraphics(UMBRELLA_SIZE, UMBRELLA_SIZE);
  umbrellaBuffer.pixelDensity(1);
  sharedBC = createGraphics(440, 220);
  sharedBC.imageMode(CORNER);
  for (let i = 0; i < 3; i++) {
    const layer = createGraphics(440, 220, WEBGL);
    layer.pixelDensity(1);
    coralMeshes.push(layer);
  }

  placeSurfacesSeparately();
  pMapper.startCalibration();
  pMapper.moveAll();
  sixCalibration = true;

  setupControls();
  loadImagesFromFolder();
  updatePanel();
}

function placeSurfacesSeparately() {
  const r = Math.max(90, Math.min(width * 0.16, height * 0.30, 185));
  const cx = -width * 0.27;
  const cy = height * 0.02;
  const points = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 10;
    points.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  surfaces.umbrella.setPoints(points);

  const startX = width * 0.06;
  const startY = -height * 0.26;
  surfaces.top.set({ x: startX, y: startY });

  const x0 = startX;
  const y0 = startY + 180;
  const w = 220;
  const h = 220;
  // Order: 0 TL, 1 TM, 2 TR, 3 BL, 4 BM, 5 BR.
  sixPoints = [
    { x: x0,       y: y0 },
    { x: x0 + w,   y: y0 },
    { x: x0 + 2*w, y: y0 },
    { x: x0,       y: y0 + h },
    { x: x0 + w,   y: y0 + h },
    { x: x0 + 2*w, y: y0 + h }
  ];
}

function loadImagesFromFolder() {
  for (const [key, filename] of Object.entries(IMAGE_FILES)) {
    images[key] = null;
    if (!filename) continue;
    loadImage(
      filename,
      (img) => {
        images[key] = img;
        delete imageErrors[key];
        updatePanel();
      },
      () => {
        imageErrors[key] = filename;
        updatePanel();
        console.warn("未找到图片：" + filename);
      }
    );
  }
}

// One connected textured mesh: adjacent triangles share the SAME warped vertices.
// No individually shifted rectangular image pieces, so no blue seams appear.
// 三层独立摆动；每一层内部的相邻三角形共享同一位置的顶点。
// 图片 840x444 会映射到共享的 440x220 B+C 纹理中。
function coralWarpPoint(x, y, layerIndex, mesh) {
  const w = mesh.width;
  const h = mesh.height;
  const nx = x / w;
  // Root remains anchored. Above ~40% height, sway becomes visibly stronger.
  const heightWeight = pow(Math.max(0, 1 - y / h), 1.35);
  // Nearby stems move smoothly, while far stems have different phases.
  // Keep spatial phase moderate to avoid folding the shared triangle mesh.
  const phase = coralSwayTime * CORAL_LAYER_SPEED[layerIndex] +
                nx * TWO_PI * 0.62 + CORAL_LAYER_PHASE[layerIndex];
  const current = 0.78 * sin(phase) + 0.22 * sin(phase * 1.63 + 0.7);
  const dx = CORAL_SWAY_AMOUNT * CORAL_LAYER_AMPLITUDE[layerIndex] * current * heightWeight;
  const dy = 1.6 * sin(phase * 0.8 + 0.5) * heightWeight;
  return { x: x - w / 2 + dx, y: y - h / 2 + dy, u: nx, v: y / h };
}

function drawCoralLayer(coralImg, layerIndex) {
  const mesh = coralMeshes[layerIndex];
  const w = mesh.width;
  const h = mesh.height;
  mesh.clear();
  mesh.push();
  mesh.noStroke();
  mesh.textureMode(NORMAL);
  mesh.texture(coralImg);
  mesh.beginShape(TRIANGLES);
  for (let row = 0; row < CORAL_ROWS; row++) {
    const y0 = row * h / CORAL_ROWS;
    const y1 = (row + 1) * h / CORAL_ROWS;
    for (let col = 0; col < CORAL_COLUMNS; col++) {
      const x0 = col * w / CORAL_COLUMNS;
      const x1 = (col + 1) * w / CORAL_COLUMNS;
      const a = coralWarpPoint(x0, y0, layerIndex, mesh);
      const b = coralWarpPoint(x1, y0, layerIndex, mesh);
      const c = coralWarpPoint(x1, y1, layerIndex, mesh);
      const d = coralWarpPoint(x0, y1, layerIndex, mesh);
      for (const p of [a,b,c,a,c,d]) mesh.vertex(p.x, p.y, 0, p.u, p.v);
    }
  }
  mesh.endShape();
  mesh.pop();
  return mesh;
}


function drawSwimmingFish() {
  const atlas = images.fish;
  if (!atlas) return;
  const w = sharedBC.width;
  const h = sharedBC.height;
  const seconds = millis() * 0.001;
  sharedBC.push();
  sharedBC.imageMode(CENTER);
  sharedBC.tint(255, FISH_OPACITY);

  // Each fish is separate: own speed, direction, vertical path and slight angle.
  for (const fish of fishActors) {
    const margin = Math.max(25, fish.width);
    const span = w + margin*2;
    const travel = fish.heading * fish.speed * seconds * FISH_SPEED_MULTIPLIER;
    const x = ((fish.x + margin + travel) % span + span) % span - margin;
    const y = fish.y + fish.floatOffset
      + Math.sin(seconds * fish.verticalFreq + fish.phase)
        * fish.verticalAmp * FISH_WANDER_MULTIPLIER
      + Math.sin(seconds * fish.verticalFreq * 0.43 + fish.phase*0.71)
        * 1.6 * FISH_WANDER_MULTIPLIER;
    const angle = Math.sin(seconds * fish.verticalFreq + fish.phase)
      * fish.tilt;

    sharedBC.push();
    sharedBC.translate(x, y);
    sharedBC.rotate(angle);
    if (fish.heading < 0) sharedBC.scale(-1, 1);
    // Source rectangle selects one isolated fish in the transparent atlas.
    sharedBC.image(atlas, 0, 0, fish.width, fish.height,
                   fish.sx, fish.sy, fish.sw, fish.sh);
    sharedBC.pop();
  }
  sharedBC.noTint();
  sharedBC.pop();
}

function drawSharedBC() {
  sharedBC.clear();

  // Base background for the shared B+C surface
  if (images.sides) {
    sharedBC.image(images.sides, 0, 0, sharedBC.width, sharedBC.height);
  }

  // 三层透明珊瑚独立摆动，按远到近顺序叠加在蓝色底图上。
  // 同一层内部是连续三角网格，不会出现分片之间的蓝色裂缝。
  for (let i = 0; i < 3; i++) {
    const coralImg = images["coral" + (i + 1)];
    if (!coralImg) continue;
    const warped = drawCoralLayer(coralImg, i);
    sharedBC.image(warped, 0, 0, sharedBC.width, sharedBC.height);
  }

  // Independent fish swim across the shared six-point B+C surface.
  if (images.fish) {
    drawSwimmingFish();
  }
}

// Ocean trash: orbit the umbrella center, but each piece has its own
// path, radial drift and gentle tumbling. Kept separate from the fish animation.
function drawUmbrellaTrash(g, seconds) {
  const cx = UMBRELLA_SIZE / 2;
  const cy = UMBRELLA_SIZE / 2;
  g.push();
  g.imageMode(CENTER);
  g.tint(255, TRASH_OPACITY);

  for (const item of UMBRELLA_TRASH) {
    const sprite = images[item.key];
    if (!sprite) continue;
    const theta = item.angle + seconds * item.speed * TRASH_ORBIT_SPEED
      + 0.055 * Math.sin(seconds * 0.47 + item.phase);
    const radius = item.radius
      + TRASH_DRIFT_AMOUNT * (8 * Math.sin(seconds * 0.32 + item.phase)
        + 3 * Math.sin(seconds * 0.69 + item.phase * 0.7));
    const ellipse = 0.91 + 0.035 * Math.sin(seconds * 0.21 + item.phase);
    const x = cx + Math.cos(theta) * radius;
    const y = cy + Math.sin(theta) * radius * ellipse;
    const tumble = item.tilt + seconds * item.spin * TRASH_ROTATION_SPEED
      + 0.18 * Math.sin(seconds * 0.52 + item.phase);
    const scalePulse = 1 + 0.045 * Math.sin(seconds * 0.44 + item.phase);
    const drawWidth = item.width * scalePulse;
    const drawHeight = drawWidth * sprite.height / sprite.width;

    g.push();
    g.translate(x, y);
    g.rotate(tumble);
    g.image(sprite, 0, 0, drawWidth, drawHeight);
    g.pop();
  }
  g.noTint();
  g.pop();
}

// Umbrella is ONE 10-point projection surface; the fish move inside its texture.
// Layer order: BLUE BASE -> INDEPENDENT ORBITING FISH -> FUTURE PLASTIC TRASH.
function drawUmbrella() {
  if (solidMode || !images.umbrella) {
    surfaces.umbrella.display(color(18, 170, 230));
    return;
  }

  const g = umbrellaBuffer;
  const seconds = millis() / 1000;
  g.clear();
  g.imageMode(CORNER);
  g.image(images.umbrella, 0, 0, UMBRELLA_SIZE, UMBRELLA_SIZE);

  // New supplied fish-ring artwork: preserves its transparent center and contour.
  // A gentle rotational drift adds motion without warping/distorting the painted fish.
  if (images.umbrellaFishRing) {
    g.push();
    g.imageMode(CENTER);
    g.translate(UMBRELLA_SIZE / 2, UMBRELLA_SIZE / 2);
    const drift = 0.018 * Math.sin(seconds * 0.35);
    g.rotate(seconds * UMBRELLA_RING_ROTATION_SPEED + drift);
    g.tint(255, UMBRELLA_RING_OPACITY);
    const sz = UMBRELLA_SIZE * UMBRELLA_RING_SIZE;
    g.image(images.umbrellaFishRing, 0, 0, sz, sz);
    g.noTint();
    g.pop();
  }

  // Individual fish are not locked to the ring: varied angular speeds and radii.
  if (images.fish) {
    g.push();
    g.imageMode(CENTER);
    g.tint(255, UMBRELLA_FISH_OPACITY);
    const centerX = UMBRELLA_SIZE * 0.5;
    const centerY = UMBRELLA_SIZE * 0.5;

    for (const fish of umbrellaFish) {
      const theta = fish.startAngle + seconds * fish.angularSpeed * UMBRELLA_ORBIT_SPEED
        + 0.065 * Math.sin(seconds * 0.30 + fish.phase);
      const radius = fish.baseRadius
        + fish.radialAmplitude * UMBRELLA_RADIAL_WANDER
          * Math.sin(seconds * fish.radialFrequency + fish.phase)
        + 2.5 * Math.sin(2 * theta + fish.phase);
      // The changing vertical scale makes the routes slightly oval rather than perfect circles.
      const oval = 0.92 + 0.035 * Math.sin(seconds * 0.16 + fish.phase);
      const x = centerX + Math.cos(theta) * radius;
      const y = centerY + Math.sin(theta) * radius * oval;

      // Direction of travel is tangent to the vortex path, with a slight body wiggle.
      const tangentAngle = Math.atan2(Math.cos(theta) * oval, -Math.sin(theta));
      const heading = tangentAngle
        + Math.sin(seconds * (0.7 + fish.angularSpeed) + fish.phase) * fish.wobble;

      g.push();
      g.translate(x, y);
      g.rotate(heading);
      const drawWidth = Math.min(38, fish.width * fish.size);
      const drawHeight = drawWidth * fish.sh / fish.sw;
      g.image(images.fish, 0, 0, drawWidth, drawHeight,
              fish.sx, fish.sy, fish.sw, fish.sh);
      g.pop();
    }
    g.noTint();
    g.pop();
  }

  // Last umbrella layer: independently orbiting plastic trash, over the fish.
  drawUmbrellaTrash(g, seconds);
  surfaces.umbrella.displayTexture(g);
}

function draw() {
  background(0);
  if (!pMapper) return;

  coralSwayTime += CORAL_SWAY_SPEED;

  drawUmbrella();
  drawSurface("top", color(248, 198, 75));

  if (!solidMode && images.sides) {
    drawSharedBC();
    drawSixPointTexture(sharedBC);
  } else {
    // One solid-colored surface, still divided geometrically at its midpoint.
    drawSixPointColor();
  }

  if (sixCalibration) drawSixPointHandles();
}

function drawSurface(key, testColor) {
  const img = images[key];
  if (!solidMode && img) surfaces[key].displayTexture(img);
  else surfaces[key].display(testColor);
}

// ONE textured mesh. The center points (1 and 4) are shared by BOTH halves,
// so there is no duplicated seam or independent left/right surfaces.
function drawSixPointTexture(textureImage) {
  push();
  noStroke();
  textureMode(NORMAL);
  texture(textureImage);
  beginShape(TRIANGLES);

  // First half: UV 0..0.5, two triangles.
  meshVertex(0, 0, 0);
  meshVertex(1, 0.5, 0);
  meshVertex(4, 0.5, 1);
  meshVertex(0, 0, 0);
  meshVertex(4, 0.5, 1);
  meshVertex(3, 0, 1);

  // Second half: UV 0.5..1, two triangles.
  meshVertex(1, 0.5, 0);
  meshVertex(2, 1, 0);
  meshVertex(5, 1, 1);
  meshVertex(1, 0.5, 0);
  meshVertex(5, 1, 1);
  meshVertex(4, 0.5, 1);

  endShape();
  pop();
}

function meshVertex(pointIndex, u, v) {
  const p = sixPoints[pointIndex];
  vertex(p.x, p.y, 0, u, v);
}

function drawSixPointColor() {
  push();
  noStroke();
  fill(20, 110, 185);
  beginShape(TRIANGLES);
  for (const triangle of [[0,1,4], [0,4,3], [1,2,5], [1,5,4]]) {
    for (const i of triangle) {
      vertex(sixPoints[i].x, sixPoints[i].y, 0);
    }
  }
  endShape();
  pop();
}

function drawSixPointHandles() {
  push();
  stroke(255, 255, 255, 190);
  strokeWeight(1.5);
  noFill();
  // The user-facing grid is one rectangle, with a center column.
  for (const edge of [[0,1],[1,2],[3,4],[4,5],[0,3],[1,4],[2,5]]) {
    const a = sixPoints[edge[0]];
    const b = sixPoints[edge[1]];
    line(a.x, a.y, 3, b.x, b.y, 3);
  }
  noStroke();
  for (let i = 0; i < sixPoints.length; i++) {
    push();
    const p = sixPoints[i];
    translate(p.x, p.y, 5);
    fill(i === draggingPoint ? color(255, 210, 60) : color(0, 130, 255));
    circle(0, 0, POINT_RADIUS * 1.8);
    fill(255);
    circle(0, 0, POINT_RADIUS * 0.8);
    pop();
  }
  pop();
}

// p5 WEBGL has center-origin, while mouseX/mouseY use upper-left origin.
function mousePressed() {
  if (!sixCalibration) return;
  const x = mouseX - width / 2;
  const y = mouseY - height / 2;
  for (let i = 0; i < sixPoints.length; i++) {
    if (dist(x, y, sixPoints[i].x, sixPoints[i].y) <= POINT_RADIUS * 1.8) {
      draggingPoint = i;
      return false;
    }
  }
}
function mouseDragged() {
  if (draggingPoint === -1 || !sixCalibration) return;
  sixPoints[draggingPoint].x = mouseX - width / 2;
  sixPoints[draggingPoint].y = mouseY - height / 2;
  return false;
}
function mouseReleased() {
  draggingPoint = -1;
}

function setupControls() {
  document.getElementById("modeBtn").addEventListener("click", toggleMode);
  document.getElementById("calibBtn").addEventListener("click", toggleCalibration);
  document.getElementById("saveBtn").addEventListener("click", saveCalibration);
  window.addEventListener("keydown", (event) => {
    if (event.repeat || !pMapper) return;
    const k = event.key.toLowerCase();
    if (!["t", "c", "s", "l", "f", "h"].includes(k)) return;
    event.preventDefault();
    if (k === "t") toggleMode();
    if (k === "c") toggleCalibration();
    if (k === "s") saveCalibration();
    if (k === "l") loadCalibration();
    if (k === "f") toggleFullscreen();
    if (k === "h") {
      panelVisible = !panelVisible;
      document.getElementById("panel").style.display = panelVisible ? "block" : "none";
    }
  });
}
function toggleMode() {
  solidMode = !solidMode;
  updatePanel();
}
function toggleCalibration() {
  pMapper.toggleCalibration();
  sixCalibration = !sixCalibration;
  draggingPoint = -1;
  updatePanel();
}

// Saving requires TWO files because the six-point surface is custom geometry.
function saveCalibration() {
  pMapper.save("map.json"); // Umbrella and top (p5.mapper)
  const data = { version: 1, points: sixPoints.map(p => ({ x: p.x, y: p.y })) };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sides-six-points.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  console.log("已保存两个文件：map.json + sides-six-points.json。请把它们放进 maps/ 文件夹。");
}
function loadCalibration() {
  pMapper.load("maps/map.json", () => console.log("伞面和顶面校准已加载"));
  fetch("maps/sides-six-points.json")
    .then(res => {
      if (!res.ok) throw new Error("找不到六点校准文件");
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data.points) || data.points.length !== 6 ||
          !data.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) {
        throw new Error("六点校准数据格式不正确");
      }
      sixPoints = data.points.map(p => ({ x: p.x, y: p.y }));
      console.log("B+C 六点校准已加载");
    })
    .catch(err => console.warn("B+C 保持当前六点位置：" + err.message));
}
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(console.warn);
}
function showError(message) {
  const el = document.getElementById("warning");
  if (el) el.textContent = message;
  console.error(message);
}
function updatePanel() {
  const loaded = ["umbrella", "umbrellaFishRing", "umbrellaPlastic", "top", "sides", "coral1", "coral2", "coral3", "fish"].filter(k => !!images[k]).length;
  const modeName = solidMode ? "纯色测试" : "本地图片";
  document.getElementById("status").textContent =
    `当前：${modeName} | 六点校准：${sixCalibration ? "开启" : "关闭"} | 已加载 ${loaded} 张图片/图层\nB+C 共用连续底图，六个点独立可调\n珊瑚：三层分别摆动，底部固定\n伞面：背景 → 中心环游鱼群 → 预留塑料垃圾层`;
  document.getElementById("modeBtn").textContent = solidMode ? "显示图片 (T)" : "纯色测试 (T)";
  document.getElementById("calibBtn").textContent = sixCalibration ? "关闭校准 (C)" : "开启校准 (C)";
  const missing = Object.values(imageErrors);
  document.getElementById("warning").textContent = missing.length
    ? `找不到：${missing.join(", ")}。请将图片放在 index.html 同级目录。` : "";
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // After changing display resolution, re-calibrate all surfaces.
}
