let saveSvg = false

function setup() {
    createCanvas(576, 384)

    angleMode(DEGREES)

    stroke(0)
    strokeWeight(0.8)
    noFill()

    noiseSeed(4)

    noLoop()
}

function keyPressed() {

    if (key == 's' || key == 'S') {

        saveSvg = true

        redraw()
    }
}

function draw() {

    background(255)

    if (saveSvg) {
        beginRecordSvg("entangled-mobius.svg")
    }

    translate(width / 2, height / 2)


    for (let ring = 0; ring < 8; ring++) {

        push()

        rotate(ring * 22)

        let size =
            0.70 +
            ring * 0.04

        scale(size)


        for (let i = 0; i < 100; i++) {

            push()


            let angle =
                i * 3.6


            let x =
                155 *
                sin(angle)


            let y =
                74 *
                sin(angle) *
                cos(angle)


            translate(x, y)


            rotate(
                angle +
                ring * 6
            )


            let n =
                noise(
                    i * 0.06,
                    ring * 0.25
                )


            let length =
                map(
                    n,
                    0,
                    1,
                    5,
                    18
                )


            line(
                0,
                -length,
                0,
                length
            )


            // 第二根细线
            line(
                -4,
                0,
                4,
                0
            )


            pop()
        }


        pop()
    }


    // center clock

    push()

    push()
    rotate(225)
    strokeWeight(2.4)
    line(0, 0, 0, -18)
    pop()

    push()
    rotate(82)
    strokeWeight(1.6)
    line(0, 0, 0, -29)
    pop()

    push()
    rotate(325)
    strokeWeight(0.8)
    line(0, 4, 0, -35)
    pop()

    strokeWeight(1)
    circle(0, 0, 5)

    pop()


    if (saveSvg) {
        endRecordSvg()
        saveSvg = false
    }
}