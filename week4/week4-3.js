let saveSvg = false

function setup() {
    createCanvas(576, 384)

    angleMode(DEGREES)

    background(255)

    stroke(0)
    strokeWeight(1)
    noFill()

    noiseSeed(3)

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

    // SVG
    if (saveSvg) {
        beginRecordSvg("week4-3.svg")
    }

    translate(width / 2, height / 2)

    for (let ring = 0; ring < 6; ring++) {

        push()

        rotate(ring * 30)

        let size = 0.72 + ring * 0.045
        scale(size)

        for (let i = 0; i < 90; i++) {

            push()

            let angle = i * 4

            let x = 150 * sin(angle)
            let y = 72 * sin(angle) * cos(angle)

            translate(x, y)

            rotate(angle)

            // 改这里：让环更接近均匀圆形
            let depth =
                0.7 +
                0.3 *
                abs(sin(angle))

            scale(depth)

            let n = noise(i * 0.05, ring * 0.2)

            let handMove = map(
                n,
                0,
                1,
                0.7,
                1.2
            )

            // hour
            push()
            rotate(angle * 2 + ring * 12)
            line(0, 0, 0, -10 * handMove)
            pop()

            // minute
            push()
            rotate(-angle * 3 + ring * 8)
            line(0, 0, 8 * handMove, 0)
            pop()

            // center
            circle(0, 0, 2.5)

            pop()
        }

        pop()
    }

    // center clock
    push()

    // hour hand
    push()
    rotate(225)
    strokeWeight(2.5)
    line(0, 0, 0, -18)
    pop()

    // minute hand
    push()
    rotate(80)
    strokeWeight(2)
    line(0, 0, 0, -27)
    pop()

    // second hand
    push()
    rotate(325)
    strokeWeight(1)
    line(0, 0, 0, -32)
    pop()

    // center
    strokeWeight(1.5)
    circle(0, 0, 5)

    pop()

    // SVG
    if (saveSvg) {
        endRecordSvg()
        saveSvg = false
    }
}