/* global process */
/* global __dirname */
/* global Buffer */

'use strict';

/**
 * Modules
 */
 var util = require('util')
   , events = require('events')
   , constants = require('constants')
   , async = require('async')
   , restify = require('restify')
   , pkg = require(__dirname + '/package.json')
   , fs = require('fs')
 ;

 /**
  * Config
  */
var config = require('./config');

console.log(
	"***************************************************\n" +
	"**                 ROYAL SERVICES                **\n" +
	"***************************************************\n\n"
);

/**
 * Creating the emitter
 */
var Emitter = function () {
	this.emit_data = function (event, data) {
		this.emit(event, data);
	};
};

util.inherits(Emitter, events.EventEmitter);

var app_emitter = new Emitter();
module.exports = app_emitter;

/**
 * Generating the server
 */
async.waterfall(
	[
		//-- Create Restify Server
		function (cb) {
			console.log("Initializing server...");

			var app = restify.createServer({
                certificate: fs.readFileSync(__dirname + '/ssl/certs/royal-films.crt'),
                key: fs.readFileSync(__dirname + '/ssl/private/royal-films.key'),
ciphers: 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256',
  honorCipherOrder: true,
				name: pkg.name,
				version: pkg.version
			});

			cb(null, app);
		},

		function (app, cb) {
			app.get('/', function (req, res, next) {
				console.log("Hola mundo!");
				res.send({x: "online"}); 
				return next();
			});
			cb(null, app);
		},

		//-- Start server
		function (app, cb) {
			console.log("Starting secure server...");
			app.listen(3001, function (err) {
				cb(err, app);
			});
		}
	], function (err, app) {
		if (err) {
			console.error(err);
			app_emitter.emit_data('error', err);
		} else {
			console.log("Server listening on port %s", 3001);
			app_emitter.instance = app;
			app_emitter.emit_data('started', app);
		}
	}
);
