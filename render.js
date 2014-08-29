var system = require('system'),
    fs = require('fs'),
    page = require('webpage').create(),
    url = system.args[1],
    output = system.args[2],
    result;
var lastReceived = new Date().getTime();
var requestCount = 0;
var responseCount = 0;
var requestIds = [];
var startTime = new Date().getTime();

page.settings.loadImages = false;

page.onResourceReceived = function (response) {
  //console.log(response.id)
  if(requestIds.indexOf(response.id) !== -1) {
    lastReceived = new Date().getTime();
    responseCount++;
    requestIds[requestIds.indexOf(response.id)] = null;
  }
};
page.onResourceRequested = function (requestData, request) {
  //console.log(request.id)
  if(requestIds.indexOf(requestData.id) === -1) {
    requestIds.push(requestData.id);
    requestCount++;
  }
  if ((/google-analytics.com/gi).test(requestData['url'])){
      //console.log('Request to GA. Aborting: ' + requestData['url']);
      request.abort();
  }
};
page.onResourceError = function(resourceError) {
  console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
  console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
  clearInterval(checkCompleteInterval);
  phantom.exit();
};
page.onResourceTimeout = function(request) {
    console.log('Response (#' + request.id + '): ' + JSON.stringify(request));
    clearInterval(checkCompleteInterval);
    phantom.exit();
};
page.onError = function(msg, trace) {
  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }

  console.error(msgStack.join('\n'));
  clearInterval(checkCompleteInterval);
  phantom.exit();
};
// Let us check to see if the page is finished rendering
/*page.onLoadFinished = function(status) {
  checkCompleteInterval = setInterval(checkComplete, 200);
};*/

page.open(url, function () {});

var checkComplete = function () {
  // We don't allow it to take longer than 5 seconds but
  // don't return until all requests are finished
  if(new Date().getTime() - lastReceived > 300 && requestCount === responseCount)  {
    clearInterval(checkCompleteInterval);
    console.log(page.content);
    phantom.exit();
  }
}
var checkCompleteInterval = setInterval(checkComplete, 1);