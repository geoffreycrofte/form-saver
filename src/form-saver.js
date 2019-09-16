/**!
 * Form Saver library
 *
 * @author: Geoffrey Crofte (https://geoffrey.crofte.fr)
 * @creationDate: 2017-10-07
 * @lastUpdate: 2019-09-16
 */

var FormSaver = function( form, args ) {
	args = args || {};

	this.form         = document.getElementById( form ) || document.querySelector( '[name="' + form + '"]' );
	this.storType     = args.storageType || 'local'; // Session
	this.storDuration = args.storageDuration || 30; // in minutes (not used yet)
	this.storID       = args.storageID || form;
	this.fields       = 'input, select, textarea';
};

/**
 * Prototype model of FCS object.
 */
FormSaver.prototype = function() {
	var s = {};

	/**
	 * Init all the functional work to save field datas.
	 *
	 * @return {object} [FormSaver object]
	 */
	const init = function() {
		
		if ( ! window.localStorage && ! window.sessionStorage ) {
			console.warn( 'Your browser does not support Web Storage API' );
			return false;
		}
		if ( ! this.form ) {
			console.warn( 'Please chose a form to save with FormSaver( formID, args )' );
			return false;	
		}

		// Define witch type of storage we will use to store datas.
		s.storType = this.storType === 'local' ? window.localStorage : window.sessionStorage;
		console.info('FormSaver Initiated');

		var fields  = this.form.querySelectorAll( this.fields ),
			storID  = this.storID,
			i       = 0,
			len     = fields.length

		for ( i, len; i < len; i++ ) {

			if ( is_forbidden( fields[i] ) ) {
				console.info( 'Forbidden Field:', fields[i] );
				continue;
			}

			setField( storID, fields[i] );

			if ( is_select( fields[i] ) || is_radio( fields[i] ) || is_check( fields[i] ) ) {
				fields[i].addEventListener( 'change', saveField, false );
				fields[i].formID = storID;
				fields[i].field  = fields[i];
			}
			// input text, url, tel, etc. + textarea
			else {
				fields[i].addEventListener( 'blur', saveField, false );
				fields[i].formID = storID;
				fields[i].field  = fields[i];
			}

		}

		// Init automatic saving
		return this;
	};

	/**
	 * Save the value of a given field.
	 *
	 * @param  {object} field The given field.
	 * @return {object}       The Given field.
	 */
	const saveField = function( e ) {
		var formID = e.target.formID,
			field  = e.target.field;

		if ( is_radio( field ) ) {
			s.storType.setItem( formID + '-' + field.name, field.id );
			console.info( 'Saved:' + formID + field.name + '=>' + field.id );
		} else if ( is_check( field ) ) {
			var these = document.querySelectorAll( '[name="' + field.name + '"]' ),
				thesea = [],
				k = 0;

			for ( le = these.length; k < le; k++ ) {
				if ( ! these[k].checked ) {
					continue;
				}
				thesea.push( these[k].id );
			}
			s.storType.setItem( formID + '-' + field.name, thesea );
			console.info( 'Saved:' + formID + '-' + field.name + '=>' );
			console.info( thesea );
		} else {
			s.storType.setItem( formID + '-' + getFieldKey( field ), field.value );
			console.info( 'Saved:' + formID + '-' + getFieldKey( field ) + '=>' + field.value );
		}
		return field;
	};

	/**
	 * Save all the fields of a form. Try not to use it :D
	 * 
	 * @param  {} fields The given field.
	 * @return {}        Something
	 */
	const saveFields = function( fields ) {
		fields = fields || this.form.querySelectorAll( this.fields );

		var len = fields.length,
			i   = 0;

		for ( i, len; i < len; i++ ) {

			if ( is_forbidden( fields[i] ) ) {
				console.info( 'Forbidden Field:', fields[i] );
				continue;
			}

			target = {'target' : { 'formID': this.storID, 'field' : fields[i] } }
			saveField( target );
		}
		console.info( 'Global saving initiated. Be careful of the performances.' );
	};

	/**
	 * Set the value of a given field.
	 *
	 * @param  {object} field The given field.
	 * @return {object}       The Given field.
	 */
	const setField = function( formID, field ) {

		var itemval = getField( formID, field );

		if ( ! itemval ) {
			return false;
		}

		// Controls types.
		if ( is_radio( field ) ) {
			document.getElementById( itemval ).checked = true;
		} else if ( is_check( field ) ) {
			var l = 0,
				checkeds = itemval.split(','),
				le = checkeds.length;

			for ( le, l; l < le; l++ ) {
				document.getElementById( checkeds[l] ).checked = true;
			}
		} else if ( is_select( field ) ) {
			var selOption = field.querySelector( '[value="' + itemval + '"]' );
			if ( selOption ) {
				if ( field.querySelector( '[selected]' ) ) {
					field.querySelector( '[selected]' ).removeAttribute( 'selected' );
				}
				selOption.setAttribute( 'selected', 'selected' );
			}
		} else {
			var element = document.getElementById( field.id ) || document.querySelector('[name="' + field.name + '"]') ;
			element.value = itemval;
		}
		return field;
	};

	/**
	 * Get the value for a field
	 *
	 * @param  {object} field The given field.
	 * @return {string}       The given field value.
	 */
	const getField = function( formID, field ) {
		var the_value = s.storType.getItem( formID + '-' + getFieldKey( field ) );
		//console.info( 'Value for ' + formID + '-' + getFieldKey( field ) + ': ' + the_value );
		return the_value;
	};

	/**
	 * Clear the value for a field
	 *
	 * @param  {object} field The given field.
	 * @return {object}       The Given field.
	 */
	const clearField = function( formID, field ) {
		s.storType.removeItem( formID + '-' + getFieldKey( field ) );
		console.info( 'Removed:' + formID + '-' + getFieldKey( field ) );
		return field;
	};

	/**
	 * Get the field key which is the ID or the name value of the field.
	 *
	 * @param  {object} field The given field.
	 * @return {string}       The field ID.
	 */
	const getFieldKey = function( field ) {
		return ( is_radio( field ) || is_check( field ) ) ? field.name : ( field.id || field.name );
	};

	/**
	 * Is the field a forbidden-for-save field?
	 *
	 * @param  {object}  field The given field.
	 * @return {boolean}       True if field is a forbidden one.
	 */
	const is_forbidden = function( field ) {
		// Don't save passwords.
		if ( field.type === 'password' ) {
			return true;
		}

		// Don't save passwords current/new, or Credit Card CSC format.
		const autoC = field.getAttribute('autocomplete');
		if ( autoC && ( autoC === 'cc-csc' || autoC === 'new-password' || autoC === 'current-password' ) ) {
			return true;
		}

		// Don't save fields manually marked as should-not-be-saved.
		if ( field.dataset.fsSave && field.dataset.fsSave === 'false' ) {
			return true;
		}

		return false;
	}

	/**
	 * Is the fields a radio?
	 *
	 * @param  {object}  field The given field.
	 * @return {boolean}       True if field is a radio.
	 */
	const is_radio = function( field ) {
		return field.type === 'radio';
	}
	
	/**
	 * Is the fields a checkbox?
	 *
	 * @param  {object}  field The given field.
	 * @return {boolean}       True if field is a checkbox.
	 */
	const is_check = function( field ) {
		return field.type === 'checkbox';
	}

	/**
	 * Is the fields a select?
	 *
	 * @param  {object}  field The given field.
	 * @return {boolean}       True if field is a select.
	 */
	const is_select = function( field ) {
		return field.tagName == 'SELECT';
	}

	/**
	 * Remove the eventListener on all the form inputs.
	 *
	 * @return {object} [FormSaver object]
	 */
	const pause = function() {
		var fields = this.form.querySelectorAll( this.fields ),
			i = 0;

		for ( len = fields.length; i < len; i++ ) {

			if ( is_select( fields[i] ) || is_radio( fields[i] ) || is_check( fields[i] ) ) {
				fields[i].removeEventListener( 'change', saveField, false );
			}
			// input text, url, tel, etc. + textarea
			else {
				fields[i].removeEventListener( 'blur', saveField, false );
			}

		}

		console.info('FormSaver Paused');
		// Stop saving field datas.
		return this;
	};

	/**
	 * Remove all the datas saved for the current form.
	 *
	 * @return {object} [FormSaver object]
	 */
	const destroy = function() {
		
		var fields = this.form.querySelectorAll( this.fields );

		for ( len = fields.length; i < len; i++ ) {
			clearField( this.storID, fields[i] );
		}
		
		console.info('FormSaver Destroyed');

		return this;
	};

	/**
	 * Get all the datas saved for the current form.
	 *
	 * @return {array} The list of datas by key.
	 */
	const getDatas = function() {
		console.info('FormSaver Datas:');
		
		var fields = this.form.querySelectorAll( this.fields ),
			datas  = {},
			formID = this.storID,
			i      = 0;

		for ( len = fields.length; i < len; i++ ) {
			datas[ formID + '-' + getFieldKey( fields[i] ) ] = getField( formID, fields[i] );
		}

		return datas;
	};

	return {
		init     : init,
		pause    : pause,
		stop     : pause,
		save     : saveFields,
		destroy  : destroy,
		getDatas : getDatas,
	}
}();

/**
 * Polyfills: Element.Closest
 */
if ( window.Element && !Element.prototype.closest ) {
	Element.prototype.closest = function( s ) {
		var matches = ( this.document || this.ownerDocument ).querySelectorAll( s ),
			el      = this,
			i;
		do {
			i = matches.length;
			while ( --i >= 0 && matches.item( i ) !== el ) {};
		} while ( ( i < 0 ) && ( el = el.parentElement ) ); 

		return el;
	};
}
