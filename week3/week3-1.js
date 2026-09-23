function setup() {
    createCanvas(windowWidth, windowHeight)

    angleMode(DEGREES)
}

function draw() {

    background(0)

    stroke(255)
    strokeWeight(2)
    noFill()
  
    translate(width / 2, height / 2)

for (let i = 0; i < 24; i++) {

        push()

let angle = i * 15

 let baseX = 260 * sin(angle)

        let clockY =
            120 * sin(angle) * cos(angle)


     let gap = 25

        let clockX

 if (baseX > 0) {

            clockX = baseX + gap

        } else {

            clockX = baseX - gap
        }

 translate(clockX, clockY)
 push()

        rotate(angle + frameCount * 0.5)

        line(0, 0, 0, -18)

        pop()
        push()

        rotate(-angle + frameCount * 0.15)

        line(0, 0, 13, 0)

        pop()


        pop()
    }
}