var $window = $(window),
    $body = $("body"),
    $player = $("<div>", {id: "player", html: "&nbsp;"}),
    $platforms = $("div"),
    gravity = 0,
    key_walkL = false,
    key_walkR = false,
    xVelocity = 0,
    adjustedxVelocity = 0,
    landed = false,
    key_jump = false,
    yVelocity = 0,
    jumping = false,
    jumpCounter = 2,
    jumpTime = 0,
    key_crouch = false,
    crouchFallTimer = 0,
    key_run = false,
    key_shoot = false;

//create player element
$player.css({"width": "100px",
             "height": "100px", 
             "background-color": "red",
             "position": "absolute",
             "top": "10px",
             "left": "5px"
            });

$body.prepend($player);
$player = $("#player");

//set up styles
$("<style>")
    .prop("type", "text/css")
    .html(".platform {\
                border-top: 2px solid white !important;\
                transition: border 1s;\
            }")
    .appendTo("head");

//main loop
setInterval(function(){
    for (var i = 0; i < $platforms.length; i++){
        if ($player.offset().top + $player.height() >= $platforms.eq(i).offset().top
            && $player.offset().top + $player.height() < $platforms.eq(i).offset().top + 10
            && $player.offset().left + $player.width() >= $platforms.eq(i).offset().left 
            && $player.offset().left <= $platforms.eq(i).offset().left + $platforms.eq(i).width()){
                landed = true;
                $platforms.eq(i).addClass("platform");
                if ($player.offset().top + $player.height() > $platforms.eq(i).offset().top)
                    $player.css("top", ($platforms.eq(i).offset().top - $player.height()) + "px");
                break;
        }else{
                landed = false;
                $platforms.eq(i).removeClass("platform");
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
    
    //left and right walk
    if (key_walkR){
        if(xVelocity < 10){
            xVelocity += 1;
        }
    }else if(key_walkL){
        if(xVelocity > -10){
            xVelocity -= 1;
        }
    }else{
        if(xVelocity > 0){
            xVelocity -= 0.5;
        }else if(xVelocity < 0){
            xVelocity += 0.5;
        }
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
    
    //scroll to follow player
    $window.scrollLeft($player.offset().left - $window.width() / 2 + $player.width() / 2);
    $window.scrollTop($player.offset().top - $window.height() / 3);
    
    //speed adjustments
    if (key_crouch)
        adjustedxVelocity = xVelocity * 0.2;
    else if (key_run)
        adjustedxVelocity = xVelocity * 1.5;
    else
        adjustedxVelocity = xVelocity;
    
    $player.css("top", ($player.offset().top + gravity - yVelocity) + "px");
    $player.css("left", ($player.offset().left + adjustedxVelocity) + "px");
}, 17);

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