let saveSvg = false


function setup() {

  createCanvas(576, 384)

  angleMode(RADIANS)

  stroke(0)
  strokeWeight(1)
  noFill()
}


function keyPressed() {

  if (key == 's' || key == 'S') {

    saveSvg = true
  }
}


function draw() {

  background(255)


  if (saveSvg) {

    beginRecordSvg("mobius_time.svg")
  }


  stroke(0)
  strokeWeight(1)
  noFill()


  translate(
    width / 2,
    height / 2
  )


  drawMobiusTime(
    220,
    70,
    80,
    5
  )


  if (saveSvg) {

    endRecordSvg()

    saveSvg = false
  }
}




function drawMobiusTime(
  radius,
  bandWidth,
  steps,
  lanes
) {


  for (let i = 0; i < steps; i++) {


    let t = map(
      i,
      0,
      steps,
      0,
      TWO_PI
    )



    let p = infinityCurve(
      t,
      radius
    )



    let p2 = infinityCurve(
      t + 0.01,
      radius
    )



    let dx =
      p2.x - p.x


    let dy =
      p2.y - p.y



    let len = sqrt(
      dx * dx +
      dy * dy
    )



    dx /= len

    dy /= len



    let nx = -dy

    let ny = dx



    let twist =
      cos(t / 2)



    let twistRotation =
      sin(t / 2)



    for (let j = 0; j < lanes; j++) {


      let lane = map(
        j,
        0,
        lanes - 1,
        -1,
        1
      )



      let offset =
        lane *
        bandWidth *
        twist



      let x =
        p.x +
        nx * offset



      let y =
        p.y +
        ny * offset



      let pathAngle =
        atan2(
          dy,
          dx
        )



      let localRotation =
        pathAngle +
        lane *
        twistRotation *
        0.8



      let size =
        12 +
        7 *
        (
          0.5 +
          0.5 *
          sin(
            t * 3 +
            lane
          )
        )



      let time =
        t * 2 +
        lane * 0.8 +
        frameCount * 0.01



      drawClock(
        x,
        y,
        localRotation,
        size,
        time
      )
    }
  }
}




function drawClock(
  x,
  y,
  rotation,
  size,
  time
) {


  push()


  translate(
    x,
    y
  )


  rotate(rotation)



  // first hand
  push()

  rotate(time)

  line(
    0,
    0,
    0,
    -size
  )

  pop()



  // second hand
  push()

  rotate(
    -time * 0.35
  )

  line(
    0,
    0,
    size * 0.7,
    0
  )

  pop()



  // center point
  circle(
    0,
    0,
    2
  )


  pop()
}




function infinityCurve(
  t,
  size
) {


  let s =
    sin(t)



  let d =
    1 +
    s * s



  let x =
    size *
    cos(t) /
    d



  let y =
    size *
    sin(t) *
    cos(t) /
    d



  y *= 1.15



  return {
    x: x,
    y: y
  }
}