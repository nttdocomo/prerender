var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
console.log(numCPUs);
function createWorker() {
  if (cluster.isMaster) {
    //Fork a worker to run the main program
    var worker = cluster.fork();
    worker.on('exit', function (code, signal) {
      createWorker();
    });
  } else {
    //Run main program
    require('./server.js');
    console.log('worker is running');
  }
}
createWorker()

function killAllWorkers(signal) {
  var uniqueID,
      worker;

  for (uniqueID in cluster.workers) {
    if (cluster.workers.hasOwnProperty(uniqueID)) {
      worker = cluster.workers[uniqueID];
      worker.removeAllListeners();
      worker.process.kill(signal);
    }
  }
}

/*process.on('SIGINT', function() {
  killAllWorkers('SIGTERM')
  console.log('Got SIGINT.  Press Control-D to exit.');
});*/
/**
 * Restarts the workers.
 */
process.on('SIGHUP', function () {
  killAllWorkers('SIGTERM');
  createWorkers(numCPUs * 2);
});

/**
 * Gracefully Shuts down the workers.
 */
process.on('SIGTERM', function () {
  killAllWorkers('SIGTERM');
});