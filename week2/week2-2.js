let x = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
}

function draw() {
    background(100);

    let y = height / 2 + sin(x * 0.02) * (height / 2);

    fill(255);
    rect(x, y, 80, 80);

    x = x + 3;

    if (x > width) {
        x = 0;
    }
}