let saveSvg = false

function setup() {
    createCanvas(576, 384)

    angleMode(DEGREES)

    stroke(0)
    strokeWeight(1)
    noFill()
}

function keyPressed() {
    if (key == 's' || key == 'S') {
        saveSvg = true
    }
}

function draw() {  

    background(255)

    // 开始记录 SVG
    if (saveSvg) {
        beginRecordSvg("week4-2.svg")
    }

    stroke(0)
    strokeWeight(1)
    noFill()

    translate(width / 2, height / 2)

    for (let i = 0; i < 90; i++) {

        push()

        let angle = i * 4

        // infinity
        let x = 165 * sin(angle)

        let y =
            80 *
            sin(angle) *
            cos(angle)

        translate(x, y)

      
        rotate(angle)

        let s =
            0.5 +
            0.5 *
            (sin(angle) + 1)

        scale(s)

        // hour
        push()
        rotate(angle * 2)
        line(0, 0, 0, -12)
        pop()

        // minute
        push()
        rotate(-angle * 3)
        line(0, 0, 9, 0)
        pop()

        // small center
        circle(0, 0, 3)

        pop()
    }


    
    push()
    rotate(frameCount * 0.05)
    strokeWeight(3)
    line(0, 0, 0, -22)
    pop()

   
    push()
    rotate(frameCount * 0.2)
    strokeWeight(2)
    line(0, 0, 0, -38)
    pop()

 
    push()
    rotate(frameCount * 0.8)
    strokeWeight(1)
    line(0, 0, 0, -52)
    pop()

    
    circle(0, 0, 6)


   
    if (saveSvg) {
        endRecordSvg()
        saveSvg = false
    }
}