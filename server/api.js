module.exports.combos = function(data, callback) {
  var fs = require("fs");
  var sqlite3 = require("sqlite3");
  var rep = "data/ComboFinder.sqlite"; 
  var result;
  fs.exists(rep, function(exists) {
    if(exists) {
      var db = new sqlite3.Database(rep);
      var combos = "SELECT * FROM (SELECT * FROM Combos ";
      
      var parameters = [];
      var whereClause = ' WHERE ';      
      var colors = ['w', 'u', 'b', 'r', 'g', 'x'];
      var types = ['mana', 'damage', 'destroy', 'life', 'draw', 'turn', 'tutor', 'card'];
      console.log(data.colors && !(data.colors instanceof Array));
      if (data.colors) {
        if (!(data.colors instanceof Array)){
          data.colors = [data.colors];
        }
      
        whereClause += data.colors.map(function (x) {
          parameters.push('%'+x+'%');
          console.log('!');
          return "Colors LIKE ? AND ";
        }).join('');
        
        if (data.allowOtherColors === "false") {
          whereClause += colors.map(function(x) {
            return data.colors.indexOf(x) === -1 ? "Colors NOT LIKE '%"+x+"%' AND " : "";
          }).join('');
        }
      }
      /// Add type parameters
      if (data.types) {
        if (!(data.types instanceof Array)) {
          data.types = [data.types];
        }      
        whereClause += data.types.map(function (x) {
          parameters.push('%'+x+'%');
          return "Types LIKE ? AND ";
        }).join('');
        if (data.allowOtherTypes === "false") {
          whereClause += types.map(function(x) {
            return data.types.indexOf(x) === -1 ? "Types NOT LIKE '%"+x+"%' AND " : "";
          }).join('');
        }
      }
      
      /// Add card parameters
      if (data.card) {
        whereClause += "Cards LIKE ? ";      
        parameters.push('%'+data.card+'%');
      }
      if (whereClause.slice(-4) === 'AND ') {
        whereClause = whereClause.slice(0, -4);
      }
      
      if (whereClause !== ' WHERE ') {
        combos += whereClause + ' ) ';
        combos += " LEFT OUTER JOIN (SELECT COUNT(*) AS Total FROM Combos"+whereClause+" )";
      
        // Add all the parameters again since the where clause is used twice.
        for (var i = 0, iBound = parameters.length; i < iBound; i++) {
          parameters.push(parameters[i]);
        }
      }
      else {
        combos += ')  LEFT OUTER JOIN (SELECT COUNT(*) AS Total FROM Combos)';
      }
      
      console.log("\t-> SQL statement: "+combos);
      db.all(combos, parameters, function(combosError, combosResult) {
        if (!combosError) {
          var combos = [];
          for (var i = 0, iLen = combosResult.length; i < iLen; i++) {
            var combo = {
              id: combosResult[i].Id,
              name: combosResult[i].Name,
              explanation: combosResult[i].Explanation.split('|'),
              cards: combosResult[i].Cards.split('|'),
              colors: combosResult[i].Colors.split('|'),
              types: combosResult[i].Types.split('|'),
              total: combosResult[i].Total
            }; 
            combos.push(combo);
          }  
          callback({
            result: combos,
            error: null
          });
        }
        else {
          callback({
            result: null,
            error: combosError
          }); 
        }
      });
    }
    else {
      callback({
        result: null,
        error:  "No databasefile found! Current directory: "+ process.cwd()
      });
    }
  });
};



module.exports.rawCombos = function(data, callback){
  var fs = require("fs");
  var sqlite3 = require("sqlite3");
  var rep = "data/ComboFinder.sqlite"; 
   fs.exists(rep, function(exists) {
    if(exists) {
      var db = new sqlite3.Database(rep);
      var statement = "SELECT * FROM Combos";
      var params = [data.cards, data.explanation, data.name, data.colors, data.types];
      db.all(statement, params, function(error, result) {
        if (!error) {
          var combos = [];
          for (var i = 0, iLen = result.length; i < iLen; i++) {
            var combo = {
              id: result[i].Id,
              name: result[i].Name,
              explanation: result[i].Explanation,
              cards: result[i].Cards,
              colors: result[i].Colors,
              types: result[i].Types
            }; 
            combos.push(combo);
          }  
          callback({
            result: combos,
            error: null
          });
          callback({
            result: result,
            error: null
          });
        }
        else {
          callback({
            result: null,
            error: error
          }); 
        }
      });
    }
    else {
      callback({
        result: null,
        error:  "No databasefile found! Current directory: "+ process.cwd()
      });
    }
  });
};


module.exports.addCombo = function(data, callback){
  var fs = require("fs");
  var sqlite3 = require("sqlite3");
  var rep = "data/ComboFinder.sqlite"; 
   fs.exists(rep, function(exists) {
    if(exists) {
      var db = new sqlite3.Database(rep);
      var statement = "INSERT INTO Combos (Cards, Explanation, Name, Colors, Types) VALUES (?, ?, ?, ?, ?)";
      var params = [data.cards, data.explanation, data.name, data.colors, data.types];
      db.all(statement, params, function(error, result) {
        if (!error) {
          callback({
            result: result,
            error: null
          });
        }
        else {
          callback({
            result: null,
            error: error
          }); 
        }
      });
    }
    else {
      callback({
        result: null,
        error:  "No databasefile found! Current directory: "+ process.cwd()
      });
    }
  });
};


module.exports.updateCombo = function(data, callback){
  var fs = require("fs");
  var sqlite3 = require("sqlite3");
  var rep = "data/ComboFinder.sqlite"; 
   fs.exists(rep, function(exists) {
    if(exists) {
      var db = new sqlite3.Database(rep);
      var statement = "UPDATE Combos SET Cards = ?, Explanation = ?, Name = ?, Colors = ?, Types = ? WHERE Id = ?";
      var params = [data.cards, data.explanation, data.name, data.colors, data.types, data.id];
      db.all(statement, params, function(error, result) {
        if (!error) {
          callback({
            result: result,
            error: null
          });
        }
        else {
          callback({
            result: null,
            error: error
          }); 
        }
      });
    }
    else {
      callback({
        result: null,
        error:  "No databasefile found! Current directory: "+ process.cwd()
      });
    }
  });
};
