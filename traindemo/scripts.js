$(function() {
    //setup
    var CUBESIZEINPIXELS = $(".cubewrap").eq(0).width(),
        isMouseDown = false,
        $window = $(window),
        $html = $('html'),
        $body = $("body"),
        $demowrap = $("#demowrap"),
        demowrap = document.getElementById("demowrap"),
        $train = $(".train"),
        activeCar = 0,
        $links = $(".cubewrap .car .right a"),
        $crane = $(".crane"),
        scrollDisable = false;
    
    setActiveCar(activeCar);


    //shift view based on mouse move
    $(document).mousemove(function (event) {
        $demowrap.css("transform","rotateY(" + (((event.pageX - ($demowrap.width() / 2)) / 200)) + "deg)" + "rotateX(" + (((event.pageY - ($demowrap.width() / 2)) / 200) * -1) + "deg)");

        $body.css("background", "linear-gradient(to bottom, #a4ddfc 0vh,#ffdad1 " + (30 - event.pageY / 100) + "vh,#222222 " + (30 - event.pageY / 100) + "vh,#222222 100vh)");
    });
    
    //car click scroll
    $(".cubewrap").click(function(event){
        event.preventDefault();
        var $target = $(this);
        var which = $(".cubewrap").index($target);
        if (activeCar != which){
            activeCar = which;
            setActiveCar(activeCar);
        }
    });
    
    //link click animation
    $links.click(function(event){
        event.preventDefault();
        var $target = $(this);
        var which = $links.index($target);
        if (activeCar == which){
            scrollDisable = true;
            $crane.addClass("animate-down");
            setTimeout(function(){
                $train.children().eq(activeCar).addClass("animate-up");
                $crane.removeClass("animate-down");
                setTimeout(function(){
                   window.location.href = $target.attr("href");
                }, 1500);
            }, 1000);
        }
    });
    //sets active car by index
    var setActiveCarInterval,
        setActiveCarTimeout;
    function setActiveCar(car){
        if (setActiveCarInterval || setActiveCarTimeout){
            clearInterval(setActiveCarInterval);
            clearTimeout(setActiveCarTimeout);
        }
        if (!scrollDisable){

            var $target = $train.children().eq(car);

            $train.css("transform","translateX(" + (($(".train .cubewrap").index($target) * -500)/ 10) + "vw)");
            $train.children().removeClass("active");
            setActiveCarTimeout = setTimeout(function(){
                $train.children().eq(car).addClass("active");  
            },1400);

            var i = 0;
            setActiveCarInterval = setInterval(function(){
                setCarShade(i, Math.abs(car - i));
                i++;
                if (i >= $train.children().length){
                    clearInterval(setActiveCarInterval);
                    return;
                }
            },10);
        }
    }
    //shades car of index based on shade factor 
    function setCarShade(car,shade){
        if (car >= 0 && car < $train.children().length ){
            $train.children().eq(car).find(".top").css("filter", "brightness(" + (1.5 - shade / 4) + ")");
            $train.children().eq(car).find(".left").css("filter", "brightness(" + (0.6 - shade / 4) + ")");
            $train.children().eq(car).find(".right").css("filter", "brightness(" + (1.2 - shade / 4) + ")");
            $train.children().eq(car).find(".back").css("filter", "brightness(" + (0.8 - shade / 4) + ")");
        }
    }
    //calls setActiveCar based on index of current car and delta
    function shiftActiveCar(delta){
        if (!scrollDisable){
            if (delta > 0)
                activeCar--;
            else if(delta < 0)
                activeCar++;

            if (activeCar < 0)
                activeCar = 0;
            if (activeCar >= $train.children().length)
                activeCar = $train.children().length - 1;
            setActiveCar(activeCar);
        }
    }

   //rotate on drag
    var lastpos, newpos;
    $("#demowrap")
        .on('mousedown', function (e) {
            isMouseDown = true;
            lastpos = e.pageX;
        })
        .on('mouseup', function(e) {
            isMouseDown = false;
        })
        demowrap.onmousemove = function (e) {
            if(isMouseDown && e.pageX != lastpos) {
                newpos = e.pageX;
                var delta = 0;
                if(newpos > lastpos){
                    delta = 1;
                }else if (newpos < lastpos){
                    delta = -1;
                }
                //offset += (delta * 90);
                
                shiftActiveCar(delta);
                
                isMouseDown = false;
            }
            //detect if mouse leaves window while dragging
            window.onmouseleave = function(event) {
                if (!$html.is(event.target))
                    return;
                $("#demowrap").trigger("mouseup");
            };
        };
    //rotate on mouse wheel
    $(window).mousewheel(function(e, delta) {
        //offset += (delta * 90);
        
        shiftActiveCar(delta);
        
        e.preventDefault();
    });
    //rotate on touch swipe
    $("#demowrap")
        .on('touchstart', function (e) {
            isMouseDown = true;
            lastpos = e.changedTouches[0].pageX;
        })
        .on('touchend', function(e) {
            isMouseDown = false;
        })
        .on('touchmove', function (e) {
            if(isMouseDown && e.changedTouches[0].pageX != lastpos) {
                newpos = e.changedTouches[0].pageX;
                var delta = 0;
                if(newpos > lastpos){
                    delta = 1;
                }else if (newpos < lastpos){
                    delta = -1;
                }
                //offset += (delta * 90);
                
                shiftActiveCar(delta);
                
                isMouseDown = false;
            }
            //detect if touch leaves window while dragging
            $window.on('touchcancel', function(event) {
                if (!$html.is(event.target))
                    return;
                $("#demowrap").trigger("touchend");
            });
        });
});