let x = 0
let y = 0

function setup() {
    createCanvas(windowWidth, windowHeight)
}

function draw() {
    background(220)

    x = lerp(x, mouseX, 0.05)
    y = lerp(y, mouseY, 0.05) lerp(start, stop, amount)

    circle(x, y, 80)
}

