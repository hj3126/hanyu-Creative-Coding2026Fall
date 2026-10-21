let saveSvg = false

function setup() {
    createCanvas(576, 384)

    angleMode(DEGREES)
}

function keyPressed() {

    if (key == 's' || key == 'S') {
        saveSvg = true
    }
}

function draw() {

    background(255)


    // SVG
    if (saveSvg) {
        beginRecordSvg("week3-1.svg")
    }


    stroke(0)
    strokeWeight(1)
    noFill()


    translate(width / 2, height / 2)


    for (let i = 0; i < 24; i++) {

        push()


        let angle = i * 15


        let baseX = 200 * sin(angle)


        let clockY =
            85 * sin(angle) * cos(angle)


        let gap = 20

        let clockX


        if (baseX > 0) {

            clockX = baseX + gap

        } else {

            clockX = baseX - gap
        }


        translate(clockX, clockY)


        // first hand
        push()

        rotate(angle + frameCount * 0.5)

        line(0, 0, 0, -16)

        pop()


        // second hand
        push()

        rotate(-angle + frameCount * 0.15)

        line(0, 0, 11, 0)

        pop()


        pop()
    }


    // finish and save SVG
    if (saveSvg) {

        endRecordSvg()

        saveSvg = false
    }
}