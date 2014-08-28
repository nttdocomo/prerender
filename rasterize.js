var system = require('system'),
    fs = require('fs'),
    page = require('webpage').create(),
    url = system.args[1],
    output = system.args[2],
    result;
page.open(address, function (status) {
  if (status !== 'success') {
    console.log('Unable to load the address!');
    phantom.exit();
  } else {
    window.setTimeout(function () {
      page.render(output);
      phantom.exit();
    }, 1000); // Change timeout as required to allow sufficient time 
  }
});