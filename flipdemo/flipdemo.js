$plane = $(".plane");
$cols = $(".col");
$panels = $(".panel");
var charPixels = {
    SPACE:[
        [0],
        [0],
        [0],
        [0],
        [0]],
    EXCLAMATION:[
        [1],
        [1],
        [1],
        [0],
        [1]],
    QUOTE:[
        [1,0,1],
        [1,0,1],
        [0,0,0],
        [0,0,0],
        [0,0,0]],
    POUND:[
        [0,1,0,1,0],
        [1,1,1,1,1],
        [0,1,0,1,0],
        [1,1,1,1,1],
        [0,1,0,1,0]],
    DOLLAR:[
        [1,1,1,1,1],
        [1,0,1,0,0],
        [1,1,1,1,1],
        [0,0,1,0,1],
        [1,1,1,1,1]],
    PERCENT:[
        [1,1,0,0,1],
        [1,1,0,1,0],
        [0,0,1,0,0],
        [0,1,0,1,1],
        [1,0,0,1,1]],
    AMP:[
        [1,1,1],
        [1,0,0],
        [0,1,0],
        [1,0,0],
        [1,1,1]],
    APOS:[
        [1],
        [1],
        [0],
        [0],
        [0]],
    LPAREN:[
        [0,1],
        [1,0],
        [1,0],
        [1,0],
        [0,1]],
    RPAREN:[
        [1,0],
        [0,1],
        [0,1],
        [0,1],
        [1,0]],
    ASTERISK:[
        [1,0,1],
        [0,1,0],
        [1,0,1],
        [0,0,0],
        [0,0,0]],
    PLUS:[
        [0,0,0],
        [0,1,0],
        [1,1,1],
        [0,1,0],
        [0,0,0]],
    COMMA:[
        [0],
        [0],
        [0],
        [1],
        [1]],
    DASH:[
        [0,0,0],
        [0,0,0],
        [1,1,1],
        [0,0,0],
        [0,0,0]],
    DOT:[
        [0],
        [0],
        [0],
        [0],
        [1]],
    SLASH:[
        [0,0,0,0,1],
        [0,0,0,1,0],
        [0,0,1,0,0],
        [0,1,0,0,0],
        [1,0,0,0,0]],
    ZERO:[
        [0,1,0],
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [0,1,0]],
    ONE:[
        [0,1,0],
        [1,1,0],
        [0,1,0],
        [0,1,0],
        [1,1,1]],
    TWO:[
        [1,1,0],
        [0,0,1],
        [1,1,1],
        [1,0,0],
        [1,1,1]],
    THREE:[
        [1,1,0],
        [0,0,1],
        [0,1,1],
        [0,0,1],
        [1,1,0]],
    FOUR:[
        [1,0,1],
        [1,0,1],
        [1,1,1],
        [0,0,1],
        [0,0,1]],
    FIVE:[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [0,0,1],
        [1,1,0]],
    SIX:[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [1,0,1],
        [1,1,1]],
    SEVEN:[
        [1,1,1],
        [0,0,1],
        [0,0,1],
        [0,0,1],
        [0,0,1]],
    EIGHT:[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [1,0,1],
        [1,1,1]],
    NINE:[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [0,0,1],
        [1,1,1]],
    COLON:[
        [1],
        [1],
        [0],
        [1],
        [1]],
    SEMICOLON:[
        [0],
        [1],
        [0],
        [1],
        [1]],
    LESSTHAN:[
        [0,0,1],
        [0,1,0],
        [1,0,0],
        [0,1,0],
        [0,0,1]],
    EQUALS:[
        [0,0,0],
        [1,1,1],
        [0,0,0],
        [1,1,1],
        [0,0,0]],
    GREATERTHAN:[
        [1,0,0],
        [0,1,0],
        [0,0,1],
        [0,1,0],
        [1,0,0]],
    QUESTIONMARK:[
        [1,1,1],
        [0,0,1],
        [0,1,1],
        [0,0,0],
        [0,1,0]],
    ATSIGN:[
        [1,1,1,1],
        [1,0,1,1],
        [1,0,1,1],
        [1,0,0,0],
        [1,1,1,1]],
     A:[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [1,0,1],
        [1,0,1]],
     B:[
        [1,1,1],
        [1,0,1],
        [1,1,0],
        [1,0,1],
        [1,1,1]],
     C:[
        [1,1,1],
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1,1,1]],
     D:[
        [1,1,0],
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [1,1,0]],
     E:[
        [1,1,1],
        [1,0,0],
        [1,1,0],
        [1,0,0],
        [1,1,1]],
     F:[
        [1,1,1],
        [1,0,0],
        [1,1,0],
        [1,0,0],
        [1,0,0]],
     G:[
        [1,1,1],
        [1,0,0],
        [1,0,0],
        [1,0,1],
        [1,1,1]],
     H:[
        [1,0,1],
        [1,0,1],
        [1,1,1],
        [1,0,1],
        [1,0,1]],
     I:[
        [1,1,1],
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [1,1,1]],
     J:[
        [1,1,1],
        [0,0,1],
        [0,0,1],
        [1,0,1],
        [1,1,1]],
     K:[
        [1,0,1],
        [1,0,1],
        [1,1,0],
        [1,0,1],
        [1,0,1]],
     L:[
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1,1,1]],
     M:[
        [1,0,0,0,1],
        [1,1,0,1,1],
        [1,1,1,1,1],
        [1,0,1,0,1],
        [1,0,0,0,1]],
     N:[
        [1,0,0,1],
        [1,1,0,1],
        [1,1,1,1],
        [1,0,1,1],
        [1,0,0,1]],
     O:[
        [1,1,1],
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [1,1,1]],
     P:[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [1,0,0],
        [1,0,0]],
     Q:[
        [1,1,1,1,0],
        [1,0,0,1,0],
        [1,0,0,1,0],
        [1,0,1,1,0],
        [1,1,1,0,1]],
     R:[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [1,1,0],
        [1,0,1]],
     S:[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [0,0,1],
        [1,1,1]],
     T:[
        [1,1,1],
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [0,1,0]],
     U:[
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [1,1,1]],
     V:[
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [0,1,0]],
     W:[
        [1,0,0,0,1],
        [1,0,1,0,1],
        [1,1,1,1,1],
        [1,1,0,1,1],
        [1,0,0,0,1]],
     X:[
        [1,0,1],
        [1,0,1],
        [0,1,0],
        [1,0,1],
        [1,0,1]],
     Y:[
        [1,0,1],
        [1,0,1],
        [0,1,0],
        [0,1,0],
        [0,1,0]],
     Z:[
        [1,1,1],
        [0,0,1],
        [0,1,0],
        [1,0,0],
        [1,1,1]],
    key: function(n) {
        return this[Object.keys(this)[n]];
    },
    lookup: function(letter){
        var charCode = letter.charCodeAt(0);
        //check if is within range of suppourted characters
        if (charCode >= 32 && charCode <= 90)
            return charPixels.key(charCode - 32);
        return this.SPACE;
    }
}
function printString(string, speed = 1, callback){
    var words = string.split(" "),
        i = 0,
        startPos = 0,
        endPos;
    
    //print a word every 1.3s / speed
    var wordsInterval = setInterval(function(){
        //print a word. endPos is set to the cursors resting place.
        endPos = printWord(words[i], startPos);  
        //if the word was too long for the screen, 
        // move the starting point left 10 columns for the next run,
        // and DOES NOT advance the variable as to print the next part of the same word again,
        // and will continue until the cursor rests within the screen (+1 col).
        if (endPos > $cols.length + 1){
            startPos -= 10;
        }else{
            //if the word fit fine, move to the next word,
            // and if there are more words reset the variables
            i++;
            if(i < words.length){
                startPos = 0;
                endPos = findWidth(words[i]);
            }
        }
        //if there are no more words, clean up and call the callback. 
        if (i >= words.length){
            clearInterval(wordsInterval);
            setTimeout(function(){
                clearScreen();
                if(callback)
                    callback();
            }, 1300 / speed);
            return;
        }
    }, 1300 / speed);
}
function printWord(word, posX){
    randomizeTransitions();
    clearScreen();
    word = word.toUpperCase();
    
    //if no position defined, center text
    if (!posX){
        //if word is wider than screen, dont center
        if(findWidth(word) > $cols.length){
            posX = 0;
        }else{
            posX = Math.floor(($cols.length - findWidth(word)) / 2);
        }
    }
    
    var letters = word.split("");
    for (var i = 0; i < letters.length; i++){
        posX = printLetter(letters[i],posX);
        posX ++;
    }
    return posX;
}
/*function scrollWord(word, startPos){
    randomizeTransitions();
    clearScreen();
    word = word.toUpperCase();
    if (!startPos)
        startPos = 0;
    var endPos = $cols.length + 1;
    var letters = word.split("");
    
    var scrollInterval = setInterval(function(){
        if (endPos > $cols.length){
            clearScreen();
            endPos = startPos;
            for (var i = 0; i < letters.length; i++){
                endPos = printLetter(letters[i],endPos);
                endPos ++;
            }
            console.log(startPos);
            startPos -= $cols.length;
        }else{
            clearInterval(scrollInterval);
            return endPos;
        }     
    },1000);
    return endPos;
}*/
function printLetter(letter, posX){
    posX = printArray(charPixels.lookup(letter), posX);
    return posX;
}
function printArray(arr,posX){
    //flips panels based on 1s and 0s in input array
    var col = 0,row = 0;
    for(col = 0; (col < arr[0].length) && col <= ($cols.length - arr[0].length); col++){
        if (posX + col >= 0){
            for (row = 0; row < arr.length; row++){
                if (arr[row][col] == 1){
                    $cols.eq(posX + col).children(".panel").eq(row).addClass("active");
                }else{
                    $cols.eq(posX + col).children(".panel").eq(row).removeClass("active");
                }
            }
        }
    }
    return (posX + col);
}
function clearScreen(){
    $panels.removeClass("active");
}
function findWidth(word){
    var width = 0;
    word = word.toUpperCase();
    var letters = word.split("");
    for (var i = 0; i < letters.length; i++){
        width += (charPixels.lookup(letters[i])[0].length);
        width ++;
    }
    return width;
}
function randomizeTransitions(){
    var rand;
    for (var i = 0; i < $panels.length; i++){
        rand = Math.floor((Math.random() * 9) + 2);
        $panels.eq(i).css("transition","all " + (rand / 10) + "s");
    }
}
function setLayout(layout = "flat"){
    $plane.removeClass("cascade flyin zoomin");
    if (layout == "cascade" || layout == 1){
        $plane.addClass("cascade");
    }else if(layout == "flyin" || layout == 2){
        $plane.addClass("flyin");
    }else if(layout == "zoomin" || layout == 3){
        $plane.addClass("zoomin");
    }
}

//button and input box functionality
$("#input1").keypress(function(event){
    if(event.keyCode == 13 && $("#button1").attr("disabled") != "disabled"){
        $("#button1").click();
    }
});
$("#button1").click(function(){
    if ($("#input1").val() !== ""){
        $("#button1").attr("disabled","disabled").addClass("active");
        var rand = Math.floor((Math.random() * 8) + 0);
        if (rand > 4)
            rand == 0;
        clearScreen();
        setLayout(rand);
        printString($("#input1").val(),1,function(){
            $("#button1").removeAttr("disabled").removeClass("active");
            setLayout("flat");
        });   
    }else{
        clearScreen();
    }
});
//flip on click functionality
$panels.click(function(){
    if ($("#button1").attr("disabled") != "disabled"){
        if ($(this).hasClass("active")){
            $(this).removeClass("active");
        }else{
            $(this).addClass("active");
        }
    }
});

/*
//demo code
$("#input1").hide();
$("#button1").hide();
$("#button1").attr("disabled","disabled");
printString("let it go this too shall pass",1,function(){
    $("#button1").removeAttr("disabled");
    $("#input1").fadeIn(1000);
    $("#button1").fadeIn(1000);
});
*/
