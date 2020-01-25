(function(Breakdown) {
    Breakdown.start = function() {
        if (Breakdown.ALREADY_RUNNING){
            console.warn("Breakdown: can't start, instance already running!");
            return;   
        }
        Breakdown.ALREADY_RUNNING = true;
        //check for and load required scripts
        var prereqs = [];
        if (typeof jQuery === "undefined" || jQuery.fn.jquery < "3.2.1") {
            console.log("Breakdown: jQuery 3.2.1 or greater not present, loading jQ");
            prereqs.push(loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js'));
        }
        if (typeof Matter === "undefined") {
            console.log("Breakdown: Matter phys engine not present, loading Matter");
            prereqs.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.14.2/matter.min.js'));
        }
        if (prereqs.length){
            Promise.all(prereqs).then(main);
        }else{
            main();
        }
    };
    function loadScript(src) {
        return new Promise(function(resolve, reject){
            var script = document.createElement("script");
            script.src = src; //'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js';
            script.type = 'text/javascript';
            script.onload = function() {
                console.log("Breakdown: loaded script", src);
                resolve();
            }
            document.getElementsByTagName("head")[0].appendChild(script);
        });
    }
    function main(){
        var $window = $(window),
            $body = $(document.body),
            $targets,
            targets = [];

        //SETUP

        //setup Matter
        //enablesleeping improves performance by sticking elements when they come to rest
        var engine = Matter.Engine.create({enableSleeping: true});
        
        //setup physical boundries
        var Boundries = function($element){
            this.width = $element.width();
            this.height = $element.height();
            this.wallThickness = 100;
            //calculate size and position of where wall should be, given its index in the walls array
            this.calcWall = function calcWall(index){
                switch(index){
                    case 0: //top
                        return {
                            x: this.width / 2,
                            y: -this.wallThickness / 2,
                            width: this.width * 2,
                            height: this.wallThickness,
                        }
                    case 1: //right
                        return {
                            x: this.width + this.wallThickness / 2,
                            y: this.height / 2,
                            width: this.wallThickness,
                            height: this.height * 2
                        }
                    case 2: //bottom
                        return {
                            x: this.width / 2,
                            y: this.height + this.wallThickness / 2,
                            width: this.width * 2,
                            height: this.wallThickness,
                        }
                    case 3: //left
                        return {
                            x: -this.wallThickness / 2,
                            y: this.height / 2,
                            width: this.wallThickness,
                            height: this.height * 2,
                        }
                }
            }.bind(this);
            //stores matter rectangles in clockwise order starting at the top
            //top, right, bottom, left
            this.walls = [];
            //generate and store rectangle bodies
            for (var i = 0; i < 4; i++){
                var wall = this.calcWall(i);
                this.walls.push(Matter.Bodies.rectangle(wall.x, wall.y, wall.width, wall.height, { isStatic: true }));
            }
            //add the bodies to the world
            Matter.World.add(engine.world, this.walls);

            //update wall bodies to new size and position based on size of target $element 
            this.update = function update(){
                boundries.needsUpdate = false;
                //store current values for scaling calculations later
                var orig = [];
                for (var i = 0; i < 4; i++){
                    orig.push(this.calcWall(i));
                }
                //update width and height values to match current state of $element
                this.width = $element.width();
                this.height = $element.height();
                //go through each wall and update it
                for (var i = 0; i < 4; i++){
                    var wall = this.calcWall(i);
                    //wake wall so it notices changes
                    Matter.Sleeping.set(this.walls[i], false);
                    //update position
                    Matter.Body.setPosition(this.walls[i], {
                        x: wall.x, 
                        y: wall.y
                    });
                    //update scale, vertical walls scaled vertically, horizontal walls scaled horizontally
                    if (wall.width > wall.height){
                        Matter.Body.scale(this.walls[i], orig[i].width / this.width, 1);
                    }else{
                        Matter.Body.scale(this.walls[i], 1, orig[i].height / this.height);
                    }
                    //console.log('wall', i, 'updated \nfrom', orig[i], '\nto', wall);
                }
                //wake all phys elements so that any sleeping elements notice the changes
                for (var i = 0; i < targets.length; i++){
                    if(targets[i]){
                        Matter.Sleeping.set(targets[i].matterRect, false);
                    }
                }
            }.bind(this);

            // update boundries on resize
            var resizeTimer;
            window.addEventListener('resize', function(e){
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    //when done resizing
                    this.needsUpdate = true;
                }, 500);
            }.bind(this), true);

            //update on page focus, incase window was resized when in background
            document.addEventListener('visibilitychange', function(){
                if (!document.hidden) this.update();
            }.bind(this));
        }
        var boundries = new Boundries($body);

        //setup container for absoulte positioning
        var $container = $("<div>", {id: "breakdown_container", html: ""});
        $container.appendTo($body);
        $body.css({'position':'relative'});

        //collect elements to be breakable
        var selectors = "span, a, p, img, h1, h2, h3, h4, h5, li, th, td, dt, dd, button, input, cite";
        $targets = $(selectors)
            .not(function(){return ($(this).css("position") == "fixed")? true : false;})
            .not(function(){return ($(this).find(selectors).length > 0)? true : false;});

        var maxItems = 500;
        if ($targets.length > maxItems){
            console.warn("Breakdown: target array length limited to ", maxItems, " (", $targets.length, ")");
            $targets.slice(maxItems).css("opacity", "0.7");
            $targets = $targets.slice(0, maxItems);

        }

        //cache player, platform, bullet, and target positions
        function physRect ($element) {
            //measure dimentions
            var height = $element.height();
            var width = $element.width();
            if (width == 0 || height == 0) throw new Error('Error creating physRect: width or height cannot be zero');
            var top = $element.offset().top;
            var left = $element.offset().left;
            var point = {
                x: left + (width / 2),
                y: top + (height / 2),
            }
            //copy element to root
            this.$element = $element.clone();
            this.$element
                .addClass('breakdown-element')
                .css({
                    'top': `${-height / 2}px`,
                    'left': `${-width / 2}px`,
                    'width': `${width}px`,
                    'height': `${height}px`,
                })
                .attr('draggable', false)
                .appendTo($container);
            //hide original
            $element.css({'visibility':'hidden'});
            //set up body in Matter
            this.matterRect = Matter.Bodies.rectangle(point.x, point.y, width, height);
            Matter.World.add(engine.world, this.matterRect);
            Matter.Events.on(engine, 'afterUpdate', function(event) {
                var engine = event.source;

                //if body falls outside of boundries, reset it to the middle
                if (this.matterRect.position.y > boundries.height){
                    Matter.Body.setPosition(this.matterRect, {x: boundries.width / 2, y: boundries.height / 2})
                }

                var position = this.matterRect.position;
                var angle = this.matterRect.angle;
                this.$element[0].style.transform = `translate(${position.x}px, ${position.y}px) rotate(${angle}rad)`;
            }.bind(this));
        }

        //create physRects based on $targets
        for (var i = 0; i < $targets.length; i++){
            try{
                targets.push(new physRect($targets.eq(i)));
            }catch(e){
                console.warn(e.message);
                continue;
            }
        }
            
        //fix for inline elements not accepting animations
        $targets.filter(function(){return ($(this).css("display") == "inline")? true : false;}).addClass("inlineFix");

        //set up style classes
        $("<style>")
            .prop("type", "text/css")
            .html(`
                body{
                    position: relative;
                }
                #breakdown_container {
                    position: absolute;
                    z-index: 99;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                }
                #breakdown_container .breakdown-element {
                    position: absolute;
                    top: 0;
                    left: 0;
                    transform-origin: center;
                    background-color: rgba(128,128,128,0.1);
                    transition: none;
                    user-select: none;
                    user-drag: none;
                    pointer-events: none;
                }
                #breakdown_container .breakdown-element.inlineFix {
                    display:inline-block;
                }
            `)
            .appendTo("head");
        //change page title
        $("title").text("Breakdown! " + $("title").text());

        // add mouse control
        var mouse = Matter.Mouse.create($body[0]),
        mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
            }
        });
        Matter.World.add(engine.world, mouseConstraint);

        //Main Loop
        function mainLoop(){
            
            if (boundries.needsUpdate) boundries.update();
            Matter.Engine.update(engine, 1000 / 60);
            requestAnimationFrame(mainLoop);

        }
        requestAnimationFrame(mainLoop);
    }
}( window.Breakdown = window.Breakdown || {}));