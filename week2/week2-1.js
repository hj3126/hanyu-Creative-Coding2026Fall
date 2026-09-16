function setup() {
 createCanvas(windowWidth, windowHeight)
}

function draw() {
  background(135, 206, 235)

  circle(mouseX, mouseY, 80)
}
if (mouseX < width / 2 && mouseY < height / 2) {
        fill(255, 230, 0)
    }
if (mouseX > width / 2 && mouseY < height / 2) {
        fill(255, 100, 150)
    }
if (mouseX < width / 2 && mouseY > height / 2) {
        fill(160, 130, 160)
    }
    if (mouseX < width / 2 && mouseY > height / 2) {
        fill(160, 130, 160)
    }