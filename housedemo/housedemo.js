$(function() {
    $(".side p").text("");
    
    //smoke animation
    var smokeIndex = 0, smokeIndex2 = 1, smokeSize = 4;
    var $smokePuffs = $(".house-smoke .side");
    setInterval(function(){
        $smokePuffs.eq(smokeIndex).addClass("stage2");
        $smokePuffs.eq(smokeIndex2).removeClass("stage2");
        
        smokeIndex = (smokeIndex < smokeSize - 1)? ++smokeIndex : 0;
        smokeIndex2 = (smokeIndex2 < smokeSize - 1)? ++smokeIndex2 : 0;
    }, 1000)
    
    var demoWrap = document.getElementById("demowrap"),
        $house = $(".housewrap"),
        $smoke = $(".house-smoke .cube"),
        $html = $('html');
    
    var offset = 0, startX;
    //rotate on drag
    $("#demowrap")
    .on('mousedown', function (e) {
        startX = e.pageX - offset;
    })
    .on('mouseup', function() {
        startX = null;
    });
    demoWrap.onmousemove = function (e) {
            if(startX) {
                offset = e.pageX - startX;
                if (offset > 360){
                    offset = 0;
                    startX = e.pageX - offset;
                }
                if (offset < 0){
                    offset = 360;
                    startX = e.pageX - offset;
                }

                $smoke.css("transform","rotateZ(" + (offset - 45) + "deg)                                       translateZ(-50px)");
                $house.css("transform","rotateZ(" + (offset * -1) + "deg)");
            }
        /*detect if mouse leaves window*/
        demoWrap.onmouseleave = function(event) {
            $("#demowrap").trigger("mouseup");
        };
    };
    //rotate on swipe
    $("#demowrap")
        .on('touchstart', function (e) {
            startX = e.changedTouches[0].pageX - offset;
        })
        .on('touchend', function() {
            startX = null;
        })
        .on('touchmove', function (e) {
            if(startX) {
                offset = e.changedTouches[0].pageX - startX;
                /*if (offset > 360){
                    offset = 0;
                    startX = e.pageX - offset;
                }
                if (offset < 0){
                    offset = 360;
                    startX = e.pageX - offset;
                }*/

                $smoke.css("transform","rotateZ(" + (offset - 45) + "deg) translateZ(-50px)");
                $house.css("transform","rotateZ(" + (offset * -1) + "deg)");
            }
        /*detect if mouse leaves window*/
        var $window = $(window),
            $html = $('html');
        window.ontouchcancel = function(event) {
            $("#demowrap").trigger("touchend");
        };
    });
});