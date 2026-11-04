// This is the only setup(), draw(), and input system loaded by index.html.
// The five files in scenes/ only create/update offscreen artwork.
const LAYOUT_SCHEMA = "nyu-ocean-projection/v1";
const DRAFT_KEY = "nyu-ocean-projection-layout-v1";
const entries = [];
let pMapper;
let ready = false;
let calibrating = false;
let testMode = false;
let paused = false;
let selection = "all";
let oceanVariant = "white";
let panelHover = false;
let customDrag = null;

async function setup() {
  try {
    if (typeof createProjectionMapper !== "function") {
      throw new Error("p5.mapper 没有加载。请检查 vendor/ 文件夹是否完整。");
    }
    const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.elt.style.touchAction = "none";
    pixelDensity(1);
    frameRate(30);
    randomSeed(26);
    pMapper = createProjectionMapper(this);
    pMapper.moveAll();
    pMapper.stopCalibration();

    OceanScenes.nora.init();
    OceanScenes.yukiFishbone.init();
    OceanScenes.yukiOceanColor.init();
    OceanScenes.yukiOceanWhite.init();
    await OceanScenes.hanni.init();

    addSurface("nora-balloon", "01 Nora · 气球潮水", 600, 600, "quad",
      () => OceanScenes.nora.render("balloon"));
    addSurface("nora-vase", "02 Nora · 花瓶水母", 420, 620, "quad",
      () => OceanScenes.nora.render("vase"));
    addSurface("hanni-umbrella", "03 Hanni · 伞面鱼群与垃圾", 512, 512, "poly",
      () => OceanScenes.hanni.render("umbrella"));
    addSurface("hanni-top", "04 Hanni · 立方体顶面", 220, 160, "quad",
      () => OceanScenes.hanni.render("top"));
    addSurface("hanni-sides", "05 Hanni · 连续侧面 B+C（六点）", 440, 220, "six",
      () => OceanScenes.hanni.render("sides"));
    addSurface("yuki-fishbone", "06 Yuki · 鱼骨", 400, 400, "quad",
      () => OceanScenes.yukiFishbone.render());
    for (let i = 0; i < 3; i++) {
      addSurface("yuki-ocean-" + i, "0" + (7 + i) + " Yuki · 海面 " + (i + 1),
        400, 400, "quad", () => currentOcean().textures()[i]);
    }
    addSurface("yuki-waterfall", "10 Yuki · 瀑布", 400, 400, "quad",
      () => currentOcean().textures()[3]);

    placeOverview();
    setupControls();
    ready = true;
    let restored = false;
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) { applyLayout(JSON.parse(draft)); restored = true; }
    } catch (error) {
      console.warn("本地布局未恢复：", error.message);
    }
    updateButtons();
    if (!restored) setStatus("已加载 10 个投影区域。先全屏，再单独选择一个区域，按 C 校准。按 H 隐藏面板。");
  } catch (error) {
    console.error(error);
    setStatus("启动失败：" + error.message + "\n请用 Live Server 打开本文件夹内的 index.html。", true);
  }
}

function currentOcean() {
  return oceanVariant === "color" ? OceanScenes.yukiOceanColor : OceanScenes.yukiOceanWhite;
}

function addSurface(id, label, w, h, kind, render) {
  let map;
  if (kind === "six") map = new SixPointMap();
  else if (kind === "poly") map = pMapper.createPolyMap(10);
  else map = pMapper.createQuadMap(w, h, 12, 12);
  const test = createGraphics(w, h);
  test.pixelDensity(1);
  test.background("#0022FF");
  test.noFill();
  test.stroke(255);
  test.strokeWeight(3);
  test.rect(3, 3, w - 6, h - 6);
  test.line(w / 2, 0, w / 2, h);
  test.line(0, h / 2, w, h / 2);
  test.noStroke();
  test.fill(255);
  test.textAlign(CENTER, CENTER);
  test.textFont("sans-serif");
  test.textSize(Math.min(w, h) * 0.065);
  test.text(label, w / 2, h * 0.3);
  entries.push({ id, label, w, h, kind, map, render, test });
}

function isVisible(entry) { return selection === "all" || selection === entry.id; }

function draw() {
  background(0);
  if (!ready) return;

  // Limit the mapper's calibration and mouse events to the visible regions.
  // All map objects remain in entries, including when hidden.
  pMapper.surfaces = entries.filter(e => e.kind !== "six" && isVisible(e)).map(e => e.map);
  syncCalibration();
  const dt = paused ? 0 : min(deltaTime, 50) / 1000;
  OceanScenes.nora.update(dt);
  OceanScenes.hanni.update(dt);
  OceanScenes.yukiFishbone.update(dt);
  const showOcean = !testMode && entries.some(e =>
    (e.id.startsWith("yuki-ocean-") || e.id === "yuki-waterfall") && isVisible(e));
  OceanScenes.yukiOceanColor.update(dt, showOcean && oceanVariant === "color");
  OceanScenes.yukiOceanWhite.update(dt, showOcean && oceanVariant === "white");

  for (const entry of entries) {
    if (!isVisible(entry)) continue;
    push();
    entry.map.displayTexture(testMode ? entry.test : entry.render());
    pop();
  }
  if (calibrating) {
    for (const entry of entries) {
      if (entry.kind === "six" && isVisible(entry)) entry.map.displayHandles();
    }
  }
}

function syncCalibration() {
  if (!pMapper) return;
  if (calibrating && !panelHover && !customDrag) pMapper.startCalibration();
  else pMapper.stopCalibration();
}

function placeOverview() {
  const columns = width >= 1500 ? 5 : width >= 850 ? 4 : 2;
  const rows = Math.ceil(entries.length / columns);
  const top = Math.min(160, height * 0.26);
  const cellW = width / columns;
  const cellH = Math.max(30, (height - top - 16) / rows);
  entries.forEach((entry, index) => {
    const scale = Math.min((cellW - 20) / entry.w, (cellH - 20) / entry.h);
    const w = Math.max(10, entry.w * scale);
    const h = Math.max(10, entry.h * scale);
    const x = -width / 2 + (index % columns) * cellW + (cellW - w) / 2;
    const y = -height / 2 + top + Math.floor(index / columns) * cellH + (cellH - h) / 2;
    if (entry.kind === "six") entry.map.setRect(x, y, w, h);
    else if (entry.kind === "poly") {
      entry.map.set({ x: 0, y: 0 });
      entry.map.setPoints(Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 10;
        return { x: x + w / 2 + Math.cos(a) * w / 2, y: y + h / 2 + Math.sin(a) * h / 2 };
      }));
    } else {
      const nx = entry.map.res;
      const ny = entry.map.resY || nx;
      entry.map.load({ x, y, points: [
        { i: 0, x: 0, y: 0, u: 0, v: 0 },
        { i: nx - 1, x: w, y: 0, u: 1, v: 0 },
        { i: (ny - 1) * nx, x: 0, y: h, u: 0, v: 1 },
        { i: nx * ny - 1, x: w, y: h, u: 1, v: 1 }
      ] });
    }
  });
}

// Hanni's B+C still shares the two center vertices; its halves cannot split.
class SixPointMap {
  constructor() { this.points = []; }
  setRect(x, y, w, h) {
    this.points = [
      { x, y }, { x: x + w / 2, y }, { x: x + w, y },
      { x, y: y + h }, { x: x + w / 2, y: y + h }, { x: x + w, y: y + h }
    ];
  }
  displayTexture(image) {
    noStroke();
    textureMode(NORMAL);
    texture(image);
    beginShape(TRIANGLES);
    for (const [index, u, v] of [
      [0,0,0], [1,0.5,0], [4,0.5,1], [0,0,0], [4,0.5,1], [3,0,1],
      [1,0.5,0], [2,1,0], [5,1,1], [1,0.5,0], [5,1,1], [4,0.5,1]
    ]) {
      const p = this.points[index];
      vertex(p.x, p.y, 0, u, v);
    }
    endShape();
  }
  displayHandles() {
    push();
    stroke(255);
    strokeWeight(1.5);
    for (const [a, b] of [[0,1],[1,2],[3,4],[4,5],[0,3],[1,4],[2,5]]) {
      line(this.points[a].x, this.points[a].y, 3, this.points[b].x, this.points[b].y, 3);
    }
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      push();
      translate(p.x, p.y, 5);
      fill("#0022FF");
      circle(0, 0, 18);
      pop();
    }
    pop();
  }
  toJSON() { return { points: this.points.map(p => ({ ...p })) }; }
  load(data) { this.points = data.points.map(p => ({ x: p.x, y: p.y })); }
}

function mousePressed(event) {
  if (!ready || !calibrating || event?.target?.closest?.("#panel")) return;
  const x = mouseX - width / 2, y = mouseY - height / 2;
  const custom = entries.find(e => e.kind === "six" && isVisible(e));
  if (!custom) return;
  const point = custom.map.points.findIndex(p => Math.hypot(p.x - x, p.y - y) < 15);
  if (point >= 0) {
    customDrag = { map: custom.map, point };
    syncCalibration();
    return false;
  }
}

function mouseDragged() {
  if (!customDrag) return;
  customDrag.map.points[customDrag.point] = { x: mouseX - width / 2, y: mouseY - height / 2 };
  return false;
}

function mouseReleased() {
  customDrag = null;
  syncCalibration();
  if (ready) setTimeout(saveDraft, 0);
}

function getLayout() {
  return {
    schema: LAYOUT_SCHEMA,
    viewport: { width, height },
    oceanVariant,
    surfaces: entries.map(e => ({ id: e.id, kind: e.kind, data: e.map.toJSON() }))
  };
}

function validateLayout(data) {
  if (data?.schema !== LAYOUT_SCHEMA || !Array.isArray(data.surfaces)) {
    throw new Error("这不是整合版的校准文件；请使用本页面保存的 ocean-projection-map.json。");
  }
  if (data.surfaces.length !== entries.length) throw new Error("校准文件的投影面数量不匹配。");
  for (const entry of entries) {
    const item = data.surfaces.find(s => s.id === entry.id);
    const points = item?.data?.points;
    if (!item || item.kind !== entry.kind || !Array.isArray(points) ||
        points.length < 3 || !points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) {
      throw new Error("校准数据不完整：" + entry.label);
    }
    if (entry.kind === "six" && points.length !== 6) throw new Error("B+C 需要六个校准点。");
    if (entry.kind !== "six" && (!Number.isFinite(item.data.x) || !Number.isFinite(item.data.y))) {
      throw new Error("投影面位置无效：" + entry.label);
    }
    if (entry.kind === "quad" && !points.every(p => Number.isInteger(p.i) && p.i >= 0 && p.i < entry.map.res * (entry.map.resY || entry.map.res) && Number.isFinite(p.u) && Number.isFinite(p.v))) {
      throw new Error("四角网格数据无效：" + entry.label);
    }
  }
}

function applyLayout(data) {
  validateLayout(data);
  for (const entry of entries) entry.map.load(data.surfaces.find(s => s.id === entry.id).data);
  oceanVariant = data.oceanVariant === "color" ? "color" : "white";
  document.getElementById("variant").value = oceanVariant;
  const changed = data.viewport && (data.viewport.width !== width || data.viewport.height !== height);
  setStatus(changed ? "布局已加载。显示分辨率与保存时不同，请重新检查投影位置。" : "全部校准位置已加载。");
}

function saveDraft() {
  if (!ready) return;
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(getLayout())); }
  catch (error) { console.warn("布局未缓存：", error.message); }
}

function saveLayout() {
  if (!ready) return;
  saveDraft();
  const url = URL.createObjectURL(new Blob([JSON.stringify(getLayout(), null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "ocean-projection-map.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus("已下载 ocean-projection-map.json，包含全部投影面和 B+C 六点位置。");
}

function selectSurface(value) {
  selection = value;
  customDrag = null;
  pMapper.dragged = null;
  pMapper.selected = null;
  document.getElementById("surface").value = selection;
}

function setupControls() {
  const selector = document.getElementById("surface");
  for (const entry of entries) {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.label;
    selector.appendChild(option);
  }
  selector.addEventListener("change", () => { selectSurface(selector.value); selector.blur(); });
  document.getElementById("variant").addEventListener("change", event => {
    oceanVariant = event.target.value;
    saveDraft();
    event.target.blur();
  });
  document.getElementById("calibrate").onclick = toggleCalibration;
  document.getElementById("test").onclick = () => { testMode = !testMode; updateButtons(); };
  document.getElementById("save").onclick = saveLayout;
  document.getElementById("load").onclick = () => document.getElementById("map-file").click();
  document.getElementById("fullscreen").onclick = toggleFullscreen;
  document.getElementById("pause").onclick = () => { paused = !paused; updateButtons(); };
  document.getElementById("hide").onclick = togglePanel;
  document.getElementById("map-file").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (file) {
      try { applyLayout(JSON.parse(await file.text())); saveDraft(); }
      catch (error) { setStatus("未加载：" + error.message, true); }
    }
    event.target.value = "";
  });
  const panel = document.getElementById("panel");
  panel.addEventListener("pointerenter", () => { panelHover = true; syncCalibration(); });
  panel.addEventListener("pointerleave", () => { panelHover = false; syncCalibration(); });
  document.querySelectorAll("button").forEach(button => button.addEventListener("click", () => button.blur()));
  window.addEventListener("beforeunload", saveDraft);
}

function toggleCalibration() {
  calibrating = !calibrating;
  customDrag = null;
  syncCalibration();
  updateButtons();
}

function togglePanel() {
  const panel = document.getElementById("panel");
  panel.hidden = !panel.hidden;
  panelHover = false;
  syncCalibration();
}

function toggleFullscreen() {
  const result = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  result?.catch(error => setStatus("全屏未打开：" + error.message, true));
}

function updateButtons() {
  for (const id of ["calibrate", "test", "save", "load", "pause"]) document.getElementById(id).disabled = !ready;
  document.getElementById("calibrate").textContent = (calibrating ? "关闭校准" : "校准") + " C";
  document.getElementById("test").textContent = (testMode ? "显示作品" : "测试图") + " T";
  document.getElementById("pause").textContent = (paused ? "继续" : "暂停") + " Space";
}

function setStatus(message, error = false) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.classList.toggle("error", error);
}

function keyPressed(event) {
  if (!ready || /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(document.activeElement?.tagName || "")) return;
  const k = (event?.key || key).toLowerCase();
  if (k === "c") toggleCalibration();
  else if (k === "t") { testMode = !testMode; updateButtons(); }
  else if (k === "f") toggleFullscreen();
  else if (k === "h") togglePanel();
  else if (k === "s") saveLayout();
  else if (k === "l") document.getElementById("map-file").click();
  else if (k === " ") { paused = !paused; updateButtons(); }
  else if (k === "0") selectSurface("all");
  else if (/^[1-9]$/.test(k)) selectSurface(entries[Number(k) - 1].id);
  else if (k === "r") {
    if (window.confirm("将所有投影位置重排为预览布局？动画内容不变。")) {
      placeOverview(); saveDraft(); setStatus("已重排为预览布局。");
    }
  } else return;
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (ready) setStatus("窗口尺寸已改变。校准位置没有自动重排，请检查后再保存。");
}

window.addEventListener("error", event => setStatus("运行错误：" + event.message + "\n请查看浏览器控制台。", true));
window.addEventListener("unhandledrejection", event => setStatus("加载错误：" + (event.reason?.message || event.reason), true));
