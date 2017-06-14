$(".side p").text("");
$(function() {
    var offset = 0, startX;
    var $elem = $(".housewrap");
    $("#demowrap")
        .on('mousedown', function (e) {
            startX = e.pageX - offset;
        })
        .on('mouseup', function() {
            startX = null;
        })
        .on('mousemove', function (e) {
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

                $elem.css("transform","rotateZ(" + (offset * -1) + "deg)");
            }
        /*detect if mouse leaves window*/
        var $window = $(window),
            $html = $('html');
        $window.on('mouseleave', function(event) {
            if (!$html.is(event.target))
                return;
            $("#demowrap").trigger("mouseup");
        });
    });
});
