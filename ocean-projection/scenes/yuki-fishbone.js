window.OceanScenes = window.OceanScenes || {};
OceanScenes.yukiFishbone = (() => {

let fishCanvas;
let time = 0;
function init() {
  fishCanvas = createGraphics(400, 400);
  fishCanvas.pixelDensity(1);
}
function update(dt) { time += dt; }
function render() { drawSkeleton(); return fishCanvas; }
function spineY(x) {
  let amount = map(x, -120, 100, 1, 0.2);
  return sin(x * 0.025 - time * 2.4) * 15 * amount;
}

function drawSkeleton() {
  fishCanvas.background(0);
  fishCanvas.noStroke();
  fishCanvas.fill(255);
  fishCanvas.circle(200, 200, 380);

  fishCanvas.push();
  fishCanvas.translate(200, 200);
  fishCanvas.rotate(sin(time * 0.7) * 0.08);

  fishCanvas.noFill();
  fishCanvas.stroke(0);
  fishCanvas.strokeWeight(2.5);

  fishCanvas.beginShape();
  for (let x = -120; x <= 100; x += 3) {
    fishCanvas.vertex(x, spineY(x));
  }
  fishCanvas.endShape();

  for (let i = 0; i < 22; i++) {
    let x = -110 + i * 9;
    let y = spineY(x);
    let amount = i / 21;
    let ribLength = 12 + sin(amount * PI) * 47;

    for (let side = -1; side <= 1; side += 2) {
      fishCanvas.noFill();
      fishCanvas.stroke(0);
      fishCanvas.strokeWeight(1.4);
      fishCanvas.beginShape();

      for (let j = 0; j <= 16; j++) {
        let position = j / 16;

        let bend =
          sin(position * PI) * 9 +
          sin(time * 2.4 - i * 0.3) * position * 4;

        let ribX = x - position * 21 + bend;
        let ribY =
          y +
          side * ribLength * position +
          sin(position * PI) * 4;

        fishCanvas.vertex(ribX, ribY);
      }

      fishCanvas.endShape();

      if (i > 3 && i < 19) {
        fishCanvas.strokeWeight(0.7);

        for (let branch = 0; branch < 3; branch++) {
          let position = 0.5 + branch * 0.15;

          let bend =
            sin(position * PI) * 9 +
            sin(time * 2.4 - i * 0.3) * position * 4;

          let ribX = x - position * 21 + bend;
          let ribY =
            y +
            side * ribLength * position +
            sin(position * PI) * 4;

          fishCanvas.line(
            ribX,
            ribY,
            ribX - 5,
            ribY + side * 7
          );
        }
      }
    }

    fishCanvas.push();
    fishCanvas.translate(x, y);

    let angle = atan2(
      spineY(x + 2) - spineY(x - 2),
      4
    );

    fishCanvas.rotate(angle);
    fishCanvas.stroke(0);
    fishCanvas.strokeWeight(1);
    fishCanvas.fill(255);
    fishCanvas.ellipse(0, 0, 6, 8);
    fishCanvas.noStroke();
    fishCanvas.fill(0);
    fishCanvas.circle(0, 0, 2);
    fishCanvas.pop();
  }

  drawTail();
  drawHead();

  fishCanvas.pop();
}

function drawTail() {
  let x = -120;
  let y = spineY(x);
  let sway = sin(time * 3) * 9;

  fishCanvas.noFill();
  fishCanvas.stroke(0);
  fishCanvas.strokeWeight(1.8);

  fishCanvas.beginShape();
  fishCanvas.vertex(x, y);
  fishCanvas.vertex(-157, y - 34 + sway);
  fishCanvas.vertex(-150, y - 12 + sway);
  fishCanvas.vertex(-146, y + sway);
  fishCanvas.vertex(-150, y + 12 + sway);
  fishCanvas.vertex(-157, y + 34 + sway);
  fishCanvas.vertex(x, y);
  fishCanvas.endShape();

  fishCanvas.strokeWeight(0.8);

  for (let i = 0; i < 11; i++) {
    let amount = i / 10;
    let endY = y - 34 + amount * 68 + sway;
    let endX = -157 + sin(amount * PI) * 11;

    fishCanvas.beginShape();

    for (let j = 0; j <= 12; j++) {
      let position = j / 12;

      fishCanvas.vertex(
        lerp(x, endX, position),
        lerp(y, endY, position) +
          sin(position * PI) * sin(time * 3 + i * 0.2) * 3
      );
    }

    fishCanvas.endShape();
  }
}

function drawHead() {
  let x = 100;
  let y = spineY(x);

  let angle = atan2(
    spineY(102) - spineY(98),
    4
  );

  fishCanvas.push();
  fishCanvas.translate(x, y);
  fishCanvas.rotate(angle);

  fishCanvas.fill(255);
  fishCanvas.stroke(0);
  fishCanvas.strokeWeight(2);

  fishCanvas.beginShape();
  fishCanvas.vertex(-3, -8);
  fishCanvas.vertex(6, -23);
  fishCanvas.vertex(22, -26);
  fishCanvas.vertex(38, -17);
  fishCanvas.vertex(49, -5);
  fishCanvas.vertex(35, 0);
  fishCanvas.vertex(47, 8);
  fishCanvas.vertex(29, 22);
  fishCanvas.vertex(10, 21);
  fishCanvas.vertex(-3, 8);
  fishCanvas.endShape(CLOSE);

  fishCanvas.noStroke();
  fishCanvas.fill(0);
  fishCanvas.ellipse(23, -10, 13, 15);

  fishCanvas.fill(255);
  fishCanvas.circle(25, -12, 3);

  fishCanvas.noFill();
  fishCanvas.stroke(0);
  fishCanvas.strokeWeight(1);

  fishCanvas.beginShape();
  fishCanvas.vertex(10, -19);
  fishCanvas.vertex(4, -7);
  fishCanvas.vertex(7, 7);
  fishCanvas.vertex(16, 17);
  fishCanvas.endShape();

  fishCanvas.line(12, 7, 30, 12);
  fishCanvas.line(30, 12, 40, 8);
  fishCanvas.line(31, -19, 38, -9);

  for (let i = 0; i < 4; i++) {
    let toothX = 33 + i * 3;
    fishCanvas.line(toothX, 1, toothX - 1, 5);
  }

  fishCanvas.pop();
}
return { init, update, render };
})();
