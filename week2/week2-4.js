let x = 100
let y = 40
let ySpeed = 5

function setup() {
    createCanvas(windowWidth, windowHeight)
}

function draw() {
    background(170, 240, 220)

    fill(255, 230, 0)
    noStroke()

    circle(x, y, 60)

    y = y + ySpeed

    if (y > height - 30) {
        ySpeed = -ySpeed
        x = x + 250
    }

    if (y < 30) {
        ySpeed = -ySpeed
        x = x + 250
    }

    if (x > width) {
        x = 100
    }
}