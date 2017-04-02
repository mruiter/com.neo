'use strict';

const raven = require('raven');

class Log {

	constructor() {

		if( typeof Homey.env.HOMEY_LOG_URL === 'string' ) {
			this.init( Homey.env.HOMEY_LOG_URL );
		}

	}

	_log() {
		console.log.bind( null, '[homey-log]' ).apply( null, arguments );
	}

	init( url, opts ) {

		if( process.env.DEBUG === '1' )
			return this._log('App is running in debug mode, disabling log');

		this._client = new raven.Client( url, opts );

		this._client.patchGlobal();

		this.setTags({
			appId			: Homey.manifest.id,
			appVersion		: Homey.manifest.version,
			homeyVersion	: Homey.version
		});

		this._log(`App ${Homey.manifest.id} v${Homey.manifest.version} logging...`);

		return this;

	}

	setTags( tags ) {
		if( this._client ) {
			this._client.setTagsContext(tags);
		}

		return this;
	}

	setExtra( extra ) {
		if( this._client ) {
			this._client.setExtraContext(extra);
		}

		return this;
	}

	setUser( user ) {
		if( this._client ) {
			this._client.setUserContext(user);
		}

		return this;
	}

	captureMessage( message, options, callback) {
		this._log('captureMessage:', message);

		if( this._client ) {
			this._client.captureMessage(
				message,
				options && options.constructor.name === 'Object' ? Object.assign({}, options) : options,
				callback
			);
		}

		return this;
	}

	captureException( err, options, callback) {
		this._log('captureException:', err);

		if( this._client ) {
			this._client.captureException(
				err,
				options && options.constructor.name === 'Object' ? Object.assign({}, options) : options,
				callback
			);
		}

		return this;
	}

}

module.exports = new Log();
