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
                ciphers: "EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA RC4 !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS !RC4",
                honorCipherOrder: true,
				name: pkg.name,
				version: pkg.version,
				formatters: {
					'application/json': function (req, res, body) {
						if (body instanceof Error) {
							res.statusCode = body.statusCode || 500;

							body = {
								success: false,
								data: {
									message: body.body? body.body.message : body.message
								}
							};
						} else if (Buffer.isBuffer(body)) {
							body = body.toString('base64');
						} else {
							body = {
								success: true,
								data: body.data? body.data : {}
							};
						}

						var data = JSON.stringify(body);
						res.setHeader('Content-Length', Buffer.byteLength(data));

						return data;
					}
				}
			});

			cb(null, app);
		},

		//-- App use modules
		function (app, cb) {
			//app.use(restify.CORS());
			app.use(restify.fullResponse());
			app.use(restify.acceptParser(app.acceptable));
			app.use(restify.queryParser());
            app.use(restify.gzipResponse());
			app.use(
				restify.bodyParser({
					mapParams: false,
					keepExtensions: true,
					rejectUnknown: true,
					uploadDir: config.uploadDir
				})
			);
            app.use(
                restify.throttle({
                    rate: 25,
                    burst: 50,
                    ip: true
                })
            );
            app.use(
                function crossOrigin(req, res, next) {
                    if(config.app.server.allow.indexOf(req.headers.origin) >= 0) {
                        res.header('Access-Control-Allow-Origin', req.headers.origin);
                    } else {
                        res.header('Access-Control-Allow-Origin', config.app.server.allow[0]);
                    }

                    return next();
                }
            );

			cb(null, app);
		},

		//-- Method Not Allowed
		function (app, cb) {
			app.on('MethodNotAllowed', function(req, res) {
				if (req.method.toLowerCase() === 'options') {
					var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Authorization'];

					if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

					res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
					res.header('Access-Control-Allow-Methods', res.methods.join(', '));

                    if(config.app.server.allow.indexOf(req.headers.origin) >= 0) {
                        res.header('Access-Control-Allow-Origin', req.headers.origin);
                    } else {
                        res.header('Access-Control-Allow-Origin', config.app.server.allow[0]);
                    }

					return res.send(204);
				} else {
					return res.send(new restify.MethodNotAllowedError());
				}
			});

			cb(null, app);
		},

		//-- Start server
		function (app, cb) {
			console.log("Starting secure server...");
			app.listen(3001, function (err) {
				cb(err, app);
			});
		},

		function (app, cb) {
			app.get('/', function (req, res) { res.send(200, {x: "online"}); });
			cb(null, app);
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
