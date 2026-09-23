let y
let ySpeed = -5

function setup() {
    createCanvas(windowWidth, windowHeight)

    y = height - 50
}

function draw() {

    background(100, 180, 230)

  fill(255, 220, 0)
    noStroke()

    circle(width / 2, y, 100)

    y = y + ySpeed
 if (y < 100) {
        ySpeed = -ySpeed
    }

 if (y > height - 50) {
     ySpeed = -ySpeed
    }

  fill(70, 110, 80)

    triangle( 0, height,
        width / 4, height / 2,
        width / 2, height )

    triangle(width / 3, height,
        width * 2 / 3, height / 2,
        width, height )
}