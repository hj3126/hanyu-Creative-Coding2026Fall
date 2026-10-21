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


function draw() {

    background(255)

    translate(width / 2, height / 2)


    // --------------------------------
    // 6 rotating Mobius-inspired rings
    // --------------------------------

    for (let ring = 0; ring < 6; ring++) {

        push()

        // 每一个莫比乌斯环围绕中心旋转
        rotate(ring * 30)

        // 每一层大小稍微不同
        let size = 0.72 + ring * 0.045

        scale(size)


        // draw one Mobius-inspired ring
        for (let i = 0; i < 90; i++) {

            push()


            let angle = i * 4


            // infinity path
            let x =
                150 * sin(angle)

            let y =
                72 *
                sin(angle) *
                cos(angle)


            translate(x, y)


            // 让每个小钟跟着路径方向旋转
            rotate(angle)


            // fake 3D depth
            let depth =
                0.45 +
                0.55 *
                (sin(angle) + 1)


            scale(depth)


            // subtle noise
            let n =
                noise(
                    i * 0.05,
                    ring * 0.2
                )

            let handMove =
                map(
                    n,
                    0,
                    1,
                    0.7,
                    1.2
                )


            // ----------------
            // small clock unit
            // ----------------


            // hour hand
            push()

            rotate(
                angle * 2
                + ring * 12
            )

            line(
                0,
                0,
                0,
                -10 * handMove
            )

            pop()


            // minute hand
            push()

            rotate(
                -angle * 3
                + ring * 8
            )

            line(
                0,
                0,
                8 * handMove,
                0
            )

            pop()


            // center
            circle(
                0,
                0,
                2.5
            )


            pop()
        }


        pop()
    }



    // ----------------------------
    // CENTER CLOCK
    // ----------------------------

    push()


    // small center circle
    strokeWeight(1.2)

    circle(
        0,
        0,
        70
    )


    // hour
    push()

    rotate(225)

    strokeWeight(2.5)

    line(
        0,
        0,
        0,
        -18
    )

    pop()


    // minute
    push()

    rotate(80)

    strokeWeight(2)

    line(
        0,
        0,
        0,
        -27
    )

    pop()


    // second
    push()

    rotate(325)

    strokeWeight(1)

    line(
        0,
        0,
        0,
        -32
    )

    pop()


    // center point
    strokeWeight(1.5)

    circle(
        0,
        0,
        5
    )


    pop()
}