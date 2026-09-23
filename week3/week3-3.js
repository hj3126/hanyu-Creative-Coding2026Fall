let smoothX = 0
let smoothY = 0

function setup() {
    createCanvas(windowWidth, windowHeight)

    angleMode(DEGREES)
}

function draw() {

    background(0)

    //
    stroke(255)
    strokeWeight(2)
    noFill()

    smoothX = lerp(smoothX, mouseX, 0.05)
    smoothY = lerp(smoothY, mouseY, 0.05)

    translate(width / 2, height / 2)


    // biggest 
    push()

    rotate(smoothX * 0.08)

    for (let i = 0; i < 12; i++) {

        push()

        rotate(i * 30)

        translate(0, -220)

        rotate(frameCount * 0.15)

        line(0, 0, 0, -30)
        line(0, 0, 18, 0)

        pop()
    }

    pop()



    // middle 
    push()

    rotate(-smoothX * 0.12)

    scale(0.9)

    for (let i = 0; i < 12; i++) {

        push()

        rotate(i * 30 + 15)

        translate(0, -150)

        rotate(-frameCount * 0.2)

        line(0, 0, 0, -25)
        line(0, 0, 15, 0)

        pop()
    }

    pop()



    // small
    push()

    rotate(smoothX * 0.18)

    let s = 0.8 + smoothY / height * 0.5

    scale(s)

    for (let i = 0; i < 8; i++) {

        push()

        rotate(i * 45)

        translate(0, -75)

        rotate(frameCount * 0.3)

        line(0, 0, 0, -20)
        line(0, 0, 12, 0)

        pop()
    }

    pop()



    // the center clock:D

    // hour
    push()

    rotate(frameCount * 0.05)

    strokeWeight(3)

    line(0, 0, 0, -15)

    pop()


    // minute
    push()

    rotate(frameCount * 0.2)

    strokeWeight(2)

    line(0, 0, 0, -40)

    pop()


    // second
    push()

    rotate(frameCount * 0.8)

    strokeWeight(1)

    line(0, 0, 0, -55)

    pop()



    // center 
    push()

    fill(255)
    noStroke()

    circle(0, 0, 6)

    pop()
}