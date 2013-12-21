var execute = require("child_process").exec;
var fs = require("fs");
var sqlite3 = require("sqlite3");

var contains = function (array, element) {
  for (var i = 0, iBound = array.length; i < iBound; i++) {
    var thing = array[i];
    if (thing === element) {
      return true;
    }
  }
  return false;
};

var rep = "../../data/ComboFinder.sqlite"; 
fs.exists(rep, function(exists) {
  if(exists) {
    var db = new sqlite3.Database(rep);
    var statement = "SELECT Cards FROM COMBOS";
    db.all(statement, function(error, result) {
      var allCards = [];
      for (var i = 0, iBound = result.length; i < iBound; i++) {
        var cardString = result[i].Cards;
        var cards = cardString.split('|');
        for (var j = 0, jBound = cards.length; j < jBound; j++) {
          if (!contains(allCards, cards[j])) {
            allCards.push(cards[j]);
          }
        }
      }
      console.log("Will download "+allCards.length+" images.");
      console.log("Staring download...");
      var repeat = function(i) {
        if (i < allCards.length) {        
          getImage(allCards[i], repeat, ++i);  
        }
        else {
          console.log("Download complete! Downloaded"+i+" images.");
        }
      };
      repeat(0);
    });
  }
});
var getImage = function(cardName, callBack, index) {
  var fileName = cardName.replace(/'/g, '').replace(/ /g, '_');
  var command = 'wget -q -P new/ -r -l1 --no-parent --no-directories -A.jpg -e robots=off '+
                '"http://magiccards.info/query?q=!'+encodeURIComponent(cardName)+'" && '+
                'mv new/*.jpg '+fileName+'.jpg && '+
                'convert '+fileName+'.jpg -quality 70 '+fileName+'.jpg';
  execute(command, function (error, stdout, stderr) {
    if (error || stderr) {
      console.log("!!! Could not download: "+ cardName);
      console.log("!!! Aborting!");
    }
    else {
      callBack(index);
    }
  })
};
