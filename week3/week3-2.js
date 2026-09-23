
let r = 0

function setup() {
    createCanvas(windowWidth, windowHeight)

    angleMode(DEGREES)

    stroke(255)
    noFill()
}

function draw() {

    background(0)

    r = mouseX * 0.2

 for (let x = 40; x < width; x += 80) {

for (let y = 40; y < height; y += 80) {

            push()

            translate(x, y)



            strokeWeight(1)
            circle(0, 0, 55)


    
            push()

            rotate(r)

            strokeWeight(2)
            line(0, 0, 0, -20)

            pop()
        push()

            rotate(-r * 0.5)

            strokeWeight(2)
            line(0, 0, 14, 0)

            pop()


            pop()
        }
    }
}