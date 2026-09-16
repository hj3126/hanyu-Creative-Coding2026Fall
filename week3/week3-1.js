function setup() {
    createCanvas(windowWidth, windowHeight)
    rectMode(CENTER);
}

function draw() {
    background(230)


    translate(width / 2, height / 2)

    fill(255, 100, 150);
    rect(0, 0, 80, 80);

  
    translate(150, 0)

    fill(120, 180, 255)
    rect(0, 0, 80, 80);

    
    translate(0, 150)

    fill(170, 240, 200)
    rect(0, 0, 80, 80)
   
    translate(-300, 0)

    fill(220, 170, 255)
    rect(0, 0, 80, 80)
}