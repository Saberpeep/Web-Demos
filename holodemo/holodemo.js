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
    var offset = 0, isMouseDown = false;
    var side = 0;
    var $cube = $(".objinnerwrap");
    var $sprite = $(".house-smoke .cube");
    
    function setRotationStyles(offset){
        $(".top").children().css("transform","rotateZ(" + (offset * -1) + "deg) translateZ(50px)");
        $sprite.css("transform","rotateZ(" + (offset - 45) + "deg) translateZ(50px)");
        $cube.css("transform","rotateZ(" + (offset * -1) + "deg)");
    }
    function shiftActiveSide(delta){
        side += (delta * -1);
        if (side > 3){
            side = 0;
        }else if (side < 0){
            side = 3;
        }
        //console.log(side);
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
        .on('mousemove', function (e) {
            if(isMouseDown) {
                newpos = e.pageX;
                var delta;
                if(newpos > lastpos){
                    delta = 1;
                }else if (newpos < lastpos){
                    delta = -1;
                }else{
                    delta = 0;
                }
                console.log(delta);
                offset += (delta * 90);
                
                shiftActiveSide(delta);
                setRotationStyles(offset);
                
                isMouseDown = false;
            }
            //detect if mouse leaves window while dragging
            var $window = $(window),
                $html = $('html');
            $window.on('mouseleave', function(event) {
                if (!$html.is(event.target))
                    return;
                $("#demowrap").trigger("mouseup");
            });
        });
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
            if(isMouseDown) {
                newpos = e.changedTouches[0].pageX;
                var delta;
                if(newpos > lastpos){
                    delta = 1;
                }else if (newpos < lastpos){
                    delta = -1;
                }else{
                    delta = 0;
                }
                console.log(delta);
                offset += (delta * 90);
                
                shiftActiveSide(delta);
                setRotationStyles(offset);
                
                isMouseDown = false;
            }
            //detect if touch leaves window while dragging
            var $window = $(window),
                $html = $('html');
            $window.on('touchcancel', function(event) {
                if (!$html.is(event.target))
                    return;
                $("#demowrap").trigger("touchend");
            });
        });
});
