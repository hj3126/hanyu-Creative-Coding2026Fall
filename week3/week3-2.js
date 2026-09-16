let y = 0
let r = 0

let lerpedMouseX = 0
let lerpedMouseY = 0

function setup() {
    createCanvas(windowWidth, windowHeight)

    angleMode(DEGREES)

    stroke(255)
    strokeWeight(2)
    noFill()
}

function draw() {

    background(0)

    lerpedMouseX = lerp(lerpedMouseX, mouseX, 0.05)
    lerpedMouseY = lerp(lerpedMouseY, mouseY, 0.05)

    r = lerpedMouseX



    push();

    translate(3 * width / 4, height / 2)
    rotate(r)
    scale(0.5)

    line(0, 0, 200, 0);
    triangle(-40, 35, 0, -50, 40, 35)

    translate(200, 0)
    rotate(r)
    scale(1.5)

    triangle(-40, 35, 0, -50, 40, 35)
    line(0, 0, 200, 0)

    translate(200, 0)
    rotate(r)

    triangle(-40, 35, 0, -50, 40, 35)
    line(0, 0, 200, 0)

    translate(200, 0)
    rotate(r)

    triangle(-40, 35, 0, -50, 40, 35)
    pop()

    push()

    translate(width / 4, height / 2)
    rotate(-r)
    scale(0.5)

    line(0, 0, 200, 0)
    triangle(-40, 35, 0, -50, 40, 35)

    translate(200, 0)
    rotate(r)
    scale(1.5)

    triangle(-40, 35, 0, -50, 40, 35)
    line(0, 0, 200, 0)
    translate(200, 0)
    rotate(r)

    triangle(-40, 35, 0, -50, 40, 35)
    line(0, 0, 200, 0)

    translate(200, 0)
    rotate(r)

    triangle(-40, 35, 0, -50, 40, 35)

    pop()
}