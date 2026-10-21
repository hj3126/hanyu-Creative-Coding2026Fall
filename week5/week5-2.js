let saveSvg = false

function setup() {
    createCanvas(960, 960)

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

    //  SVG
    if (saveSvg) {
        beginRecordSvg("mobius_time_circle_10inch.svg")
    }

    translate(width / 2, height / 2)

    let outerDiameter = 900

    stroke(0)
    noFill()

    // 外圆
    strokeWeight(1.2)
    circle(0, 0, outerDiameter)

   
    let innerRadius = (outerDiameter / 3) / 2
    let smallCircleSize = 8

    strokeWeight(1)

    for (let i = 0; i < 12; i++) {

        let angle = i * 30 - 90
        let x = cos(angle) * innerRadius
        let y = sin(angle) * innerRadius

        circle(x, y, smallCircleSize)
    }

   

    push()

    let mobiusScale = 2.2
    scale(mobiusScale)

    for (let i = 0; i < 90; i++) {

        push()

        let angle = i * 4

       
        let x = 165 * sin(angle)
        let y = 80 * sin(angle) * cos(angle)

        translate(x, y)
        rotate(angle)

        let s =
            0.5 +
            0.5 *
            (sin(angle) + 1)

        scale(s)

        // hour
        push()
        strokeWeight(1 / mobiusScale)
        rotate(angle * 2)
        line(0, 0, 0, -12)
        pop()

        // minute
        push()
        strokeWeight(1 / mobiusScale)
        rotate(-angle * 3)
        line(0, 0, 9, 0)
        pop()

        // small center
        strokeWeight(1 / mobiusScale)
        circle(0, 0, 3)

        pop()
    }


    // // hour
    // push()
    // strokeWeight(3 / mobiusScale)
    // rotate(frameCount * 0.05)
    // line(0, 0, 0, -22)
    // pop()

    // // minute
    // push()
    // strokeWeight(2 / mobiusScale)
    // rotate(frameCount * 0.2)
    // line(0, 0, 0, -38)
    // pop()

    // // second
    // push()
    // strokeWeight(1 / mobiusScale)
    // rotate(frameCount * 0.8)
    // line(0, 0, 0, -52)
    // pop()

    // center point
    strokeWeight(1 / mobiusScale)
    circle(0, 0, 6)

    pop()

    // 结束 SVG
    if (saveSvg) {
        endRecordSvg()
        saveSvg = false
    }
}