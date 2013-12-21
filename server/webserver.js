var http = require('http');
var path = require('path');
var fileSystem = require('fs');
var port = 8998;

// Display usage error message
var usageError = function () {
  console.log('Error!');
  console.log('Usage: webserver <port>');
  console.log('The parameter <port> is optional, default value 8998.');
  process.exit(99);
};

// Parse user input and set port    
if (process.argv.length === 3) {
  var input = parseInt(process.argv[2]);
  if (typeof (input) == 'number') {
    port = input;
  } else {
    usageError();
  }
} else if (process.argv.length !== 2) {
  usageError();
}

// Create webserver    
var server = http.createServer(function (request, response) {
  console.log('    (x) Incoming request...');
  // Get current directory
  currentPath = process.cwd();
  var url = request.url;
  params = {};
  // Get requested file
  var fileName = '';
  var urlComponents = url.split('?');
  if (urlComponents.length > 0) {
    fileName = urlComponents[0];
    //TODO move extraction of "GET"-params to execution.
    if (request.method === 'GET')
    {
      if (urlComponents.length === 2) {
        var rawParams = decodeURIComponent(urlComponents[1]).split('&');
        for (var i = 0, len = rawParams.length; i < len; i++) {
          var rawParam = rawParams[i].split('=');
          var array = rawParam[1].split('|');
          params[rawParam[0]] = array.length === 1? array[0].replace(/\+/g, " ") : array.map(function(x) {return x.replace(/\+/g, " ");});
        }
      }
    }
  } else {
    fileName = url;
  }
  var filePath = currentPath + fileName;
  if (filePath === currentPath + '/' || filePath === currentPath) {
    filePath = currentPath + '/index.html';
  }
  var extension = path.extname(filePath);
  var contentType = 'text/html';
  switch (extension) {
    case '.css':
      contentType = 'text/css';
      break;
    case '.jpg':
      contentType = 'image/jpeg';
      response.setHeader("Cache-Control", "public, max-age=604800");
      break;
    case '.jpeg':
      contentType = 'image/jpeg';
      response.setHeader("Cache-Control", "public, max-age=604800");
      break;
    case '.png':
      contentType = 'image/png';
      response.setHeader("Cache-Control", "public, max-age=604800");
      break;
    case '.gif':
      contentType = 'image/gif';
      response.setHeader("Cache-Control", "public, max-age=604800");
      break;
    case '.pdf':
      contentType = 'application/pdf';
      break;
    case '.xml':
      contentType = 'application/xml';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.js':
      contentType = 'application/javascript';
      break;
  }
  if (filePath.indexOf('/api/') > -1) {
      var commandName = filePath.split('/api/')[1];    
      var command = require('./api')[commandName];
      var callCommand = function(){
        console.log("        API method ["+commandName+"] called with: "+JSON.stringify(params));
        command(params, function(result) {
          if (!result.error) {
            response.writeHead(200, {
              'Content-Type': 'application/json'
            });
            response.end(JSON.stringify(result.result), 'utf-8');
          }
          else {
            response.writeHead(500,  {
              'Content-Type': 'application/json'
            });
            response.end(JSON.stringify(result.error), 'utf-8');
          }
        });
      };
      if (request.method === 'POST') {
      var postData = "";
      request.on('data', function(data) {
        postData += data;
        if (postData.length > 1e6) {
          postData = "";
          response.writeHead(413,  {
            'Content-Type': 'text/html'
          });
          request.connection.destroy();
        }
      });
      request.on('end', function() {
        params = JSON.parse(postData);
        callCommand();
      });
    }
    else {
      callCommand();
    }
  }
  else {  
    console.log('        Requested file: ' + filePath);
    fileSystem.exists(filePath, function (exists) {
      if (exists) {
        fileSystem.readFile(filePath, function (error, content) {
          if (error) {
            response.writeHead(500,  {
              'Content-Type': 'text/html'
            });
            response.end();
          } 
          else {
            response.writeHead(200, {
              'Content-Type': contentType
            });
            response.end(content, 'utf-8');
          }
        });
      } 
      else {
        response.writeHead(404,  {
          'Content-Type': 'text/html'
        });
        response.end();
      }
    });
  }
  //console.log('    (x) Request served with status: ' + response.statusCode + '\n');
}).listen(port);


console.log('[*] Webserver online, hit CTRL+C to quit.');
console.log('[*] Contents of "' + process.cwd() + '" accesible.');
console.log('[*] Listening on http://127.0.0.1:' + port);
