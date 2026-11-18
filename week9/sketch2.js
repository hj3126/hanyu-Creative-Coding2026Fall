

let handPose, video, hands = [];
let backgroundImg, corals = [], coralMeshes = [];
let fish;
let smoothFinger = null;

// Settings
const BACKGROUND_OPACITY = 0.65;
const SMOOTH_AMOUNT = 0.3;
const PINCH_DISTANCE = 25;

const CORAL_HEIGHT = 338;
const CORAL_COLUMNS = 20;
const CORAL_ROWS = 10;
const CORAL_SWAY_SPEED = 0.030;
const CORAL_SWAY_AMOUNT = 22;

const CORAL_LAYER_SPEED = [0.78, 1.0, 1.23];
const CORAL_LAYER_AMPLITUDE = [0.8, 1.0, 1.18];
const CORAL_LAYER_PHASE = [0, 1.8, 3.4];




function preload() {
  backgroundImg = loadImage('assets/BC_background.png');

  for (let i = 1; i <= 3; i++) {
    corals.push(loadImage(`assets/coral_${i}.png`));
  }
}




async function setup() {
  createCanvas(640, 480);

  fish = new Fish(width / 2, height / 2);

  
  for (let i = 0; i < 3; i++) {
    let layer = createGraphics(width, CORAL_HEIGHT, WEBGL);
    layer.pixelDensity(1);
    coralMeshes.push(layer);
  }


  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();


  handPose = await ml5.handPose({
    maxHands: 1,
    flipped: true
  });

  handPose.detectStart(video, gotHands);
}


// DRAW

function draw() {
  background(5, 35, 75);


  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  tint(255, BACKGROUND_OPACITY * 255);
  image(backgroundImg, 0, 0, width, height);
  noTint();


  for (let i = 0; i < 3; i++) {
    drawCoralLayer(i);
  }

  // Default: fish swims freely
  let target = createVector(
    width / 2 + sin(frameCount * 0.012) * 220,
    height / 2 + sin(frameCount * 0.017) * 140
  );

  let pinch = false;
  let thumb, index;


  if (hands.length > 0) {
    thumb = hands[0].keypoints[4];
    index = hands[0].keypoints[8];

    pinch = dist(
      thumb.x, thumb.y,
      index.x, index.y
    ) < PINCH_DISTANCE;


    if (smoothFinger === null) {
      smoothFinger = createVector(index.x, index.y);
    }

    smoothFinger.x = lerp(
      smoothFinger.x,
      index.x,
      SMOOTH_AMOUNT
    );

    smoothFinger.y = lerp(
      smoothFinger.y,
      index.y,
      SMOOTH_AMOUNT
    );

    target = smoothFinger.copy();
  } else {
    smoothFinger = null;
  }

  // Fish follows or escapes
  if (pinch) {
    fish.flee(target);
  } else {
    fish.seek(target);
  }

  fish.update();
  fish.display();

  // Hand markers
  if (thumb && index) {
    noStroke();


    fill(130, 240, 255);
    circle(thumb.x, thumb.y, 12);

    // Index finger
    fill(255, 175, 175);
    circle(index.x, index.y, 12);

    // pinching
    if (pinch) {
      stroke(0, 120, 255);
      strokeWeight(3);

      line(
        thumb.x, thumb.y,
        index.x, index.y
      );
    }
  }
}




function coralWarpPoint(x, y, layer) {
  const nx = x / width;

  const weight = pow(
    max(0, 1 - y / CORAL_HEIGHT),
    1.35
  );

  const phase =
    frameCount * CORAL_SWAY_SPEED *
    CORAL_LAYER_SPEED[layer]
    + nx * TWO_PI * 0.62
    + CORAL_LAYER_PHASE[layer];

  const wave =
    0.78 * sin(phase) +
    0.22 * sin(phase * 1.63 + 0.7);

  const dx =
    CORAL_SWAY_AMOUNT *
    CORAL_LAYER_AMPLITUDE[layer] *
    wave * weight;

  const dy =
    1.2 * sin(phase * 0.8 + 0.5) * weight;

  return {
    x: x - width / 2 + dx,
    y: y - CORAL_HEIGHT / 2 + dy,
    u: nx,
    v: y / CORAL_HEIGHT
  };
}


// coral

function drawCoralLayer(layerIndex) {
  const mesh = coralMeshes[layerIndex];
  const img = corals[layerIndex];

  mesh.clear();
  mesh.push();
  mesh.noStroke();
  mesh.textureMode(NORMAL);
  mesh.texture(img);
  mesh.beginShape(TRIANGLES);

  for (let row = 0; row < CORAL_ROWS; row++) {
    const y0 = row * CORAL_HEIGHT / CORAL_ROWS;
    const y1 = (row + 1) * CORAL_HEIGHT / CORAL_ROWS;

    for (let col = 0; col < CORAL_COLUMNS; col++) {
      const x0 = col * width / CORAL_COLUMNS;
      const x1 = (col + 1) * width / CORAL_COLUMNS;

      const a = coralWarpPoint(x0, y0, layerIndex);
      const b = coralWarpPoint(x1, y0, layerIndex);
      const c = coralWarpPoint(x1, y1, layerIndex);
      const d = coralWarpPoint(x0, y1, layerIndex);

      for (const p of [a, b, c, a, c, d]) {
        mesh.vertex(p.x, p.y, 0, p.u, p.v);
      }
    }
  }

  mesh.endShape();
  mesh.pop();

  image(
    mesh,
    0,
    height - CORAL_HEIGHT,
    width,
    CORAL_HEIGHT
  );
}




function gotHands(results) {
  hands = results;
}




class Fish {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(1, 0);
    this.acceleration = createVector(0, 0);

    this.maxSpeed = 3;
    this.maxForce = 0.12;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  // Follow 
  seek(target) {
    const desired = p5.Vector.sub(
      target,
      this.position
    );

    const distance = desired.mag();

    if (distance < 1) return;

    let speed = this.maxSpeed;

    if (distance < 100) {
      speed = map(
        distance,
        0,
        100,
        0,
        this.maxSpeed
      );
    }

    desired.setMag(speed);

    const steer = p5.Vector.sub(
      desired,
      this.velocity
    );

    steer.limit(this.maxForce);
    this.applyForce(steer);
  }


  flee(target) {
    const desired = p5.Vector.sub(
      this.position,
      target
    );

    if (desired.mag() < 1) {
      desired.set(1, 0);
    }

    desired.setMag(this.maxSpeed * 1.7);

    const steer = p5.Vector.sub(
      desired,
      this.velocity
    );

    steer.limit(this.maxForce * 2.5);
    this.applyForce(steer);
  }


  update() {
    this.velocity.add(this.acceleration);

    this.velocity.limit(
      this.maxSpeed * 1.7
    );

    this.position.add(this.velocity);
    this.acceleration.mult(0);

    this.position.x = constrain(
      this.position.x,
      50,
      width - 50
    );

    this.position.y = constrain(
      this.position.y,
      40,
      height - 40
    );
  }

  display() {
    push();

    translate(
      this.position.x,
      this.position.y
    );

    rotate(this.velocity.heading());
    noStroke();

    // Tail animation
    const tailMove =
      sin(frameCount * 0.25) * 12;

    // Tail
    fill(65, 180, 230);
    triangle(
      -23, 0,
      -48, -19 + tailMove,
      -48, 19 + tailMove
    );

    // Body
    fill(105, 215, 240);
    ellipse(0, 0, 64, 32);

    pop();
  }
}
