$("#input1").keypress(function(event){
    if(event.keyCode == 13 && $("#button1").attr("disabled") != "disabled"){
        $("#button1").click();
    }
});
/* set on ground: $("#cube .vertical-adj").css("transform","translateZ(100px)"); */
$("#button1").click(function(){
    $("#button1").attr("disabled","disabled");
    
    var randomrow = Math.floor((Math.random() * 5) + 1);
    var randomdir = Math.floor((Math.random() * 3) + 1);
    cubesruntext($("#input1").val(),randomdir,randomrow);
    
    $("#button1").removeAttr("disabled");
});


var CUBESIZEINPIXELS = $(".cubewrap").eq(0).width();

var flat = [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
];
var qbert = [
    [4,5,6,7,8],
    [3,4,5,6,7],
    [2,3,4,5,6],
    [1,2,3,4,5],
    [0,1,2,3,4]
];
function cubesloadarray(arr,factor){
    if (factor == 0){
        cubesloadarray(flat,1);
        return;
    }
    factor = factor || 1;
    count = 1;
    for (var y = 0; y < arr.length; y++){
        for (var x = 0; x < arr[0].length; x++){
            //sets cube height
            $("#cube" + count + " .vertical-adj")
                .css("transform","translateZ(" +
                     ((arr[y][x] * CUBESIZEINPIXELS * factor) + (CUBESIZEINPIXELS / 2)) +
                "px)");
            //set shadow darkness based on height
            $("#cube" + count)
                .css("background-color","rgba(0, 0, 0, " + (0.8 / (arr[y][x] * factor)) + ")");
            count++;
        }
    }
}

function cubescleartext(){
    $(".side p").html("");
}
function cubesscrolltext(selector,side,text,order,direction){
    //string selector  is  all .cubes or specific cube id
    //string side      is class of side .left .right etc
    //string text      is the text to display
    //int    order     is 1 or 2 for running that side of cube first
    //int    direction is -1 or 1 for direction of scroll
    var direction = direction || 1;
    var time = 0.5;
    if (order < 1) order = 1;
    var jqelement = $(selector + " " + side + " p");
    var size = 100;
    
    //prime text for scrolling
    jqelement
        .html(text)
        .css("transition","")
        .css("transform","translateX(" + (CUBESIZEINPIXELS * order * direction) + "px)")
        /* removed because we can now count on width being ~=CUBESIZEINPIXELS
        .css("transform","translateX(" + (jqelement.width() * order * direction) + "px)");*/
        .css("font-size", size + "%");
    
    //calculate required font size
    //for smaller than CUBESIZEINPIXELS
    var wassmaller = false
    for (size; jqelement.width() < CUBESIZEINPIXELS; size+=0.5){
        wassmaller=true;
        jqelement.css("font-size", size + "%");
    }
    //for bigger than CUBESIZEINPIXELS
    for (size; jqelement.width() > CUBESIZEINPIXELS && !wassmaller; size-=0.5){
        jqelement.css("font-size", size + "%");
    }   
    
    //scroll the text
    setTimeout(function(){
        if(order <= 1){
            jqelement.css("transition","all " + (time * order) + "s linear");
        }else{
            jqelement.css("transition","all " + (time * order - (0.5 * time)) + "s linear");
        }
        jqelement.css("transform","translateX(" + (-100 * direction) + "%)");
    },100);
        
}
function cubesclearclasses(){
    $(".side").removeClass("rtt ltt ltr ttr");
}

function cubesruntext(text,direction,row){
    row = (row < 1)? 1 : row;
    row = (row > 5)? 5 : row;
    
    if (!text || text == ""){
        console.log("ERROR in cubesruntext() - text not defined")
        return false;
    } 
    if (text.length < 4){
        text = "&nbsp;&nbsp;" + text + "&nbsp;&nbsp;";
    }
    direction = direction || "ttr";
    
    if (direction == "rtt" || direction == 1){
        var cubenum = row + 20;
        var cuberuninterval = setInterval(function(){
            if(cubenum < 0 ){
                clearInterval(cuberuninterval);
            }
            $("#cube" + cubenum + " .cube .side").removeClass("rtt ltt ltr ttr");
            $("#cube" + cubenum + " .cube .side").addClass("rtt");
            cubesscrolltext("#cube" + cubenum,".right",text,1,1);
            cubesscrolltext("#cube" + cubenum,".top",text,2,1);
            cubenum -= 5;
        }, 550);
        
    }else if (direction == "ltt" || direction == 2){
        var cubenum = ((row - 1)  * 5) + 1;
        var cuberuninterval = setInterval(function(){
            if(cubenum >= (5 * row)){
                clearInterval(cuberuninterval);
            }
            $("#cube" + cubenum + " .cube .side").removeClass("rtt ltt ltr ttr");
            $("#cube" + cubenum + " .cube .side").addClass("ltt");
            cubesscrolltext("#cube" + cubenum,".left",text,1,-1);
            cubesscrolltext("#cube" + cubenum,".top",text,2,-1);
            cubenum += 1;
        }, 550);
        
        
    }else if (direction == "ltre" || direction == 99){
    /*    //WORK IN PROGRESS 
        //goes around the edge
        var cubecount = 0;
        var cubenum = 1;
        var order = 1;
        
        //calculate font size?
        
        
        var cuberuninterval = setInterval(function(){
            if (row < 5){
                for(var i = (((row - 1)  * 5) + 6); i < (((row - 1)  * 5) + 11); i++){
                    $("#cube" + i).css("margin-top", CUBESIZEINPIXELS + "px");   
                }
            }
            if(cubecount >= 3 + row){
                $(".cubewrap").css("margin-top","0");
                clearInterval(cuberuninterval);
            }
            $("#cube" + cubenum + " .cube .side").removeClass("rtt ltt ltr ttr");
            $("#cube" + cubenum + " .cube .side").addClass("ltr");
            
            if (cubecount == row - 1){
                //going around corner
                cubesscrolltext("#cube" + cubenum,".left",text,1,-1);
                cubesscrolltext("#cube" + cubenum,".right",text,2,-1);
                cubenum++;
            }
            if (cubecount < row - 1){
                //going across left sides
                cubesscrolltext("#cube" + cubenum,".left",text,0.5,-1);
                cubenum += 5;
            }else if (cubecount > row - 1){
                //going across right sides
                cubesscrolltext("#cube" + cubenum,".right",text,0.5,-1);
                cubenum += 1;
            }
            cubecount++;
        }, 550);
        
        */
    } if (direction == "ltr" || direction == 3){
        //left to right along each corner
        var cubenum,limit;
        switch (row){
            case 1:
                cubenum = 3;
                limit = 15;
                break;
            case 2:
                cubenum = 2;
                limit = 20;
                break;
            case 3:
                cubenum = 1;
                limit = 25;
                break;
            case 4:
                cubenum = 6;
                limit = 24;
                break;
            case 5:
                cubenum = 11;
                limit = 23;
                break;
        }
        var cuberuninterval = setInterval(function(){
            if(cubenum >= limit){
                clearInterval(cuberuninterval);
            }
            $("#cube" + cubenum + " .cube .side").removeClass("rtt ltt ltr ttr");
            $("#cube" + cubenum + " .cube .side").addClass("ltr");
            
            cubesscrolltext("#cube" + cubenum,".left",text,1,-1);
            cubesscrolltext("#cube" + cubenum,".right",text,2,-1);
            cubenum += 6;
        }, 550);
        
    }else{
        //ttr
        $(".side").addClass("rtt");
        
    }
    
    
}

//demo code
cubescleartext();
cubesbeginloopdemo();
var loopdemointerval;
function cubesbeginloopdemo(){ 
    cubesloadarray(qbert,1);
    var verbs   = ["Work","Make","Do","Makes"];
    var nouns   = ["It","Us"];
    var adverbs = ["Harder","Better","Faster","Stronger"];
    var solo    = ["More","Than","Ever","Hour","After","Hour","Work","Is","Never","Over"];
    var tick = 1;
    var randomrow = 1;
    var randomdir = 1;
    loopdemointerval = setInterval(function(){
        var randomverb   = Math.floor((Math.random() * 4) + 1) - 1
        var randomnoun   = Math.floor((Math.random() * 2) + 1) - 1
        var randomadverb = Math.floor((Math.random() * 4) + 1) - 1
        switch (tick){
            //random stanzas
            case 1:
            case 4:
            case 7:
                randomdir = Math.floor((Math.random() * 3) + 1);
                randomrow = Math.floor((Math.random() * 5) + 1);
                cubesruntext(verbs[randomverb],randomdir,randomrow);
                break;
            case 2:
            case 5:
            case 8:
                cubesruntext(nouns[randomnoun],randomdir,randomrow);
                break;
            case 3:
            case 6:
            case 9:
                cubesruntext(adverbs[randomadverb],randomdir,randomrow);
                break;
            //solo
            case 10:
                randomdir = Math.floor((Math.random() * 3) + 1);
                randomrow = Math.floor((Math.random() * 5) + 1);
                cubesruntext(solo[tick-10],randomdir,randomrow);
                break;
            case 11:
            case 12:
                cubesruntext(solo[tick-10],randomdir,randomrow);
                break;
            case 13:
                randomdir = Math.floor((Math.random() * 3) + 1);
                randomrow = Math.floor((Math.random() * 5) + 1);
                cubesruntext(solo[tick-10],randomdir,randomrow);
                break;
            case 14:
            case 15:
                cubesruntext(solo[tick-10],randomdir,randomrow);
                break;
            case 16:
                randomdir = Math.floor((Math.random() * 3) + 1);
                randomrow = Math.floor((Math.random() * 5) + 1);
                cubesruntext(solo[tick-10],randomdir,randomrow);
                break;
            case 17:
            case 18:
            case 19:
                cubesruntext(solo[tick-10],randomdir,randomrow);
                break;
            //reset
            case 20:
                tick = -1;
                break;
        }
    tick++;
    }, 800);//must be at least 800 at current speed
}
function cubesstoploopdemo(){
    clearInterval(loopdemointerval);
    cubesloadarray(flat,1);
}

//demo code intro
/*cubescleartext();
var tick = 0;
var introinterval = setInterval(function(){
    var randomrow = Math.floor((Math.random() * 5) + 1);
    var randomdir = Math.floor((Math.random() * 2) + 1);
    switch (tick){
        case 2:
            cubesloadarray(qbert,1);
            cubesruntext("Welcome","ltr",3);
            break;
        case 4:
            cubesruntext("To","ltr",2);
            break;
        case 5:
            cubesruntext("This","ltr",2);
            break;
        case 6:
            cubesruntext("___little___","ltr",3);
            break;
        case 7:
            cubesruntext("Demo","ltt",1);
            break;
        case 8:
            cubesruntext("I Hope","ltr",3);
            break;
        case 9:
            cubesruntext("You","ltr",3);
            break;
        case 10:
            cubesruntext("Enjoy!","rtt",3);
            break;
        case 12:
            cubesbeginloopdemo();
            clearInterval(introinterval);
            break;
    }
    tick++;
}, 1000);*/