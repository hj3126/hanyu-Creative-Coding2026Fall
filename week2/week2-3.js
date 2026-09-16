
    let x=100
    let y=100

    let xspeed=3
    let yspeed=5
function setup(){
    createcanvas(windowwidth,windowheight)
rectMode(CENTER)
}
function draw(){
    background(255,150,0  )
fill(255)
    rect(x,y,80,80)
    x = xspeed+x
    y = yspeed+y
}
if (x>width || x<40){
    xspeed = -xspeed
}
if (y>height || y<40){
    yspeed = -yspeed

}
if(y<40){
    yspeed = -yspeed
}   