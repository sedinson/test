/* global process */
'use strict';

/**
 * Modules
 */
var extend = require('extend')
  , clone = require('clone')
;

/**
 * PRODUCTION CONFIGURATION
 */
var prod = {
	app: {
		keys: {
			secret: 'JFOORKLC.3040KLFDKFJ'
		},

        twitter: {
            consumerKey: 'tLqJ58mpl9GinKTn9UyCenGD2',
            consumerSecret: 'ZnXcfktE2GC9q7Fyn6BLcUZhw9fkMYtSB4gcNkf7V6K9RTQJMX',
            accessToken: '128621534-aPdu0O33CtPcZ2rYjX9UCCmCrBNOoRt3sVIE2Uam',
            accessTokenSecret: 'YEZVGlQAVarpBMe09dFfyZXsrz0ZT1zvj1Fq2X8Mu16sX',
            callBackUrl: 'https://royal-films.com:3000/twitter/callback'
        },

		emails: {
            marketing: 'publicidad@royal-films.com',
			support: 'sistemas@royal-films.com',
			tech: 'sistemas2@royal-films.com'
		},

		email: {
			name: 'Información Royal Films',
			email: 'info@royal-films.com',
            noreply: 'info@royal-films.com',
            password: 'stdout2209'
		},

        services: {
            score: {
                url: 'http://107.183.243.210'
            }
        },

        server: {
            url: 'http://royal-films.com/',
            img_url: 'http://royal-films.com/covers/',
            img_path: '/home/royalfilms/public_html/covers/',
            allow: [
                'https://royal-films.com', 'https://www.royal-films.com',
                'http://royal-films.com', 'http://www.royal-films.com'
            ]
        }
	},

    mongo: {
        uri: "mongodb://localhost:27017/nodeCacheDb",
        options : {
            host : '127.0.0.1',
            port : '27017',
            database : "nodeCacheDb",
            collection : "cacheManager",
            compression : false,
            server : {
                poolSize : 5,
                auto_reconnect: true
            }
        }
    },

    /**
        DB Configuration
    */
    db: {
        client: 'mysql2',
        connection: {
            host     : 'royal-films.com',
            user     : 'royalfil_admin',
            password : 'algarrobo1',
            database : 'royalfil_new_site'
        }
    },

	/**
	 * Sendgrid - email
	 */
	sendgrid: {
		user: 'email@mail.com',
		pass: 'password'
	}
};

/**
 * TEST CONFIGURATION
 */
var test = {
    app: {
        emails: {
            marketing: 'edinsonsalas@gmail.com'
        },
        server: {
            url: 'localhost:8080/',
            img_url: 'localhost:8080/assets/covers/',
            img_path: '/home/edinson/Documents/Projects/royal/site/dist/assets/covers/',
            allow: ['http://localhost:8080', 'http://localhost:8081']
        }
    }
};

/**
 * DEVELOPMENT CONFIGURATION
 */
var dev = {
    db: {
        client: 'mysql2',
        connection: {
            host     : 'localhost',
            user     : 'root',
            password : 'q6td99',
            database : 'royalfil_new_site'
        }
    }
};

/**
 * Configuring mode
 */
var mode = process.env.NODE_ENV || process.argv[2] || 'test';

switch (mode) {
	case 'prod':
		module.exports = prod;
		break;

	case 'test':
		module.exports = extend(true, clone(prod), test);
		break;

	case 'dev':
		module.exports = extend(true, clone(prod), clone(test), dev);
		break;

	default:
		console.error(
			"Error: Configuration parameter required: 'prod', 'test' or 'dev'\n" +
			"Either as first arg to node process,\n" +
			"or set via 'MODE' environment variable."
		);

		process.exit(1);
}

/**
 * Export mode
 */
console.log("Config: %s", mode);
module.exports.mode = mode;
