
let frames = []
let bgImg

let activeHole = 0
let currentFrame = 0

let stage = 0
let lastChange = 0
let frameDelay = 5

let imgSize


async function setup() {

    createCanvas(windowWidth, windowHeight)

    frameRate(12)
    imageMode(CENTER)

    // Load grass background
    bgImg = await loadImage("grass_bg.png")

    // Load images into Array
    for (let i = 1; i <= 20; i++) {

        let fileName

        if (i < 10) {
            fileName = "frame_0" + i + ".png"
        } else {
            fileName = "frame_" + i + ".png"
        }

        frames[i - 1] = await loadImage(
            "frames/" + fileName
        )
    }

    imgSize = min(
        width / 3 * 0.85,
        height / 3 * 0.85,
        282
    )

    activeHole = floor(random(9))
    lastChange = frameCount
}


function draw() {

    background(240)

    // Draw grass background
    image(
        bgImg,
        width / 2,
        height / 2,
        width,
        height
    )

    // 0 = appear
    //  1 = waiting for click
    //  2 = capture animation

    if (frameCount - lastChange >= frameDelay) {

        // Frames 1-8
        if (stage == 0) {

            if (currentFrame < 7) {
                currentFrame++
            } else {
                stage = 1
            }
        }

        // Frames 9-20
        else if (stage == 2) {

            if (currentFrame < 19) {
                currentFrame++
            } else {

                currentFrame = 0
                stage = 0

                // Choose another random hole
                activeHole = floor(random(9))
            }
        }

        lastChange = frameCount
    }


    // Draw 9 holes
    for (let i = 0; i < 9; i++) {

        let col = i % 3
        let row = floor(i / 3)

        let x = (col + 0.5) * width / 3
        let y = (row + 0.5) * height / 3

        if (i == activeHole) {

            image(
                frames[currentFrame],
                x,
                y,
                imgSize,
                imgSize
            )

        } else {

            image(
                frames[0],
                x,
                y,
                imgSize,
                imgSize
            )
        }
    }
}


function mousePressed() {

    // Click the character at Frame 8
    if (stage == 1) {

        let col = activeHole % 3
        let row = floor(activeHole / 3)

        let x = (col + 0.5) * width / 3
        let y = (row + 0.5) * height / 3

        if (
            mouseX > x - imgSize / 2 &&
            mouseX < x + imgSize / 2 &&
            mouseY > y - imgSize / 2 &&
            mouseY < y + imgSize / 2
        ) {

            stage = 2
            currentFrame = 8
            lastChange = frameCount
        }
    }
}


function windowResized() {

    resizeCanvas(windowWidth, windowHeight)

    imgSize = min(
        width / 3 * 0.85,
        height / 3 * 0.85,
        282
    )
}
