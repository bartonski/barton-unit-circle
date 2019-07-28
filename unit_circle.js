/* TODO Document in comments. */

// define window
function win( width, height ) {
    this.width = width;
    this.height = height;
    this.usableHeight = 9*height/10;
    this.usableWidth = 9*width/10;
    this.xborder = this.width/20;
    this.yborder = this.height/20;
}

// leave room for slider below window.
var w = new win( window.innerWidth, window.innerHeight - 100 );

function point( x, y ) {
    this.x = x;
    this.y = y;
    this.xreal = this.x + w.xborder;
    this.yreal = w.height - ( this.y + w.yborder );
    this.plus = pointAdd;
    this.plusX = xAdd;
    this.plusY = yAdd;

    function pointAdd( pt ) {
        return new point( this.x + pt.x, this.y + pt.y );
    }

    function xAdd ( x ) {
        return new point( this.x + x, this.y );
    }

    function yAdd ( y ) {
        return new point( this.x, this.y + y );
    }
}

var frames = 600;
var canvas;  
var ctx;
var counter = 0;
var theta = 0;

var R = w.usableHeight/6 < w.usableWidth/10 ? w.usableHeight/6 : w.usableWidth/10 ;
var leftX = R/4;
var twoPiX = leftX + Math.PI * 2 * R;

var origin     = new point( 4*w.usableWidth/5 , 3*w.usableHeight/4 );
var cosOrigin  = new point( origin.x    , w.usableHeight/4 );

function incrementAngle() {
    counter++;
    counter = counter % frames;
    return ( counter / frames ) * Math.PI*2;
}

function circle(center,r) {
    ctx.beginPath();
    ctx.arc(center.xreal, center.yreal, r, 0, Math.PI*2, true);
    ctx.stroke();
}

function rect(x,y,w,h) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();
    ctx.fill();
}

function text( pt, label, textSize, color) {
    ctx.font = textSize + "px Arial";
    ctx.fillStyle = color;
    ctx.fillText(label, pt.xreal, pt.yreal); 
}
 
function clear() {
  ctx.clearRect(0, 0, w.width, w.height );
}

function _line( x1, y1, x2, y2, color, width ) {
    var color = color;
    var oldcolor = ctx.strokeStyle;
    var oldwidth = ctx.lineWidth;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo( x1, y1 );
    ctx.lineTo( x2, y2 );
    ctx.stroke();
    ctx.strokeStyle = oldcolor;
    ctx.lineWidth = oldwidth;
}

function line( pt1, pt2, color, width ) {
    _line( pt1.xreal, pt1.yreal, pt2.xreal, pt2.yreal, color, width );
}

function hline( pt, color, width ) {
    _line( w.xborder, pt.yreal,  w.width-w.xborder, pt.yreal, color, width );
}

function vline( pt, color, width ) {
    _line( pt.xreal , w.yborder, pt.xreal , w.height-w.yborder, color, width );
}

function xAxes ( origin ) {
    hline( origin, "#000000", 1 );
    hline( origin.plusY( R ), "#777777", 1 );
    hline( origin.plusY( -R ), "#777777", 1 );
}

function yAxes ( origin ) {
    vline( origin, "#000000", 1 );
    vline( origin.plusX( R ), "#777777", 1 );
    vline( origin.plusX( -R ), "#777777", 1 );
}

function operate( operator, angle ) {
   return (operator=="sin") ? Math.sin(angle) : Math.cos(angle);
}

/* TODO: Wave currently starts at 0; should start at startPoint.x */
function wave( startPoint, width, operator, divisions, radius, theta, color ) {
    var i;
    var angleIncrement = (Math.PI * 2)/divisions;
    var x = startPoint.x;
    var y = startPoint.y;
    var increment = (twoPiX - x)/divisions; 
    for( i=0; i < divisions; i++ ) {
        angle = theta + (i*angleIncrement);
        var start = new point( (i)*increment + x, y+radius*operate( operator, angle ) );
        angle = theta+(i+1)*angleIncrement;
        var end = new point( (i+1)*increment + x, y+radius*operate( operator, angle ) );
        line( start, end, color, 1 );
    }
} 

function init( framecount ) {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    ctx.canvas.width  = w.width;
    ctx.canvas.height = w.height;
    frames=framecount;
    return setInterval(draw, 10);
}

function draw() {
    clear();
    ctx.fillStyle = "#FAF7F8";
    rect(0,0,w.width,w.height);
    ctx.fillStyle = "#444444";

    // handy way of storing cos(theta) and sin(theta)
    var thetaPoint = new point( R*Math.cos(theta),  R*Math.sin(theta) ); 

    // point of tangency on the unit circle.
    var tanPoint = origin.plus( thetaPoint );

    var originSin = origin.plusY( thetaPoint.y );

    var originCos = origin.plusX( thetaPoint.x );
    
    ctx.strokeStyle = "#000000";
    circle( origin, R );

    var radiusColor = "#00CC00";
    var sinColor = "#FF0000";
    var cosColor = "#0000FF";
    var debugColor = sinColor;


    var reflectionStart = cosOrigin.plus(new point ( -R, -R ));
    var reflectionEnd   = cosOrigin.plus(new point ( R, R ));
    var reflectionCos   = cosOrigin.plus(new point ( thetaPoint.x, thetaPoint.x ));
    var leftXOrigin     = new point( leftX, origin.y );
    var twoPiXOrigin    = new point( twoPiX, origin.y );
    var leftXcosOrigin  = new point( leftX, cosOrigin.y );
    var cosLeftX        = leftXcosOrigin.plusY( thetaPoint.x );
    var sinLeftX        = leftXOrigin.plusY( thetaPoint.y );
    var divisions       = frames;

    /* =========================== Fixed Lines  =========================== */

    /* AXES */
    xAxes( origin );
    yAxes( origin );
    xAxes( cosOrigin );

    // Reflection line
    line( reflectionStart, reflectionEnd, "#000000", 1); 

    // vertical line at leftX
    vline( leftXOrigin, "#000000", 1 );

    // Text
    text( leftXOrigin.plusY( -1.3 * R ), "Sine", w.height / 30 , sinColor ) ;
    text( leftXcosOrigin.plusY( -1.3 * R ), "Cosine", w.height / 30 , cosColor ) ;

    // vertical line at twoPiX
    vline( twoPiXOrigin, "#000000", 1 );

    /* =========================== Moving Lines =========================== */

    line( origin , tanPoint  , radiusColor, 4 );     // Draw radius.
    line( origin , originSin , sinColor   , 4 );     // Draw sine on Y axis.
    line( origin , originCos , cosColor   , 4 );     // Draw cosine on X axis.

    // connect originCos to reflection line.
    line( tanPoint, reflectionCos, "#000000", 1 );


    // connect reflection line to leftX
    line( reflectionCos, cosLeftX, "#000000", 1 );

    // connect originSin to leftX
    line( tanPoint, sinLeftX, "#000000", 1 );

    // connect originSin to leftX
    line( originSin, sinLeftX, "#000000", 1 );

    // connect originCos to tanPoint
    line( originCos, tanPoint, "#000000", 1 );

    // Sine redrawn on leftX
    line( leftXOrigin, sinLeftX, sinColor, 4 );

    // Sine redrawn on twoPiX
    line( new point( twoPiX, origin.y ),
          new point( twoPiX, origin.y+thetaPoint.y),
          sinColor, 4
    );

    // Cosine redrawn on leftX
    line( leftXcosOrigin, cosLeftX, cosColor, 4 );

    // Cosine redrawn on twoPiX
    line( new point( twoPiX, cosOrigin.y ),
          new point( twoPiX, cosOrigin.y + thetaPoint.x),
          cosColor, 4
    );

    // Sine wave
    wave( leftXOrigin    , twoPiX , "sin" , divisions , R , theta, sinColor );

    // Cosine wave
    wave( leftXcosOrigin , twoPiX , "cos" , divisions , R , theta, cosColor );

    theta = incrementAngle();
}

init( 500 );

var slider = document.getElementById("frameCount");
var output = document.getElementById("sliderOutput");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    var sliderFrames = this.value;
    output.innerHTML = sliderFrames;
    init( sliderFrames );
}
