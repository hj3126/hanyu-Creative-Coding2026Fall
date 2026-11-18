
/*


  Open fingers = Fish follows
  Pinch fingers = Fish escapes
  No hand = Fish swims freely
*/



let handPose;
let video;
let hands = [];

let thumbTip = [0, 0];
let indexTip = [0, 0];

let pinch = 0;
let fingerDistance = 0;

let smoothFinger = null;
let smoothAmount = 0.3;



let fish;



async function setup() {

  createCanvas(640, 480);

  fish = new Fish(width / 2, height / 2);

  // Load hand tracking model
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

  clear();


  let target = createVector(
    width / 2 + sin(frameCount * 0.012) * 220,
    height / 2 + sin(frameCount * 0.017) * 140
  );

  pinch = 0;



  if (hands.length > 0) {

    let hand = hands[0];

    let thumb = hand.keypoints[4];
    let index = hand.keypoints[8];

    thumbTip = [thumb.x, thumb.y];
    indexTip = [index.x, index.y];


    fingerDistance = dist(
      thumb.x,
      thumb.y,
      index.x,
      index.y
    );

    // Detect pinch
    if (fingerDistance < 25) {
      pinch = 1;
    } else {
      pinch = 0;
    }


    if (smoothFinger == null) {
      smoothFinger = createVector(
        index.x,
        index.y
      );
    }

    smoothFinger.x = lerp(
      smoothFinger.x,
      index.x,
      smoothAmount
    );

    smoothFinger.y = lerp(
      smoothFinger.y,
      index.y,
      smoothAmount
    );

    // Fish follows finger
    target = smoothFinger.copy();

  } else {

    
    smoothFinger = null;
    fingerDistance = 0;

  }



  if (hands.length > 0 && pinch == 1) {

    fish.flee(target);

  } else {

    fish.seek(target);

  }

  fish.update();
  fish.display();

}


// HANDPOSE CALLBACK

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



  seek(target) {

    let desired = p5.Vector.sub(
      target,
      this.position
    );

    let distance = desired.mag();

    if (distance < 1) {
      return;
    }

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

    let steer = p5.Vector.sub(
      desired,
      this.velocity
    );

    steer.limit(this.maxForce);

    this.applyForce(steer);

  }



  flee(target) {

    let desired = p5.Vector.sub(
      this.position,
      target
    );

    if (desired.mag() < 1) {
      desired = createVector(1, 0);
    }

    desired.setMag(this.maxSpeed * 1.7);

    let steer = p5.Vector.sub(
      desired,
      this.velocity
    );

    steer.limit(this.maxForce * 2.5);

    this.applyForce(steer);

  }


  // FISH

  update() {

    this.velocity.add(this.acceleration);

    this.velocity.limit(
      this.maxSpeed * 1.7
    );

    this.position.add(this.velocity);

    // Reset acceleration
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


  // DRAW FISH

  display() {

    push();

    translate(
      this.position.x,
      this.position.y
    );

  
    rotate(this.velocity.heading());

    // Tail 
    let tailMove = sin(frameCount * 0.25) * 12;

    noStroke();

    // TAIL
    fill(65, 180, 230);

    triangle(
      -23, 0,
      -48, -19 + tailMove,
      -48, 19 + tailMove
    );

    // BODY
    fill(105, 215, 240);

    ellipse(
      0,
      0,
      64,
      32
    );

   
 
  



    pop();

  }

}
