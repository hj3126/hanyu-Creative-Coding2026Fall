let cols = 20
let rows = 20

let i = 0

function setup() {
    createCanvas(windowWidth, windowHeight)

    noFill()
    rectMode(CENTER)
}

function draw() {

    background(255)

    translate(
        0.5 * width / cols,
        0.5 * height / rows
    )


    for (let x = 0; x < width; x += width / cols) {

        for (let y = 0; y < height; y += height / rows) {

            let n = noise(x * 0.01,y * 0.01,
                i
            )

            fill(n * 255)

            rect(x,y,
                n * width / cols,
                n * height / rows
            )
        }
    }


    i += 0.01
}