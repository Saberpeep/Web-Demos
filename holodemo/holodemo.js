$(function() {
    //animations for active side
    $active = $(".active");
    setInterval(function(){
        if (! $active.hasClass("stage2")){
            $active.addClass("stage2");    
        }else{
            $active.removeClass("stage2");
        }
    }, 1000);
    
    //setup
    var offset = 0,
        isMouseDown = false,
        side = 0,
        $cube = $(".objinnerwrap"),
        $sprite = $(".house-smoke .cube"),
        demoWrap = document.getElementById("demowrap"),
        $window = $(window),
        $html = $('html');
    
    function setRotationStyles(offset){
        $(".top").children().css("transform","rotateZ(" + (offset * -1) + "deg) translateZ(50px)");
        $sprite.css("transform","rotateZ(" + (offset - 45) + "deg) translateZ(50px)");
        $cube.css("transform","rotateZ(" + (offset * -1) + "deg)");
        $("#msg").css("opacity","0");
    }
    function shiftActiveSide(delta){
        side += (delta * -1);
        if (side > 3){
            side = 0;
        }else if (side < 0){
            side = 3;
        }
        if(side == 0){
            $(".side").removeClass("active");
            $(".front").addClass("active");
            $active = $(".active");
        }else if(side == 1){
            $(".side").removeClass("active");
            $(".right").addClass("active");
            $active = $(".active");
        }else if(side == 2){
            $(".side").removeClass("active");
            $(".back").addClass("active");
            $active = $(".active");
        }else if(side == 3){
            $(".side").removeClass("active");
            $(".left").addClass("active");
            $active = $(".active");
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
    demoWrap.onmousemove = function (e) {
            if(isMouseDown && e.pageX != lastpos) {
                newpos = e.pageX;
                var delta = 0;
                if(newpos > lastpos){
                    delta = 1;
                }else if (newpos < lastpos){
                    delta = -1;
                }
                console.log(newpos,lastpos,delta);
                offset += (delta * 90);
                
                shiftActiveSide(delta);
                setRotationStyles(offset);
                
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
        offset += (delta * 90);
        
        shiftActiveSide(delta);
        setRotationStyles(offset);
        
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
                offset += (delta * 90);
                
                shiftActiveSide(delta);
                setRotationStyles(offset);
                
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
