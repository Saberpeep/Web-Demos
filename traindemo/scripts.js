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
        activeCar = 0;
    
    setActiveCar(activeCar);


    //shift view based on mouse move
    $(document).mousemove(function (event) {
        $demowrap.css("transform","rotateY(" + (((event.pageX - ($demowrap.width() / 2)) / 200)) + "deg)" + "rotateX(" + (((event.pageY - ($demowrap.width() / 2)) / 200) * -1) + "deg)");

        $body.css("background", "linear-gradient(to bottom, #a4ddfc 0%,#ffdad1 " + (30 - event.pageY / 100) + "%,#222222 " + (30 - event.pageY / 100) + "%,#222222 100%)");
    });

    $(".cubewrap").click(function(event){
        var $target = $(this);
        var which = $(".cubewrap").index($target);
        if (activeCar != which)
            event.preventDefault;
        activeCar = which;
        setActiveCar(activeCar);
    });
    var setActiveCarInterval;
    function setActiveCar(car){
        if (setActiveCarInterval){
            clearInterval(setActiveCarInterval);
        }

        var $target = $train.children().eq(car);

        console.log($(".cubewrap").index($target));

        $train.css("transform","translateX(" + (($(".train .cubewrap").index($target) * -500)/ 10) + "vmax)");
        $train.children().removeClass("active");
        $train.children().eq(car).addClass("active");
        
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
    function setCarShade(car,shade){
        if (car >= 0 && car < $train.children().length ){
            $train.children().eq(car).find(".top").css("filter", "brightness(" + (1.5 - shade / 4) + ")");
            $train.children().eq(car).find(".left").css("filter", "brightness(" + (0.6 - shade / 4) + ")");
            $train.children().eq(car).find(".right").css("filter", "brightness(" + (1.2 - shade / 4) + ")");
        }
    }
    function shiftActiveCar(delta){
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