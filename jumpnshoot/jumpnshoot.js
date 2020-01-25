(function(JumpNShoot) {
    JumpNShoot.start = function() {
        if (JumpNShoot.ALREADY_RUNNING){
            console.warn("JumpNShoot: can't start, instance already running!");
            return;   
        }
        JumpNShoot.ALREADY_RUNNING = true;
        //ie11 compat
        Math.trunc = Math.trunc || function(x) {
          if (isNaN(x)) {
            return NaN;
          }
          if (x > 0) {
            return Math.floor(x);
          }
          return Math.ceil(x);
        };
        //jq check
        if (typeof jQuery === "undefined" || jQuery.fn.jquery < "3.2.1") {
            console.log("JumpNShoot: jQuery 3.2.1 or greater not present, loading jQ");
            loadjQ();
        }else{
            main();
        }
    };
    function loadjQ() {
        var script = document.createElement("script");
        script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js';
        script.type = 'text/javascript';
        script.onload = function() {
            console.log("JumpNShoot: loaded jQuery", jQuery.fn.jquery);
            main();
        }
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    function main(){
        JumpNShoot.MAX_FALL_SPEED = 15;
        JumpNShoot.MAX_WALK_SPEED = 10;
        JumpNShoot.JUMP_VELOCITY = 31;
        JumpNShoot.BULLET_SPEED = 15;
        var $window = $(window),
            $body = $(document.body),
            //objects
            $platforms,
            cachedPlatforms = [],
            $targets,
            cachedTargets = [],
            $bullets,
            cachedBullets = [],
            //physics
            gravity = 0,
            xVelocity = 0,
            walkDirection = 1,
            landed = false,
            yVelocity = 0,
            jumping = false,
            jumpCounter = 2,
            crouchFallTimer = 0,
            armAngleRad = 0,
            armAngleDeg = 0,
            bulletIndex = 0,
            gunpointX = 0,
            gunpointY = 0,
            fps = 0,
            //controls
            key_walkL = false,
            key_walkR = false,
            key_run = false,
            key_jump = false,
            key_crouch = false,
            key_shoot = false,
            mousePosX,
            mousePosY,
            //animation
            animation_walk = 0,
            animation_shoot = 0;

        //SETUP
        //create player element
        var $player = $("<div>", {id: "player", html: ""});
        var $arm = $("<div>", {id: "arm", html: ""});
        var $bullet = $("<span>", {class: "bullet", html: ""});
        $player.css({"width": "50px",
                     "height": "100px",
                     "padding": "0",
                     "margin": "0",
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
                     "padding": "0",
                     "margin": "0",
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
                     "padding": "0",
                     "margin": "0",
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
            .not(function(){return ($(this).find("span, a, img, h1, h2, h3, h4, h5, li, th, td, button, input").length > 0)? true : false;});

        var maxItems = 1500;
        if ($platforms.length > maxItems){
            console.warn("JumpNShoot: platform array length limited to ", maxItems, " (", $platforms.length, ")");
            $platforms.slice(maxItems).css("opacity", "0.7");
            $platforms = $platforms.slice(0, maxItems);   
        }
        if ($targets.length > maxItems){
            console.warn("JumpNShoot: target array length limited to ", maxItems, " (", $targets.length, ")");
            $targets = $targets.slice(0, maxItems);

        }

        //cache player, platform, bullet, and target positions
        function cachedShape ($element, type) {
            if (!type) type = "";
            this.$element = $element;
            function updatePositionCache(){
                this.height = this.$element.height();
                this.width = this.$element.width();
                this.top = this.$element.offset().top;
                this.left = this.$element.offset().left;
                this.bottom = this.$element.offset().top + this.$element.height();
                this.right = this.$element.offset().left + this.$element.width();
            }
            //'bind' allows 'this' to be used inside the function
            updatePositionCache = updatePositionCache.bind(this);
            //run once initially
            updatePositionCache();
            if (type != "bullet" && type != "player"){
                //export the function for use later
                this.updatePositionCache = updatePositionCache;
            }
            
            if (type == "player"){
                //oneSidePadding is effectively the difference between the player sprite and a perfect square (on one side)
                // This is used to calculate more accurate-looking collision when the feet are near edges.
                this.oneSidePadding = ((($element.innerWidth() - $element.width()) / 2));
                this.innerWidth = $element.innerWidth();
                this.background_position_y = -200;
                this.background_position_x = 0;
                this.arm = {
                    background_position_x: 0, 
                }
            }else if (type == "bullet"){
                this.yVelocity = 0;
                this.xVelocity = 0;
                this.shot = false;
            }else if(type == "platform"){
                this.active_platform = false;   
            }else if(type == "target"){
                this.hit = false; //hit wobble animation state
                this.destroy = false; //destroy spin animation state
                this.destroyed = false; //destroyed hidden state
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
        $targets.filter(function(){return ($(this).css("display") == "inline")? true : false;}).addClass("inlineFix");

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
                  .active_platform {\
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
                   .inlineFix.hit, .inlineFix.destroy, .inlineFix.destroyed {\
                        display:inline-block;\
                   }")
            .appendTo("head");
        //change page title
        $("title").text("JumpNShoot in " + $("title").text());

        //PLAYER LOOP
        function playerloop(){
            cachedPlayer.bottom = cachedPlayer.top + cachedPlayer.height;
            //platform collision
            for (var i = 0; i < cachedPlatforms.length; i++){
                if (!isOnScreen(cachedPlatforms[i], JumpNShoot.MAX_WALK_SPEED * 1.5, JumpNShoot.MAX_FALL_SPEED)) continue;

                if (cachedPlayer.bottom >= cachedPlatforms[i].top
                    && cachedPlayer.bottom < cachedPlatforms[i].top + JumpNShoot.MAX_FALL_SPEED
                    && cachedPlayer.left + cachedPlayer.innerWidth - cachedPlayer.oneSidePadding >= cachedPlatforms[i].left 
                    && cachedPlayer.left + cachedPlayer.oneSidePadding <= cachedPlatforms[i].right
                    && yVelocity <= gravity){
                        landed = true;
                        if (cachedPlatforms[i].active_platform == false){
                            cachedPlatforms[i].active_platform = true;
                            $platforms[i].classList.add("active_platform");
                        }
                        if (cachedPlayer.bottom > cachedPlatforms[i].top)
                            //prevents falling through platforms
                            cachedPlayer.top = cachedPlatforms[i].top - cachedPlayer.height;
                        break;
                }else if (cachedPlayer.bottom >= document.documentElement.clientHeight + window.pageYOffset){
                        //prevents falling out of the bottom of the window
                        landed = true;
                        if (cachedPlayer.bottom > document.documentElement.clientHeight + window.pageYOffset)
                            cachedPlayer.top = (document.documentElement.clientHeight + window.pageYOffset - cachedPlayer.height);
                        break;
                }else if(cachedPlayer.top + cachedPlayer.height <= 0){
                        //prevents being stuck above top of window
                        landed = false;
                        cachedPlayer.top = JumpNShoot.MAX_FALL_SPEED - cachedPlayer.height;
                        break;
                }else{
                        landed = false;
                        if (cachedPlatforms[i].active_platform == true){
                            cachedPlatforms[i].active_platform = false;
                            $platforms[i].classList.remove("active_platform");
                        }
                }
            }
            if (!landed){
                cachedPlayer.background_position_y = 0; //falling sprites
                if(gravity < JumpNShoot.MAX_FALL_SPEED){
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
                cachedPlayer.background_position_y = -100; //jumping sprites
            if (landed){
                yVelocity = 0;
                jumpCounter = 2;
                cachedPlayer.background_position_y = -200; //walking sprites
            }
            if (yVelocity > 0){
                yVelocity--;
            }
            if (key_jump && jumpCounter > 0 && Math.trunc(yVelocity) == 0){
                if (!jumping){
                    yVelocity = JumpNShoot.JUMP_VELOCITY;
                    jumpCounter--;   
                }
                jumping = true;
            }else{
                jumping = false;
            }

            //crouch fall
            if (key_crouch){
                if (crouchFallTimer < 0.5 * fps){
                    crouchFallTimer++;
                }else{
                    cachedPlayer.top = cachedPlayer.top + JumpNShoot.MAX_FALL_SPEED;
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
                cachedPlayer.arm.background_position_x = (Math.trunc(animation_shoot) * -100);
                if (animation_shoot > 3)
                    animation_shoot = 0;
            }else{
                animation_shoot = 0;
                cachedPlayer.arm.background_position_x = 0;
            }

            //scroll to follow player
            window.scrollTo(cachedPlayer.left - $window.width() / 2 + cachedPlayer.innerWidth / 2,
                            cachedPlayer.top - document.documentElement.clientHeight / 3 );

            //Arm angle to mouse position
            armAngleDeg = (walkDirection * Math.atan2(mousePosY - $player.offset().top - $player.height() / 2 + 26, mousePosX - $player.offset().left - $player.innerWidth() / 2) * 180 / Math.PI) + ((walkDirection > 0)? 0 : 180); 
            armAngleRad = (Math.atan2(mousePosY - $player.offset().top - $player.height() / 2 + 26, mousePosX - $player.offset().left - $player.innerWidth() / 2));
            //26 is the difference between the shoulder joint and the middle of the player
            
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

                if(xVelocity < JumpNShoot.MAX_WALK_SPEED){
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
            var xVelocityAdj = 1;
            if (key_crouch)
                xVelocityAdj = 0.2;
            else if (key_run)
                xVelocityAdj = 1.5;

            //MAIN POSITION OUTPUT
            cachedPlayer.top = (cachedPlayer.top + gravity - yVelocity);
            cachedPlayer.left = (cachedPlayer.left + xVelocity * xVelocityAdj * walkDirection);

            //left screen edge constraint
            if (cachedPlayer.left + cachedPlayer.oneSidePadding < 0){
                cachedPlayer.left = -1 * cachedPlayer.oneSidePadding; 
            }

            //WRITE CACHE TO REAL ELEMENTS
            $player.css({"top": cachedPlayer.top + "px",
                         "left": cachedPlayer.left + "px",
                         "background-position-y": cachedPlayer.background_position_y + "px",
                         "background-position-x": cachedPlayer.background_position_x + "px",
                         "transform": "scaleX(" + walkDirection + ")"});
            $arm.css({"transform": "rotate(" + armAngleDeg + "deg)",
                      "background-position-x": cachedPlayer.arm.background_position_x + "px"});
            
            requestAnimationFrame(playerloop);
        }
        requestAnimationFrame(playerloop);

        //BULLET LOOP
        function bulletLoop(){
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
                    //hide unfired bullets near the top left
                    cachedBullets[i].top = -5;
                    cachedBullets[i].left = -5;
                }else{
                    if(cachedBullets[i].yVelocity == 0 && cachedBullets[i].xVelocity == 0){
                        cachedBullets[i].top = gunpointY;
                        cachedBullets[i].left = gunpointX;
                        cachedBullets[i].xVelocity = (JumpNShoot.BULLET_SPEED * Math.cos(armAngleRad));
                        cachedBullets[i].yVelocity = (JumpNShoot.BULLET_SPEED * Math.sin(armAngleRad));
                    }
                    cachedBullets[i].top = (cachedBullets[i].top + cachedBullets[i].yVelocity);
                    cachedBullets[i].left = (cachedBullets[i].left + cachedBullets[i].xVelocity);

                    //bullet out of bounds
                    if (cachedBullets[i].shot && !isOnScreen(cachedBullets[i], cachedBullets[i].xVelocity, cachedBullets[i].yVelocity)){
                            if (cachedBullets[i].shot){
                                cachedBullets[i].shot = false;
                                $bullets[i].classList.remove("shot");
                            }
                            cachedBullets[i].yVelocity = 0;
                            cachedBullets[i].xVelocity = 0;
                    }
                }
                //hitting targets
                    for (var j = 0; j < cachedTargets.length; j++){
                        if (cachedTargets[j].destroyed == true){
                            continue;
                        }
                        //animation out of bounds
                        if (cachedTargets[j].destroy == true
                            && (cachedTargets[j].bottom >= document.documentElement.clientHeight + window.pageYOffset
                            || cachedTargets[j].left >= document.documentElement.clientWidth + window.scrollLeft)){
                                cachedTargets[j].destroy = false;
                                cachedTargets[j].destroyed = true;
                                $targets[j].classList.remove("destroy");
                                $targets[j].classList.add("destroyed");
                                continue;
                        }

                        if(cachedTargets[j].destroy == false
                           && cachedTargets[j].destroyed == false
                           && cachedBullets[i].shot == true
                           && cachedBullets[i].top >= cachedTargets[j].top
                           && cachedBullets[i].top + cachedBullets[i].height <= cachedTargets[j].bottom
                           && cachedBullets[i].left >= cachedTargets[j].left
                           && cachedBullets[i].left + cachedBullets[i].width <= cachedTargets[j].left + cachedTargets[j].width){
                                if (cachedTargets[j].hit == false){
                                    cachedTargets[j].hit = true;
                                    $targets[j].classList.add("hit");
                                }
                                cachedTargets[j].hitAnimation = 1.4 * fps;
                                cachedBullets[i].shot = false;
                                $bullets[i].classList.remove("shot");
                                cachedBullets[i].yVelocity = 0;
                                cachedBullets[i].xVelocity = 0;

                                if(cachedTargets[j].hitcounter == 0){
                                    cachedTargets[j].hitCounter = 1;   
                                }else if(cachedTargets[j].hitCounter < 5){
                                    cachedTargets[j].hitCounter = cachedTargets[j].hitCounter + 1;
                                }else{
                                    cachedTargets[j].hitCounter = 0;
                                    cachedTargets[j].hit = false;
                                    cachedTargets[j].destroy = true;
                                    $targets[j].classList.remove("hit");
                                    $targets[j].classList.add("destroy");
                                }
                        }else{
                            if(cachedTargets[j].hitAnimation > 0){
                                cachedTargets[j].hitAnimation = cachedTargets[j].hitAnimation - 1;
                            }else{
                                cachedTargets[j].hit = false;
                                $targets[j].classList.remove("hit");
                                cachedTargets[j].hitAnimation = 0;   
                            }
                        }
                    }
            //WRITE CACHED BULLETS TO REAL BULLETS
            $bullets.eq(i).css({"top": cachedBullets[i].top + "px",
                                "left": cachedBullets[i].left + "px"});
            }
            requestAnimationFrame(bulletLoop);
        }
        requestAnimationFrame(bulletLoop);

        //frustrum culling
        function isOnScreen(cacheItem, xVelocity, yVelocity){
            if(!xVelocity) xVelocity = 0;
            if(!yVelocity) yVelocity = 0;
            if (!cacheItem instanceof cachedShape) throw new Error('isOnScreen requires instanceof cachedShape');

            if (cacheItem.top < window.pageYOffset + document.documentElement.clientHeight - yVelocity //bottom
                && cacheItem.top + cacheItem.height > window.pageYOffset + yVelocity //top
                && cacheItem.left < window.pageXOffset + document.documentElement.clientWidth - xVelocity //right
                && cacheItem.left + cacheItem.width > window.pageXOffset + xVelocity //left
            ){
                return true;
            }
            return false;
        }

        //Measure FPS - used to adjust durations so seconds accurately represent real seconds
        var lastFrameStartTime = performance.now();
        function fpsMeasure(now){
            fps = 1000 / (now - lastFrameStartTime);
            lastFrameStartTime = now;

            requestAnimationFrame(fpsMeasure);
        }
        requestAnimationFrame(fpsMeasure);

        //CONTROLS
        window.addEventListener('mousemove', function(e){
            mousePosX = e.pageX;
            mousePosY = e.pageY;
        });

        $window.keydown(keyHandler(true));
        $window.keyup(keyHandler(false));
        function keyHandler(state){
            return function(e){
                var captured = true;

                if (e.keyCode == '32' || e.keyCode == '87' || e.keyCode == '38' || e.key == "ArrowUp") //SPACE W UPARROW
                    key_jump = state;
                else if (e.keyCode == '65' || e.keycode == '37' || e.key == "ArrowLeft") //A LEFTARROW
                    key_walkL = state;
                else if (e.keyCode == '68' || e.keycode == '39' || e.key == "ArrowRight") //D RIGHTARROW
                    key_walkR = state;
                else if (e.keyCode == '83' || e.keycode == '40' || e.key == "ArrowDown") //S DOWNARROW
                    key_crouch = state;
                else if (e.keyCode == '16') //SHIFT
                    key_run = state;
                else 
                    captured = false;

                if (captured) e.preventDefault();
            }
        }

        window.addEventListener('mousedown', clickHandler(true));
        window.addEventListener('mouseup', clickHandler(false))
        window.addEventListener('click', clickHandler());
        function clickHandler(state){
            return function(e){
                if(e.which == 1){
                    if (e.target.classList.contains('jumpnshoot-click-allowed')){
                        key_shoot = false;
                    }else{
                        e.preventDefault(); //prevents dragging text selection
                        if(state !== undefined) key_shoot = state;
                    }
                }
            }
        }

        // update platform and target cache on resize
        var resizeTimer;
        window.addEventListener('resize', function(e){
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                //when done resizing
                var then = performance.now();
                
                for (var i = 0; i < cachedPlatforms.length; i++){
                    cachedPlatforms[i].updatePositionCache();
                }

                var now = performance.now();
                console.log("JumpNShoot: platform cache updated (" + Math.trunc(now - then) + "ms)");
                then = now;

                for (var i = 0; i < cachedTargets.length; i++){
                    cachedTargets[i].updatePositionCache();
                }
                
                now = performance.now();
                console.log("JumpNShoot: target cache updated (" + Math.trunc(now - then) + "ms)");
            }, 500);
        }, true);
    }
}( window.JumpNShoot = window.JumpNShoot || {}));

