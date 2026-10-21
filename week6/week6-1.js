
let frames = []

async function setup() {

    createCanvas(800, 600)

    frameRate(8)

    imageMode(CENTER)

    
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

    print(frames)
}


function draw() {

    background(240)

    let img = frames[
        frameCount % frames.length
    ]

    image(
        img,
        width / 2,
        height / 2,
        282,
        282
    )
}