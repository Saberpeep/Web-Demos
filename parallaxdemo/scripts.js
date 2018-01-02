$parallaxEl = $(".parallax");
$parallaxEl.css("bottom", calcOffset($parallaxEl.width()) + "px")
//shift view based on mouse move
$(document).mousemove(function (event) {
    $parallaxEl.css("transform","rotateY(" + (((event.pageX - ($(".parallax").width() / 2)) / 200)) + "deg)"
                                    + "rotateX(" + (((event.pageY - ($(".parallax").width() / 2)) / 200) * -1) + "deg)");
  
});
window.addEventListener('resize', function(e){
        $parallaxEl.css("bottom", calcOffset($parallaxEl.width()) + "px");
}, true);
function calcOffset(width){
    var offset = width / 12 - 16, 
        upper = 200,
        lower = 100;
    if (offset < lower)
        return lower;
    else if (offset > upper)
        return upper;
    return offset;
}