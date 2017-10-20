var $html = $("html"),
    $window = $(window),
    $body = $("body"),
    body = document.getElementsByTagName("body")[0],
    gravity = 0,
    key_walkL = false,
    key_walkR = false,
    animation_walk = 0,
    xVelocity = 0,
    adjustedxVelocity = 0,
    walkDirection = 1,
    landed = false,
    key_jump = false,
    yVelocity = 0,
    jumping = false,
    jumpCounter = 2,
    key_crouch = false,
    crouchFallTimer = 0,
    key_run = false,
    key_shoot = false,
    animation_shoot = 0;

//create player element
var $player = $("<div>", {id: "player", html: ""});
var $arms = $("<div>", {id: "arms", html: ""});
$player.css({"width": "50px",
             "height": "100px",
             "padding-left": "25px",
             "padding-right": "25px",
             "position": "absolute",
             "top": "10px",
             "left": "5px",
             "background-color": "transparent",
             "background-image": "url(images/jumpnshoot-sheet.png)",
             "background-repeat": "no-repeat",
             "background-position-x": "0px"
            });
$arms.css({"width": "100px",
             "height": "100px", 
             "background-color": "transparent",
             "position": "absolute",
             "top": "0px",
             "left": "0px",
             "background-color": "transparent",
             "background-image": "url(images/jumpnshoot-arms-sheet.png)",
             "background-repeat": "no-repeat",
             "background-position-x": "0px",
             "transform-origin": "45px 24px"
            });
$player.append($arms);
$body.prepend($player);

$player.data("padding", (($player.innerWidth() - $player.width()) / 2));
console.log($player.data("padding"));

//collect platform elements
$platforms = $("div, article, container, aside, header, footer, iframe");

//set up styles
$("<style>")
    .prop("type", "text/css")
    .html(".collision {\
                transition: border 1s;\
            }\
            .collision-top {\
                border-top: 2px solid black !important;\
            }\
            .collision-left {\
                border-left: 2px solid black !important;\
            }\
            .collision-right {\
                border-right: 2px solid black !important;\
            }")
    .appendTo("head");
//change page title
$("title").html("JumpNShoot in " + $("title").html());

//player loop
setInterval(function(){
    //platform collision
    for (var i = 0; i < $platforms.length; i++){
        if ($player.offset().top + $player.height() >= $platforms.eq(i).offset().top
            && $player.offset().top + $player.height() < $platforms.eq(i).offset().top + 10
            && $player.offset().left + $player.innerWidth() - $player.data("padding") >= $platforms.eq(i).offset().left 
            && $player.offset().left + $player.data("padding") <= $platforms.eq(i).offset().left + $platforms.eq(i).width()){
                landed = true;
                $platforms.eq(i).addClass("collision collision-top");
                if ($player.offset().top + $player.height() > $platforms.eq(i).offset().top)
                    $player.css("top", ($platforms.eq(i).offset().top - $player.height()) + "px");
                break;
        }else{
                landed = false;
                $platforms.eq(i).removeClass("collision collision-top");
        }
    }
    if (!landed){
        if(gravity < 10){
            gravity += 1;
        }
    }else{
            gravity = 0;
    }
    
    //jump
    if (landed){
        yVelocity = 0;
        jumpCounter = 2;
    }
    if (yVelocity > 0){
        yVelocity--;
    }
    if (key_jump && jumpCounter > 0){
        if (!jumping){
            yVelocity = 30;
            jumpCounter--;   
        }
        jumping = true;
    }else{
        jumping = false;
    }
    
    //crouch fall
    if (key_crouch){
        if (crouchFallTimer < 0.5 * 60){
            crouchFallTimer++;
        }else{
            $player.css("top", ($player.offset().top + 10) + "px");
            falling = true;
            crouchFallTimer = 0;
        }
    }else{
        crouchFallTimer = 0;
    }
    
    //shoot
    if (key_shoot){
        if (animation_shoot < 1)
            animation_shoot = 1;
        animation_shoot += 0.2;
        $arms.css("background-position-x", (Math.trunc(animation_shoot) * -100) + "px");
        if (animation_shoot > 3)
            animation_shoot = 0;
    }else{
        animation_shoot = 0;
        $arms.css("background-position-x", "0px");
    }
    
    //scroll to follow player
    $window.scrollLeft($player.offset().left - $window.width() / 2 + $player.innerWidth() / 2);
    $window.scrollTop($player.offset().top - $window.height() / 3);
    
    //left and right walk
    if (key_walkR)
        walkDirection = 1;
    else if(key_walkL)
        walkDirection = -1;
    
    if (key_walkL || key_walkR){
        $player.css("transform","scaleX(" + walkDirection + ")");
        animation_walk += 0.2;
        $player.css("background-position-x", (Math.trunc(animation_walk) * -100) + "px");
        if (animation_walk > 8)
            animation_walk = 1;
        
        if(xVelocity < 10){
            xVelocity += 1;
        }
    }else{
        animation_walk = 0;
        $player.css("background-position-x","0px");
        
        if(xVelocity > 0){
            xVelocity -= 0.5;
        }else if(xVelocity < 0){
            xVelocity = 0;
        }
    }
    
    //speed adjustments
    if (key_crouch)
        adjustedxVelocity = xVelocity * 0.2;
    else if (key_run)
        adjustedxVelocity = xVelocity * 1.5;
    else
        adjustedxVelocity = xVelocity;
    
    //MAIN POSITION OUTPUT
    $player.css("top", ($player.offset().top + gravity - yVelocity) + "px");
    $player.css("left", ($player.offset().left + adjustedxVelocity * walkDirection) + "px");
    
    //edge constraints
    if ($player.position().left + $player.data("padding") < 0)
        $player.css("left", -$player.data("padding") + "px");
    else if ($player.position().left + $player.innerWidth() > $html.outerWidth())
        $player.css("left", ($html.outerWidth() - $player.innerWidth()) + "px");
    
    if ($player.position().top + $player.height() > $html.height())
        $player.css("top", ($html.height() - $player.height()) + "px");
}, 17);

//arms
$window.mousemove(function(e) {
    if(walkDirection == 1)
        $arms.css("transform","rotate(" + (Math.atan2(e.pageY - $player.offset().top - $player.height() / 2 + 26, e.pageX - $player.offset().left - $player.innerWidth() / 2) * 180 / Math.PI) + "deg)"); //26 is the difference between the shoulder joint and the middle of the player
    else
        $arms.css("transform","rotate(" + (-1 * (Math.atan2(e.pageY - $player.offset().top - $player.height() / 2 + 26, e.pageX - $player.offset().left - $player.innerWidth() / 2) * 180 / Math.PI) + 180) + "deg)");
});

//controls
$window.keydown(function(e){
    e.preventDefault();
    if (e.keyCode == '32' || e.keyCode == '87' || e.keyCode == '38') //SPACE W UPARROW
        key_jump = true;
    if (e.keyCode == '65' || e.keycode == '37') //A LEFTARROW
        key_walkL = true;
    if (e.keyCode == '68' || e.keycode == '39') //D RIGHTARROW
        key_walkR = true;
    if (e.keyCode == '83' || e.keycode == '40') //S DOWNARROW
        key_crouch = true;
    if (e.keyCode == '16') //SHIFT
        key_run = true;
});
$window.keyup(function(e){
    e.preventDefault();
    if (e.keyCode == '32' || e.keyCode == '87' || e.keyCode == '38') //SPACE W UPARROW
        key_jump = false;
    if (e.keyCode == '65' || e.keycode == '37') //A LEFTARROW
        key_walkL = false;
    if (e.keyCode == '68' || e.keycode == '39') //D RIGHTARROW
        key_walkR = false;
    if (e.keyCode == '83' || e.keycode == '40') //S DOWNARROW
        key_crouch = false;
    if (e.keyCode == '16') //SHIFT
        key_run = false;
});
$window.mousedown(function(e){
    e.preventDefault();
    if(e.which == 1)
        key_shoot = true;
});
$window.mouseup(function(e){
    //e.preventDefault();
    if(e.which == 1)
        key_shoot = false;
});