function setup() {
    createCanvas(576, 384)

    angleMode(DEGREES)

    stroke(0)
    strokeWeight(1)
    noFill()
}


function draw() {

    background(255)

    translate(width / 2, height / 2)


    // ------------------------
    // Möbius inspired ring
    // ------------------------

    for (let i = 0; i < 90; i++) {

        push()


        let angle = i * 4


        // infinity / mobius inspired path
        let x = 165 * sin(angle)

        let y =
            80
            * sin(angle)
            * cos(angle)


        translate(x, y)


        // direction of each small clock
        rotate(angle)


        // fake 3D depth
        let s =
            0.5
            + 0.5
            * (sin(angle) + 1)

        scale(s)


        // little clock hands

        // hour
        push()

        rotate(angle * 2)

        line(
            0,
            0,
            0,
            -12
        )

        pop()


        // minute
        push()

        rotate(-angle * 3)

        line(
            0,
            0,
            9,
            0
        )

        pop()


        // small center
        circle(
            0,
            0,
            3
        )


        pop()
    }



    // ------------------------
    // center clock
    // ------------------------


    // hour hand
    push()

    rotate(frameCount * 0.05)

    strokeWeight(3)

    line(
        0,
        0,
        0,
        -22
    )

    pop()



    // minute hand
    push()

    rotate(frameCount * 0.2)

    strokeWeight(2)

    line(
        0,
        0,
        0,
        -38
    )

    pop()



    // second hand
    push()

    rotate(frameCount * 0.8)

    strokeWeight(1)

    line(
        0,
        0,
        0,
        -52
    )

    pop()



    // center point
    circle(
        0,
        0,
        6
    )
}