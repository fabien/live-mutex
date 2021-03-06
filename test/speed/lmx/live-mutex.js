'use strict';

const async = require('async');
const {lmUtils} = require('live-mutex');
const {Client} = require('live-mutex');
const conf = Object.freeze({port: 7003});

const path = require('path');
// const conf = Object.freeze({udsPath: path.resolve(process.env.HOME + '/simple.unix.sock')});
const util = require('util');

process.on('unhandledRejection', function (e) {
  console.error('unhandledRejection => ', e.stack || e);
});

///////////////////////////////////////////////////////////////////

lmUtils.launchBrokerInChildProcess(conf, function () {

  const client = new Client(conf);

  client.ensure().then(function () {

    const a = Array.apply(null, {length: 10000});
    const start = Date.now();

    let counts = {
      z: 0
    };

    async.eachLimit(a, 8, function (val, cb) {

      client.lock('foo', function (err, unlock) {

        if (err) {
          return cb(err);
        }

        setTimeout(function(){
          unlock(cb);
        }, Math.ceil(Math.random()*10));


      });

    }, function complete(err) {

      if (err) {
        throw err;
      }

      const diff = Date.now() - start;
      console.log(' => Time required for live-mutex => ', diff);
      console.log(' => Lock/unlock cycles per millisecond => ', Number(a.length / diff).toFixed(3));
      process.exit(0);
    });

  });

});




