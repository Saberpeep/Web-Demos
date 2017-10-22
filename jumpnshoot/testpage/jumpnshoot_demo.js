var FRAMES_PER_SECOND = 60,
    MAX_FALL_SPEED = 15,
    MAX_WALK_SPEED = 10,
    JUMP_VELOCITY = 31,
    BULLET_SPEED = 15,
    $document = $(document),
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
    animation_shoot = 0,
    armAngleRad = 0,
    armAngleDeg = 0,
    bulletIndex = 0,
    gunpointX = 0,
    gunpointY = 0;

//SETUP
//create player element
var $player = $("<div>", {id: "player", html: ""});
var $arm = $("<div>", {id: "arms", html: ""});
var $bullet = $("<span>", {class: "bullet", html: ""});
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
             "background-position-x": "0px",
             "background-position-y": "-200px"
});
$arm.css({  "width": "100px",
             "height": "75px",
             "position": "absolute",
             "top": "0px",
             "left": "0px",
             "background-color": "transparent",
             "background-image": "url(images/jumpnshoot-arms-sheet.png)",
             "background-repeat": "no-repeat",
             "background-position-x": "0px",
             "transform-origin": "45px 24px"
});
$bullet.css({"width": "4px",
             "height": "4px",
             "position": "absolute",
             "top": "0px",
             "left": "0px",
             "background-color": "#ffe492",
             "transform-origin": "20px -15px",
             "border-radius":"2px",
             "visibility": "hidden"
});
//insert elements
$player.append($arm);
$body.prepend($player);
for (var i = 0; i < 10; i++){
    $body.prepend($bullet.clone());
}
$bullets = $(".bullet");

$player.data("padding", (($player.innerWidth() - $player.width()) / 2));

//collect platform elements
$platforms = $("div, article, container, aside, header, footer, iframe");
//collect target elements
$targets = $("span, a, img, h1, h2, h3, h4, h5, li, th, td").not(".bullet, #player, #arm");

//set up style classes
$("<style>")
    .prop("type", "text/css")
    .html("@keyframes hit {\
                0%   {transform: rotate(0deg)}\
                45%  {transform: rotate(5deg)}\
                85% {transform: rotate(-5deg)}\
                100% {transform: rotate(0deg)}\
            }\
           @keyframes destroy {\
                0%   {transform: translateY(0px) translateX(0px) rotate(0deg); visibility:visible;}\
                25%   {transform: translateY(-500px) translateX(200px) rotate(300deg); visibility:visible;}\
                99% {transform: translateY(3000px) translateX(300px) rotate(1800deg); visibility:hidden;}\
                100% {transform: translateY(0px) translateX(0px) rotate(0deg); visibility:hidden;}\
            }\
          .platform {\
                transition: border 1s;\
                border-top: 2px solid black !important;\
            }\
           .shot {\
                visibility: visible !important;\
            }\
           .hit {\
                transform-origin: center center;\
                animation-name: hit;\
                animation-duration: 0.3s;\
                animation-iteration-count: infinite;\
                animation-timing-function: cubic-bezier(.61,-0.16,.52,1.06);\
           }\
           .destroy {\
                transform-origin: center center;\
                animation-name: destroy;\
                animation-duration: 3s;\
                animation-timing-function: linear;\
                animation-fill-mode: forwards;\
           }\
           .destroyed {\
                visibility: hidden;\
           }")
    .appendTo("head");
//change page title
$("title").html("JumpNShoot in " + $("title").html());

//$body.css("overflow","hidden");

//PLAYER LOOP
setInterval(function(){
    //platform collision
    for (var i = 0; i < $platforms.length; i++){
        if ($player.offset().top + $player.height() >= $platforms.eq(i).offset().top
            && $player.offset().top + $player.height() < $platforms.eq(i).offset().top + MAX_FALL_SPEED
            && $player.offset().left + $player.innerWidth() - $player.data("padding") >= $platforms.eq(i).offset().left 
            && $player.offset().left + $player.data("padding") <= $platforms.eq(i).offset().left + $platforms.eq(i).width()){
                landed = true;
                $platforms.eq(i).addClass("platform");
                if ($player.offset().top + $player.height() > $platforms.eq(i).offset().top)
                    $player.css("top", ($platforms.eq(i).offset().top - $player.height()) + "px");
                break;
        }else if ($player.offset().top + $player.height() >= $window.height() + $window.scrollTop()){
                //stops falling out of the bottom of the window
                landed = true;
                if ($player.offset().top + $player.height() > $window.height() + $window.scrollTop())
                    $player.css("top", ($window.height() + $window.scrollTop() - $player.height()) + "px");
                break;
        }else{
                landed = false;
                $platforms.eq(i).removeClass("platform");
        }
    }
    if (!landed){
        $player.css("background-position-y", "0px");
        if(gravity < MAX_FALL_SPEED){
            gravity += 1;
        }
    }else{
            gravity = 0;
    }
    
    //jump
    if (yVelocity > gravity)
        $player.css("background-position-y", "-100px");
    if (landed){
        yVelocity = 0;
        jumpCounter = 2;
        $player.css("background-position-y", "-200px");
    }
    if (yVelocity > 0){
        yVelocity--;
    }
    if (key_jump && jumpCounter > 0 && yVelocity == 0){
        if (!jumping){
            yVelocity = JUMP_VELOCITY;
            jumpCounter--;   
        }
        jumping = true;
    }else{
        jumping = false;
    }
    
    //crouch fall
    if (key_crouch){
        if (crouchFallTimer < 0.5 * FRAMES_PER_SECOND){
            crouchFallTimer++;
        }else{
            $player.css("top", ($player.offset().top + MAX_FALL_SPEED) + "px");
            falling = true;
            crouchFallTimer = 0;
        }
    }else{
        crouchFallTimer = 0;
    }
    
    //shoot
    if (key_shoot){
        if (animation_shoot < 1){
            animation_shoot = 1;
            if (!$bullets.eq(Math.trunc(bulletIndex)).hasClass("shot")){
                $bullets.eq(Math.trunc(bulletIndex)).addClass("shot");
                if (bulletIndex < $bullets.length)
                    bulletIndex += 1;
                else
                    bulletIndex = 0;
            }else{
                animation_shoot = 0;
            }
        }
        animation_shoot += 0.2;
        $arm.css("background-position-x", (Math.trunc(animation_shoot) * -100) + "px");
        if (animation_shoot > 3)
            animation_shoot = 0;
    }else{
        animation_shoot = 0;
        $arm.css("background-position-x", "0px");
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
        if (key_crouch)
            animation_walk += 0.09;   
        else if(key_run)
            animation_walk += 0.4;
        else
            animation_walk += 0.2;
        $player.css("background-position-x", (Math.trunc(animation_walk) * -100) + "px");
        if (animation_walk > 8)
            animation_walk = 1;
        
        if(xVelocity < MAX_WALK_SPEED){
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
    
    //LRedge constraints
    if ($player.position().left + $player.data("padding") < 0){
        $player.css("left", -1 * $player.data("padding") + "px");   
    }
    /*else if ($player.position().left + $player.innerWidth() - $player.data("padding") > $window.width() + $window.scrollLeft()){
        //$player.css("left", ($window.width() + $window.scrollLeft() - $player.innerWidth() + $player.data("padding")) + "px");
        $player.css("left","0");
    }*/
}, 1000 / FRAMES_PER_SECOND);

//BULLET LOOP
setInterval(function(){
    if(walkDirection == 1){
        gunpointX = ($player.offset().left + 43) + 30 * Math.cos(armAngleRad + 0.6);
        gunpointY = ($player.offset().top + 22) + 30 * Math.sin(armAngleRad + 0.6);
        //43,22 is the coords of the shoulder joint, 
        //30 is the radius of a circle that intersects the gunpoint,
        //0.6 is the number of radians it takes to rotate the point to the gun's end
    }else{
        gunpointX = ($player.offset().left + 53) + 30 * Math.cos(armAngleRad - 0.6);
        gunpointY = ($player.offset().top + 22) + 30 * Math.sin(armAngleRad - 0.6);
    }
    for(var i = 0; i < $bullets.length; i++){
        var $activeBullet = $bullets.eq(i);
        if (!$activeBullet.hasClass("shot")){
            $activeBullet.css("left", (gunpointX) + "px")
                         .css("top", (gunpointY) + "px");
        }else{
            if(!$activeBullet.data("Yvelocity")){
                $activeBullet.data("Xvelocity", (0 + BULLET_SPEED * Math.cos(armAngleRad)));
                $activeBullet.data("Yvelocity", (0 + BULLET_SPEED * Math.sin(armAngleRad)));
            }
            $activeBullet.css("top", ($activeBullet.offset().top + $activeBullet.data("Yvelocity")) + "px");
            $activeBullet.css("left", ($activeBullet.offset().left + $activeBullet.data("Xvelocity")) + "px");
            
            //out of bounds
            if ($activeBullet.offset().top + $activeBullet.height() < 0
                || $activeBullet.offset().top + $activeBullet.height() + $activeBullet.data("Yvelocity") > $window.height() + $window.scrollTop()
                || $activeBullet.offset().left + $activeBullet.width() < 0
                || $activeBullet.offset().left + $activeBullet.width() + $activeBullet.data("Xvelocity") > $window.width() + $window.scrollLeft()){
                    $activeBullet.removeClass("shot");
                    $activeBullet.removeData("Yvelocity");
                    //continue;
            }
        }
        //hitting targets
            for (var j = 0; j < $targets.length; j++){
                var $activeTarget = $targets.eq(j);
                if(!$activeTarget.hasClass("destroy")
                   && !$activeTarget.hasClass("destroyed")
                   && $activeBullet.hasClass("shot")
                   && $activeBullet.offset().top >= $activeTarget.offset().top
                   && $activeBullet.offset().top + $activeBullet.height() <= $activeTarget.offset().top + $activeTarget.height()
                   && $activeBullet.offset().left >= $activeTarget.offset().left
                   && $activeBullet.offset().left + $activeBullet.width() <= $activeTarget.offset().left + $activeTarget.width()){
                        $activeTarget.addClass("hit");
                        $activeBullet.removeClass("shot");
                        $activeBullet.removeData("Yvelocity");
                    
                        if(!$activeTarget.data("hitCounter")){
                            $activeTarget.data("hitCounter", 1);   
                        }else if($activeTarget.data("hitCounter") < 5){
                            $activeTarget.data("hitCounter", $activeTarget.data("hitCounter") + 1);
                        }else{
                            $activeTarget.data("hitCounter", 0);
                            $activeTarget.removeClass("hit");
                            $activeTarget.addClass("destroy");
                        }
                }else{
                    if (!$activeTarget.data("hitAnimation") && $activeTarget.hasClass("hit")){
                        $activeTarget.data("hitAnimation", 5000 / FRAMES_PER_SECOND);
                    }else if($activeTarget.data("hitAnimation") > 0){
                        $activeTarget.data("hitAnimation", $activeTarget.data("hitAnimation") - 1);
                    }else{
                        $activeTarget.removeClass("hit");
                        $activeTarget.removeData("hitAnimation");
                    }   
                }
                //out of bounds
                if ($activeTarget.hasClass("destroy")
                    && ($activeTarget.offset().top + $activeTarget.height() > $window.height() + $window.scrollTop()
                    || $activeTarget.offset().left > $window.width() + $window.scrollLeft())){
                        $activeTarget.addClass("destroyed").removeClass("destroy");
                }
            }
    }
}, 1000 / FRAMES_PER_SECOND);

//ARM ANGLE BY MOUSE POSITION
window.onmousemove = function (e) {
    if(walkDirection == 1){
        armAngleDeg = (Math.atan2(e.pageY - $player.offset().top - $player.height() / 2 + 26, e.pageX - $player.offset().left - $player.innerWidth() / 2) * 180 / Math.PI); 
        armAngleRad = (Math.atan2(e.pageY - $player.offset().top - $player.height() / 2 + 26, e.pageX - $player.offset().left - $player.innerWidth() / 2));
        //26 is the difference between the shoulder joint and the middle of the player
    }else{
        armAngleDeg = (-1 * (Math.atan2(e.pageY - $player.offset().top - $player.height() / 2 + 26, e.pageX - $player.offset().left - $player.innerWidth() / 2) * 180 / Math.PI) + 180);
        armAngleRad = ((Math.atan2(e.pageY - $player.offset().top - $player.height() / 2 + 26, e.pageX - $player.offset().left - $player.innerWidth() / 2)));
    }
    
    $arm.css("transform","rotate(" + armAngleDeg + "deg)");
}

//CONTROLS
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
window.onmousedown = function (e) {
    e.preventDefault();
    if(e.which == 1)
        key_shoot = true;
}
window.onmouseup = function (e) {
    //e.preventDefault();
    if(e.which == 1)
        key_shoot = false;
}