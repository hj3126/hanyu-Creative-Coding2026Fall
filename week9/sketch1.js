

let handPose, video;
let hands = [];

let fishPos, fishVel;
let smoothFinger = null;

async function setup() {
  createCanvas(640, 480);

  fishPos = createVector(width / 2, height / 2);
  fishVel = createVector(1, 0);


  handPose = await ml5.handPose({
    maxHands: 1,
    flipped: true
  });

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  handPose.detectStart(video, gotHands);
}

function draw() {
 
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // Fish swims freewhen no hand 
  let target = createVector(
    width / 2 + sin(frameCount * 0.012) * 220,
    height / 2 + sin(frameCount * 0.017) * 140
  );

  let pinch = false;

  if (hands.length > 0) {
    let hand = hands[0];

    let thumb = hand.keypoints[4];
    let index = hand.keypoints[8];

   
    let fingerDistance = dist(
      thumb.x, thumb.y,
      index.x, index.y
    );

    pinch = fingerDistance < 25;

    // Smooth finger movement
    if (smoothFinger == null) {
      smoothFinger = createVector(index.x, index.y);
    }

    smoothFinger.x = lerp(
      smoothFinger.x, index.x, 0.3
    );
    smoothFinger.y = lerp(
      smoothFinger.y, index.y, 0.3
    );

    target = smoothFinger.copy();

    // Green marker
    noStroke();
    fill(0, 255, 100);
    circle(thumb.x, thumb.y, 15);

    // Red marker
    fill(255, 70, 70);
    circle(index.x, index.y, 15);

    // Blue pinching
    if (pinch) {
      stroke(0, 120, 255);
      strokeWeight(3);
      line(thumb.x, thumb.y, index.x, index.y);
    }

  } else {
    smoothFinger = null;
  }

  
  let direction;

  if (pinch) {
  
    direction = p5.Vector.sub(fishPos, target);
  } else {
  
    direction = p5.Vector.sub(target, fishPos);
  }

  let distance = direction.mag();

  if (distance > 0) {
    let speed = pinch ? 5 : 3;

    if (!pinch && distance < 100) {
      speed = map(distance, 0, 100, 0, 3);
    }

    direction.setMag(speed);

    let steering = p5.Vector.sub(direction, fishVel);
    steering.limit(pinch ? 0.3 : 0.12);

    fishVel.add(steering);
  }

  fishVel.limit(pinch ? 5 : 3);
  fishPos.add(fishVel);


  fishPos.x = constrain(fishPos.x, 50, width - 50);
  fishPos.y = constrain(fishPos.y, 40, height - 40);

  drawFish();
}


function drawFish() {
  push();

  translate(fishPos.x, fishPos.y);
  rotate(fishVel.heading());

  noStroke();

 
  let tailMove = sin(frameCount * 0.25) * 12;

  fill(65, 180, 230);
  triangle(
    -23, 0,
    -48, -19 + tailMove,
    -48, 19 + tailMove
  );

  // Fish body
  fill(105, 215, 240);
  ellipse(0, 0, 64, 32);

  pop();
}


function gotHands(results) {
  hands = results;
}

