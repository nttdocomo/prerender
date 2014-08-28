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
var checkCompleteInterval;

page.settings.loadImages = false;

page.onResourceReceived = function (response) {
  //console.log(response.id)
  if(requestIds.indexOf(response.id) !== -1) {
    lastReceived = new Date().getTime();
    responseCount++;
    requestIds[requestIds.indexOf(response.id)] = null;
  }
};
page.onResourceRequested = function (request) {
  //console.log(request.id)
  if(requestIds.indexOf(request.id) === -1) {
    requestIds.push(request.id);
    requestCount++;
  }
  if ((/google-analytics.com/gi).test(requestData['url'])){
      console.log('Request to GA. Aborting: ' + requestData['url']);
      request.abort();
  }
};
page.onResourceError = function(resourceError) {
  clearInterval(checkCompleteInterval);
};
page.onResourceTimeout = function(request) {
    clearInterval(checkCompleteInterval);
};
page.onError = function(msg, trace) {
  clearInterval(checkCompleteInterval);
};
// Let us check to see if the page is finished rendering
page.onLoadFinished = function(status) {
  console.log('Status: ' + status);
  checkCompleteInterval = setInterval(checkComplete, 200);
  // Do other things here...
};

page.open(url, function () {});

var checkComplete = function () {
  // We don't allow it to take longer than 5 seconds but
  // don't return until all requests are finished
  if(new Date().getTime() - lastReceived > 300 && requestCount === responseCount)  {
    clearInterval(checkCompleteInterval);
    phantom.exit();
  }
}