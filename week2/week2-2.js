let x = 0;

function setup() {
    createCanvas(windowWidth, windowHeight)
    rectMode(CENTER)

    background(138, 43, 226)
}

function draw() {

  background(138, 43, 226, 25)

let y = height / 2 + sin(x * 0.02) * (height / 2)

    fill(255)
    noStroke()
rect(x, y, 80, 80)

    x = x + 3;

    if (x > width) {
        x = 0
    }
}