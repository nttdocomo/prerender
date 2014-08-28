var http = require("http"),
    querystring = require("querystring"),
    path = require("path"),
    fs = require("fs"),
    port = (process.argv[2] || 8888),
    prerender = process.argv[3] || false;

var mimeTypes = {
    "htm": "text/html",
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "js": "text/javascript",
    "css": "text/css"};

var virtualDirectories = {
    //"images": "../images/"
  };

http.createServer(function(request, response) {
  var url = 'http://' + request.headers['x-forwarded-host'] || 'localhost:8080' + '/#' + request.url.replace(/^\//,''),
  content = '',
  phantom = require('child_process').spawn('phantomjs', ['render.js', url]);
  phantom.stdout.setEncoding('utf8');
  phantom.stdout.on('data', function (data) {
    content += data.toString();
  });
  phantom.stderr.on('data', function (data) {
  });

  phantom.on('exit', function (code) {
    response.write(content, "utf8");
    response.end();
  });
}).listen(parseInt(port, 10));

console.log("Running on http://localhost:" + port + " with pre-render " + (prerender ? 'enabled' : 'disabled') + " \nCTRL + C to shutdown");