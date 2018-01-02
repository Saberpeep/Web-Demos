$parallaxEl = $(".parallax");
$parallaxEl.css("bottom", ($parallaxEl.width() / 10 - 16) + "px")
//shift view based on mouse move
$(document).mousemove(function (event) {
    $parallaxEl.css("transform","rotateY(" + (((event.pageX - ($(".parallax").width() / 2)) / 200)) + "deg)"
                                    + "rotateX(" + (((event.pageY - ($(".parallax").width() / 2)) / 200) * -1) + "deg)");
  
});
window.addEventListener('resize', function(e){
        $parallaxEl.css("bottom", ($parallaxEl.width() / 10 - 16) + "px");
}, true);