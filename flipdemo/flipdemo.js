$cols = $(".col");
$panels = $(".panel");
var charPixels = {
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
    SPACE:[
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0]],
    key: function(n) {
        return this[Object.keys(this)[n]];
    },
    lookup: function(letter){
        var charCode = letter.charCodeAt(0);
        //check if is within capital letter range
        if (charCode >= 65 && charCode <= 90)
            return charPixels.key(charCode - 65);
        return this.SPACE;
    }
}
function printString(string, speed = 1, callback){
    var words = string.split(" "),
        posX = 0,
        i = 0;
    var wordsInterval = setInterval(function(){
        //print one word every second / speed
        printWord(words[i]);
        i++;
        if (i >= words.length){
            clearInterval(wordsInterval);
            setTimeout(function(){
                clearScreen();
                if(callback)
                    callback();
            }, 1000 / speed);
            return;
        }
    }, 1000 / speed);
}
function printWord(word, posX){
    randomizeTransitions();
    clearScreen();
    word = word.toUpperCase();
    //if no position defined, center text
    if (!posX){
        posX = Math.floor(($cols.length - findWidth(word)) / 2);   
    }
    var letters = word.split("");
    for (var i = 0; i < letters.length; i++){
        posX = printLetter(letters[i],posX);
        posX ++;
    }
    return posX;
}
function printLetter(letter, posX){
    posX = printArray(charPixels.lookup(letter), posX);
    return posX;
}
function printArray(arr,posX){
    //flips panels based on 1s and 0s in input array
    var col = 0,row = 0;
    for(col = 0; (col < arr[0].length) && col <= ($cols.length - arr[0].length); col++){
        for (row = 0; row < arr.length; row++){
            if (arr[row][col] == 1){
                $cols.eq(posX + col).children(".panel").eq(row).addClass("active");
            }else{
                $cols.eq(posX + col).children(".panel").eq(row).removeClass("active");
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
        rand = Math.floor((Math.random() * 7) + 3);
        $panels.eq(i).css("transition","all " + ((1 / rand) * 5) + "s");
        console.log(((1 / rand) * 5));
    }
}

//button and input box code
$("#input1").keypress(function(event){
    if(event.keyCode == 13 && $("#button1").attr("disabled") != "disabled"){
        $("#button1").click();
    }
});
$("#button1").click(function(){
    $("#button1").attr("disabled","disabled").addClass("active");
    printString($("#input1").val(),1,function(){
        $("#button1").removeAttr("disabled").removeClass("active");
    });
});

//demo code
$("#button1").attr("disabled","disabled");
printString("let it go this too shall pass",1,function(){
    $("#button1").removeAttr("disabled");
});

