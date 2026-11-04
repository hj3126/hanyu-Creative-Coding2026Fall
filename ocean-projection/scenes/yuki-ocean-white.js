window.OceanScenes = window.OceanScenes || {};
OceanScenes.yukiOceanWhite = (() => {



let ocean;
let ocean1, ocean2, ocean3;
let waterfall;

let fishX = [];
let fishY = [];
let fishSize = [];
let fishSpeed = [];
let fishDirection = [];

let dropX = [];
let dropY = [];
let dropSpeedX = [];
let dropSpeedY = [];

let time = 0;
let moving = true;
let splashTimer = 0;

function init() {
  ocean = createGraphics(1200, 400);
  ocean1 = createGraphics(400, 400);
  ocean2 = createGraphics(400, 400);
  ocean3 = createGraphics(400, 400);
  waterfall = createGraphics(400, 400);

  for (let i = 0; i < 80; i++) {
    fishX[i] = random(1200);
    fishY[i] = random(125, 370);
    fishSize[i] = random(18, 48);
    fishSpeed[i] = random(35, 80);
    fishDirection[i] = random([-1, 1]);
  }

  for (const pg of [ocean, ocean1, ocean2, ocean3, waterfall]) pg.pixelDensity(1);
}
function update(dt, renderFrame = true) {


  let seconds = dt;

  if (moving) {
    time += seconds;

    for (let i = 0; i < fishX.length; i++) {
      fishX[i] += fishSpeed[i] * fishDirection[i] * seconds;

      if (fishX[i] > 1260) {
        fishX[i] = -60;
      }

      if (fishX[i] < -60) {
        fishX[i] = 1260;
      }
    }

    splashTimer += seconds;

    if (splashTimer >= 0.5) {
      splashTimer = 0;
      createSplash();
    }

    for (let i = dropX.length - 1; i >= 0; i--) {
      dropX[i] += dropSpeedX[i] * seconds;
      dropY[i] += dropSpeedY[i] * seconds;
      dropSpeedY[i] += 320 * seconds;

      if (dropY[i] >= waterHeight(dropX[i]) && dropSpeedY[i] > 0) {
        dropX.splice(i, 1);
        dropY.splice(i, 1);
        dropSpeedX.splice(i, 1);
        dropSpeedY.splice(i, 1);
      }
    }
  }

  if (renderFrame) { drawOcean(); drawWaterfall(); }





}
function waterHeight(x) {
  return (
    72 +
    sin(x * 0.025 + time * 1.8) * 14 +
    sin(x * 0.055 - time * 2.2) * 6
  );
}

function createSplash() {
  let x = random(20, 1180);
  let y = waterHeight(x);

  for (let i = 0; i < 3; i++) {
    dropX.push(x);
    dropY.push(y);
    dropSpeedX.push(random(-45, 45));
    dropSpeedY.push(random(-150, -80));
  }
}

function drawOcean() {
  ocean.background(0);
  ocean.noStroke();
  ocean.fill("#0022FF");

  ocean.beginShape();
  ocean.vertex(0, 400);

  for (let x = 0; x <= 1200; x += 6) {
    ocean.vertex(x, waterHeight(x));
  }

  ocean.vertex(1200, 400);
  ocean.endShape(CLOSE);

  ocean.noFill();
  ocean.stroke(150, 225, 255, 150);
  ocean.strokeWeight(2);
  ocean.beginShape();

  for (let x = 0; x <= 1200; x += 6) {
    ocean.vertex(x, waterHeight(x));
  }

  ocean.endShape();

  ocean.stroke(100, 215, 255, 65);
  ocean.strokeWeight(1);
  ocean.beginShape();

  for (let x = 0; x <= 1200; x += 6) {
    ocean.vertex(
      x,
      waterHeight(x) + 12 + sin(x * 0.04 - time * 3) * 3
    );
  }

  ocean.endShape();

  ocean.stroke(110, 190, 255, 35);

  for (let y = 140; y < 400; y += 55) {
    ocean.beginShape();

    for (let x = 0; x <= 1200; x += 10) {
      ocean.vertex(
        x,
        y + sin(x * 0.025 + time * 1.4 + y) * 7
      );
    }

    ocean.endShape();
  }

  for (let i = 0; i < 50; i++) {
    let x = (i * 137) % 1200;
    let y = 390 - ((time * 22 + i * 47) % 280);
    let sway = sin(time * 1.5 + i) * 8;
    let diameter = 3 + i % 6;

    ocean.noFill();
    ocean.stroke(180, 235, 255, 120);
    ocean.strokeWeight(1);
    ocean.circle(x + sway, y, diameter);

    ocean.noStroke();
    ocean.fill(210, 245, 255, 110);
    ocean.circle(
      x + sway - diameter * 0.2,
      y - diameter * 0.2,
      1.3
    );
  }

  for (let i = 0; i < fishX.length; i++) {
    drawFish(i);
  }

  ocean.noStroke();
  ocean.fill("#BFF6FF");

  for (let i = 0; i < dropX.length; i++) {
    ocean.ellipse(dropX[i], dropY[i], 3, 6);
  }

  ocean1.image(ocean, 0, 0, 400, 400, 0, 0, 400, 400);
  ocean2.image(ocean, 0, 0, 400, 400, 400, 0, 400, 400);
  ocean3.image(ocean, 0, 0, 400, 400, 800, 0, 400, 400);
}

function drawFish(i) {
  let size = fishSize[i];
  let y = fishY[i] + sin(time * 2 + i) * 9;
  let tailMove = sin(time * 6 + i) * size * 0.1;

  ocean.push();
  ocean.translate(fishX[i], y);
  ocean.scale(fishDirection[i], 1);
  ocean.rotate(sin(time * 1.5 + i) * 0.12);

  ocean.noStroke();
  ocean.fill("#FFFFFF");

  ocean.beginShape();

  for (let j = 0; j <= 30; j++) {
    let amount = j / 30;
    let x = lerp(-size * 0.5, size * 0.5, amount);

    let bodyWidth =
      pow(sin(amount * PI), 0.8) *
      size * 0.16 *
      (0.4 + amount * 0.6);

    let bend = tailMove * pow(1 - amount, 2);

    ocean.vertex(x, bend - bodyWidth);
  }

  for (let j = 30; j >= 0; j--) {
    let amount = j / 30;
    let x = lerp(-size * 0.5, size * 0.5, amount);

    let bodyWidth =
      pow(sin(amount * PI), 0.8) *
      size * 0.16 *
      (0.4 + amount * 0.6);

    let bend = tailMove * pow(1 - amount, 2);

    ocean.vertex(x, bend + bodyWidth);
  }

  ocean.endShape(CLOSE);

  ocean.triangle(
    size * 0.12, -size * 0.07,
    -size * 0.23, -size * 0.25,
    -size * 0.12, -size * 0.05
  );

  ocean.triangle(
    size * 0.12, size * 0.07,
    -size * 0.23, size * 0.25,
    -size * 0.12, size * 0.05
  );

  ocean.beginShape();
  ocean.vertex(-size * 0.43, tailMove * 0.85);
  ocean.vertex(-size * 0.63, tailMove - size * 0.08);
  ocean.vertex(-size * 0.88, tailMove * 1.4 - size * 0.25);
  ocean.vertex(-size * 0.73, tailMove * 1.2);
  ocean.vertex(-size * 0.88, tailMove * 1.4 + size * 0.25);
  ocean.vertex(-size * 0.63, tailMove + size * 0.08);
  ocean.endShape(CLOSE);

  ocean.pop();
}

function flowWidth(y) {
  let amount = max(0, 1 - y / 210);

  return (
    9 +
    182 * amount * amount +
    sin(y * 0.08 - time * 4) * (2 + amount * 4)
  );
}

function flowCenter(y) {
  return 200 + sin(y * 0.025 - time * 2) * 4;
}

function drawWaterfall() {
  waterfall.background(0);
  waterfall.noStroke();
  waterfall.fill("#0022FF");

  waterfall.beginShape();

  for (let y = 0; y <= 400; y += 5) {
    waterfall.vertex(flowCenter(y) - flowWidth(y), y);
  }

  for (let y = 400; y >= 0; y -= 5) {
    waterfall.vertex(flowCenter(y) + flowWidth(y), y);
  }

  waterfall.endShape(CLOSE);

  waterfall.noFill();
  waterfall.stroke(100, 190, 255, 75);
  waterfall.strokeWeight(1);

  for (let side = -1; side <= 1; side += 2) {
    waterfall.beginShape();

    for (let y = 0; y <= 400; y += 5) {
      waterfall.vertex(
        flowCenter(y) + flowWidth(y) * side,
        y
      );
    }

    waterfall.endShape();
  }

  waterfall.stroke(150, 220, 255, 40);
  waterfall.strokeWeight(1);

  for (let i = 0; i < 5; i++) {
    let y = (time * 80 + i * 80) % 400;
    let halfWidth = flowWidth(y) * 0.75;

    waterfall.beginShape();

    for (let j = -10; j <= 10; j++) {
      let amount = j / 10;

      waterfall.vertex(
        flowCenter(y) + amount * halfWidth,
        y + (1 - amount * amount) * 5
      );
    }

    waterfall.endShape();
  }

  for (let i = 0; i < 24; i++) {
    let y = (time * 65 + i * 37) % 400;
    let radius = 2 + i % 4;
    let lane = sin(i * 2.4 + time * 0.6);
    let space = max(0, flowWidth(y) - radius - 3);
    let x = flowCenter(y) + lane * space * 0.8;

    waterfall.noFill();
    waterfall.stroke(165, 225, 255, 140);
    waterfall.strokeWeight(1);
    waterfall.circle(x, y, radius * 2);

    waterfall.noStroke();
    waterfall.fill(210, 245, 255, 120);
    waterfall.circle(
      x - radius * 0.3,
      y - radius * 0.3,
      1.5
    );
  }

  for (let i = 0; i < 6; i++) {
    let cycle = (time + i * 0.43) % 2.8;

    if (cycle < 0.85) {
      let side = i % 2 === 0 ? -1 : 1;
      let startY = 65 + (i % 3) * 38;
      let startTime = time - cycle;
      let amount = max(0, 1 - startY / 210);

      let startWidth =
        9 +
        182 * amount * amount +
        sin(startY * 0.08 - startTime * 4) *
          (2 + amount * 4);

      let startCenter =
        200 + sin(startY * 0.025 - startTime * 2) * 4;

      let x =
        startCenter +
        side * (startWidth + cycle * (30 + i * 4));

      let y =
        startY -
        cycle * 48 +
        cycle * cycle * 135;

      waterfall.noStroke();
      waterfall.fill(
        130,
        210,
        255,
        190 * (1 - cycle / 0.85)
      );

      waterfall.ellipse(
        x,
        y,
        3 + i % 2,
        5 + cycle * 3
      );
    }
  }
}
function textures() { return [ocean1, ocean2, ocean3, waterfall]; }
return { init, update, textures };
})();
