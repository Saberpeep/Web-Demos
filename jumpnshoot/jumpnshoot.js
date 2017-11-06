var ALREADY_RUNNING;
function beginJumpNShoot(){
    if (ALREADY_RUNNING)
            return;
    ALREADY_RUNNING = true;
    if (typeof jQuery === "undefined") {
        console.log("JumpNShoot: jQuery not present, loading jQ");
        loadjQ();
    }else{
        JumpNShoot();
    }
    function loadjQ() {
        var script = document.createElement("script");
        script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js';
        script.type = 'text/javascript';
        script.onload = function() {
            JumpNShoot();
        }
        document.getElementsByTagName("head")[0].appendChild(script);
    }
}
function JumpNShoot(){
    var FRAMES_PER_SECOND = 60,
        MAX_FALL_SPEED = 15,
        MAX_WALK_SPEED = 10,
        JUMP_VELOCITY = 31,
        BULLET_SPEED = 15,
        $document = $(document),
        $window = $(window),
        $body = $("body"),
        body = document.getElementsByTagName("body")[0],
        $platforms,
        cachedPlatforms = [],
        $targets,
        cachedTargets = [],
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
        $bullets,
        cachedBullets = [],
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
                 "background-image": "url(https://saberpeep.github.io/web-demos/jumpnshoot/jumpnshoot-sheet.png)",
                 "background-repeat": "no-repeat",
                 "background-position-x": "0px",
                 "background-position-y": "-200px",
                 "display": "block",
                 "box-sizing": "content-box",
                 "z-index": "999"
    });
    $arm.css({  "width": "100px",
                 "height": "75px",
                 "position": "absolute",
                 "top": "0px",
                 "left": "0px",
                 "background-color": "transparent",
                 "background-image": "url(https://saberpeep.github.io/web-demos/jumpnshoot/jumpnshoot-arms-sheet.png)",
                 "background-repeat": "no-repeat",
                 "background-position-x": "0px",
                 "transform-origin": "45px 24px"
    });
    $bullet.css({"width": "4px",
                 "height": "4px",
                 "position": "absolute",
                 "top": "0px",
                 "left": "0px",
                 "background-color": "#fd3900",
                 "transform-origin": "20px -15px",
                 "border-radius":"2px",
                 "visibility": "hidden",
                 "z-index": "999"
    });
    //insert elements
    $player.append($arm);
    $body.append($player);
    for (var i = 0; i < 10; i++){
        $body.append($bullet.clone());
    }
    $bullets = $(".bullet");
    
    //collect platform elements
    $platforms = $("div, article, container, aside, header, footer, iframe")
        .not(".bullet, #player, #arm")
        .not(function(){return ($(this).css("position") == "fixed")? true : false;});
    //collect target elements
    $targets = $("span, a, img, h1, h2, h3, h4, h5, li, th, td, button, input")
        .not(".bullet, #player, #arm")
        .not(function(){return ($(this).css("position") == "fixed")? true : false;})
        .not(function(){return ($(this).find("span, a, img, h1, h2, h3, h4, h5, li, th, td").length > 0)? true : false;});
    
    //cache player, platform, bullet, and target positions
    function cachedShape ($element, type = "") {
        this.top = $element.offset().top;
        this.left = $element.offset().left;
        this.height = $element.height();
        this.width = $element.width();
        this.bottom = $element.offset().top + $element.height();
        if (type == "player"){
            this.oneSidePadding = ((($player.innerWidth() - $player.width()) / 2));
            this.innerWidth = $element.innerWidth();
            this.background_position_y = -200;
            this.background_position_x = 0;
        }else if (type == "bullet"){
            this.yVelocity = 0;
            this.xVelocity = 0;
            this.shot = false;
        }else if(type == "platform"){
            this.platform = false;   
        }else if(type == "target"){
            this.hit = false;
            this.destroy = false;
            this.destroyed = false;
            this.hitCounter = 0;
            this.hitAnimation = 0;
        }
    }
    var cachedPlayer = new cachedShape($player, "player");
    
    for (var i = 0; i < $platforms.length; i++)
        cachedPlatforms.push(new cachedShape($platforms.eq(i), "platform"));
    for (var i = 0; i < $bullets.length; i++)
        cachedBullets.push(new cachedShape($bullets.eq(i), "bullet"));
    for (var i = 0; i < $targets.length; i++)
        cachedTargets.push(new cachedShape($targets.eq(i), "target"));
    
    //fix for inline elements not accepting animations
    $targets.is(function(){return ($(this).css("display") == "inline")? true : false;}).addClass("inlineFix");

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
                    0%   {transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); visibility:visible;}\
                    30%   {transform: translateY(-200px) translateX(50px) rotate(520deg) scale(0.5); visibility:visible;}\
                    99% {transform: translateY(300px) translateX(100px) rotate(2500deg) scale(0); visibility:hidden;}\
                    100% {transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); visibility:hidden;}\
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
                    animation-duration: 1s;\
                    animation-timing-function: linear;\
                    animation-fill-mode: forwards;\
               }\
               .destroyed {\
                    visibility: hidden !important;\
               }\
               .inlineFix.destroy {\
                    display:inline-block;\
               }\
               .inlineFix.destroyed {\
                    display:inline-block;\
               }"")
        .appendTo("head");
    //change page title
    $("title").html("JumpNShoot in " + $("title").html());
    
    //PLAYER LOOP
    setInterval(function(){
        cachedPlayer.bottom = cachedPlayer.top + cachedPlayer.height;
        //platform collision
        for (var i = 0; i < cachedPlatforms.length; i++){
            if (cachedPlayer.bottom >= cachedPlatforms[i].top
                && cachedPlayer.bottom < cachedPlatforms[i].top + MAX_FALL_SPEED
                && cachedPlayer.left + cachedPlayer.innerWidth - cachedPlayer.oneSidePadding >= cachedPlatforms[i].left 
                && cachedPlayer.left + cachedPlayer.oneSidePadding <= cachedPlatforms[i].left + cachedPlatforms[i].width
                && yVelocity <= gravity){
                    landed = true;
                    if (cachedPlatforms[i].platform == false){
                        cachedPlatforms[i].platform = true;
                        $platforms.eq(i)[0].classList.add("platform");
                    }
                    if (cachedPlayer.bottom > cachedPlatforms[i].top)
                        cachedPlayer.top = cachedPlatforms[i].top - cachedPlayer.height;
                    break;
            }else if (cachedPlayer.bottom >= $window.height() + $window.scrollTop()){
                    //stops falling out of the bottom of the window
                    landed = true;
                    if (cachedPlayer.bottom > $window.height() + $window.scrollTop())
                        cachedPlayer.top = ($window.height() + $window.scrollTop() - $player.height());
                    break;
            }else{
                    landed = false;
                    if (cachedPlatforms[i].platform == true){
                        cachedPlatforms[i].platform = false;
                        $platforms.eq(i)[0].classList.remove("platform");
                    }
            }
        }
        if (!landed){
            cachedPlayer.background_position_y = 0;
            if(gravity < MAX_FALL_SPEED){
                gravity += 1;
            }
        }else{
                gravity = 0;
        }

        //jump
        if(cachedPlayer.top < 0){
            yVelocity = 0;
            jumpCounter = 0;
        }
        if (yVelocity > gravity)
            cachedPlayer.background_position_y = -100;
        if (landed){
            yVelocity = 0;
            jumpCounter = 2;
            cachedPlayer.background_position_y = -200;
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
                cachedPlayer.top = cachedPlayer.top + MAX_FALL_SPEED;
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
                if (!(cachedBullets[Math.trunc(bulletIndex)].shot)){
                    cachedBullets[Math.trunc(bulletIndex)].shot = true;
                    $bullets[Math.trunc(bulletIndex)].classList.add("shot");
                    if (bulletIndex < $bullets.length - 1)
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
        $window.scrollLeft(cachedPlayer.left - $window.width() / 2 + cachedPlayer.innerWidth / 2);
        $window.scrollTop(cachedPlayer.top - $window.height() / 3);

        //left and right walk
        if (key_walkR)
            walkDirection = 1;
        else if(key_walkL)
            walkDirection = -1;

        if (key_walkL || key_walkR){
            if (key_crouch)
                animation_walk += 0.09;   
            else if(key_run)
                animation_walk += 0.4;
            else
                animation_walk += 0.2;
            cachedPlayer.background_position_x = (Math.trunc(animation_walk) * -100);
            if (animation_walk > 8)
                animation_walk = 1;

            if(xVelocity < MAX_WALK_SPEED){
                xVelocity += 1;
            }
        }else{
            animation_walk = 0;
            cachedPlayer.background_position_x = 0;

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
        cachedPlayer.top = (cachedPlayer.top + gravity - yVelocity);
        cachedPlayer.left = (cachedPlayer.left + adjustedxVelocity * walkDirection);

        //LRedge constraints
        if (cachedPlayer.left + cachedPlayer.oneSidePadding < 0){
            cachedPlayer.left = -1 * cachedPlayer.oneSidePadding; 
        }
        /*else if ($player.position().left + $player.innerWidth() - playerPadding > $window.width() + $window.scrollLeft()){
            //$player.css("left", ($window.width() + $window.scrollLeft() - $player.innerWidth() + playerPadding) + "px");
            $player.css("left","0");
        }*/
        
        //WRITE CACHE TO REAL ELEMENTS
        $player.css({"top": cachedPlayer.top + "px",
                     "left": cachedPlayer.left + "px",
                     "background-position-y": cachedPlayer.background_position_y + "px",
                     "background-position-x": cachedPlayer.background_position_x + "px",
                     "transform": "scaleX(" + walkDirection + ")"});
        
    }, 1000 / FRAMES_PER_SECOND);

    //BULLET LOOP
    setInterval(function(){
        cachedBullets[i]
        if(walkDirection == 1){
            gunpointX = (cachedPlayer.left + 43) + 30 * Math.cos(armAngleRad + 0.6);
            gunpointY = (cachedPlayer.top + 22) + 30 * Math.sin(armAngleRad + 0.6);
            //43,22 is the coords of the shoulder joint, 
            //30 is the radius of a circle that intersects the gunpoint,
            //0.6 is the number of radians it takes to rotate the point to the gun's end
        }else{
            gunpointX = (cachedPlayer.left + 53) + 30 * Math.cos(armAngleRad - 0.6);
            gunpointY = (cachedPlayer.top + 22) + 30 * Math.sin(armAngleRad - 0.6);
        }
        for(var i = 0; i < cachedBullets.length; i++){
            if (!cachedBullets[i].shot){
                cachedBullets[i].top = gunpointY;
                cachedBullets[i].left = gunpointX;
            }else{
                if(cachedBullets[i].yVelocity == 0){
                    cachedBullets[i].xVelocity = (0 + BULLET_SPEED * Math.cos(armAngleRad));
                    cachedBullets[i].yVelocity = (0 + BULLET_SPEED * Math.sin(armAngleRad));
                }
                cachedBullets[i].top = (cachedBullets[i].top + cachedBullets[i].yVelocity);
                cachedBullets[i].left = (cachedBullets[i].left + cachedBullets[i].xVelocity);

                //out of bounds
                if (cachedBullets[i].top + cachedBullets[i].height < 0
                    || cachedBullets[i].top + cachedBullets[i].height + cachedBullets[i].yVelocity > $window.height() + $window.scrollTop()
                    || cachedBullets[i].left + cachedBullets[i].width < 0
                    || cachedBullets[i].left + cachedBullets[i].width + cachedBullets[i].xVelocity > $window.width() + $window.scrollLeft()){
                        if (cachedBullets[i].shot == true){
                            cachedBullets[i].shot = false;
                            $bullets.eq(i)[0].classList.remove("shot");
                        }
                        cachedBullets[i].yVelocity = 0;
                }
            }
            //hitting targets
                for (var j = 0; j < cachedTargets.length; j++){
                    if (cachedTargets[j].destroyed == true){
                        continue;
                    }
                    //out of bounds
                    if (cachedTargets[j].destroy == true
                        && (cachedTargets[j].top + cachedTargets[j].height >= $window.height() + $window.scrollTop()
                        || cachedTargets[j].left >= $window.width() + $window.scrollLeft())){
                            cachedTargets[j].destroy = false;
                            cachedTargets[j].destroyed = true;
                            $targets.eq(j)[0].classList.replace("destroyed","destroy");
                            continue;
                    }
                    if(cachedTargets[j].destroy == false
                       && cachedTargets[j].destroyed == false
                       && cachedBullets[i].shot == true
                       && cachedBullets[i].top >= cachedTargets[j].top
                       && cachedBullets[i].top + cachedBullets[i].height <= cachedTargets[j].top + cachedTargets[j].height
                       && cachedBullets[i].left >= cachedTargets[j].left
                       && cachedBullets[i].left + cachedBullets[i].width <= cachedTargets[j].left + cachedTargets[j].width){
                            if (cachedTargets[j].hit == false){
                                cachedTargets[j].hit = true;
                                $targets.eq(j)[0].classList.add("hit");
                            }
                            cachedBullets[i].shot = false;
                            $bullets.eq(i)[0].classList.remove("shot");
                            cachedBullets[i].yVelocity = 0;

                            if(cachedTargets[j].hitcounter == 0){
                                cachedTargets[j].hitCounter = 1;   
                            }else if(cachedTargets[j].hitCounter < 5){
                                cachedTargets[j].hitCounter = cachedTargets[j].hitCounter + 1;
                            }else{
                                cachedTargets[j].hitCounter = 0;
                                cachedTargets[j].hit = false;
                                cachedTargets[j].destroy = true;
                                $targets.eq(j)[0].classList.remove("hit");
                                $targets.eq(j)[0].classList.add("destroy");
                            }
                    }else{
                        if (cachedTargets[j].hitAnimation == 0 && cachedTargets[j].hit == true){
                            cachedTargets[j].hitAnimation = 5000 / FRAMES_PER_SECOND;
                        }else if(cachedTargets[j].hitAnimation > 0){
                            cachedTargets[j].hitAnimation = cachedTargets[j].hitAnimation - 1;
                        }else{
                            cachedTargets[j].hit = false;
                            $targets.eq(j)[0].classList.remove("hit");
                            cachedTargets[j].hitAnimation = 0;   
                        }   
                    }
                }
        //WRITE CACHED BULLETS TO REAL BULLETS
        $bullets.eq(i).css({"top": cachedBullets[i].top + "px",
                            "left": cachedBullets[i].left + "px"});
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
    
    //update platform and target cache on resize
    var resizeTimer;
    window.addEventListener('resize', function(e){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            //when done resizing
            console.log("updating caches...");
            for (var i = 0; i < cachedPlatforms.length; i++){
                cachedPlatforms[i].top = $platforms.eq(i).offset().top;
                cachedPlatforms[i].left = $platforms.eq(i).offset().left;
                cachedPlatforms[i].height = $platforms.eq(i).height();
                cachedPlatforms[i].width = $platforms.eq(i).width();
            }
            console.log("platform cache updated");
            for (var i = 0; i < cachedTargets.length; i++){
                cachedTargets[i].top = $targets.eq(i).offset().top;
                cachedTargets[i].left = $targets.eq(i).offset().left;
                cachedTargets[i].height = $targets.eq(i).height();
                cachedTargets[i].width = $targets.eq(i).width();
            }
            console.log("target cache updated");
        }, 1000);
    }, true);
}