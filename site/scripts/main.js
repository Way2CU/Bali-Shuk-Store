/**
 * Main JavaScript
 * Site Name
 *
 * Copyright (c) 2015. by Way2CU, http://way2cu.com
 * Authors:
 */

// create or use existing site scope
var Site = Site || {};

// make sure variable cache exists
Site.variable_cache = Site.variable_cache || {};


/**
 * Check if site is being displayed on mobile.
 * @return boolean
 */
Site.is_mobile = function() {
	var result = false;

	// check for cached value
	if ('mobile_version' in Site.variable_cache) {
		result = Site.variable_cache['mobile_version'];

	} else {
		// detect if site is mobile
		var elements = document.getElementsByName('viewport');

		// check all tags and find `meta`
		for (var i=0, count=elements.length; i<count; i++) {
			var tag = elements[i];

			if (tag.tagName == 'META') {
				result = true;
				break;
			}
		}

		// cache value so next time we are faster
		Site.variable_cache['mobile_version'] = result;
	}

	return result;
};

/**
 * Handle scrolling page.
 *
 * @param object event
 */
Site.handle_scroll = function(event) {
	var page_scroll = $(window).scrollTop();
	var top_position = Site.header_height - 100;

	if (page_scroll > top_position && !Site.cart_container.hasClass('floating')) {
		// force cart to float
		Site.cart_container
				.addClass('floating')
				.css('top', 100);

	} else if (page_scroll <= top_position && Site.cart_container.hasClass('floating')) {
		// stop cart from floating
		Site.cart_container
				.removeClass('floating')
				.css('top', 0);
	}
};

/**
 * Dialog system for user management.
 */
Site.DialogSystem = function() {
	var self = this;

	self.error = {};
	self.sign_up = {};
	self.login = {};
	self.recovery = {};

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		// create error reporting dialog
		self.error.dialog = new Dialog();
		self.error.dialog.setSize(400, 'auto');
		self.error.dialog.setScroll(false);
		self.error.dialog.setClearOnClose(false);
		self.error.dialog.setError(true);
		self.error.dialog.addClass('login error');

		self.error.content = $('<div>');
		self.error.dialog.setContent(self.error.content);

		// get sign up forms
		self.sign_up.forms = $('form.sign-up');
		self.sign_up.forms.submit(self._handleSignupSubmit);

		// create sign up dialog
		self.sign_up.dialog = new Dialog();
		self.sign_up.dialog.setSize(400, 'auto');
		self.sign_up.dialog.setScroll(false);
		self.sign_up.dialog.setClearOnClose(false);
		self.sign_up.dialog.setError(false);
		self.sign_up.dialog.addClass('login sign-up');

		self.sign_up.content = $('<form>');
		self.sign_up.message = $('<p>');

		self.sign_up.label_username = $('<label>');
		self.sign_up.input_username = $('<input>');

		self.sign_up.label_password = $('<label>');
		self.sign_up.input_password = $('<input>');

		// configure elements
		self.sign_up.input_username
				.attr('name', 'username')
				.attr('maxlength', 50)
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleSignUpKeyPress);

		self.sign_up.input_password
				.attr('name', 'password')
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleSignUpKeyPress);

		// pack sign up dialog
		self.sign_up.message.appendTo(self.sign_up.content);

		self.sign_up.label_username
				.append(self.sign_up.input_username)
				.appendTo(self.sign_up.content);

		self.sign_up.label_password
				.append(self.sign_up.input_password)
				.appendTo(self.sign_up.content);

		self.sign_up.dialog.setContent(self.sign_up.content);

		// create sign up button
		self.sign_up.signup_button = $('<a>');
		self.sign_up.signup_button
				.attr('href', 'javascript:void(0);')
				.click(self._handleSignUpClick);
		self.sign_up.dialog.addControl(self.sign_up.signup_button);

		// prepare dialog
		self.login.dialog = new Dialog();
		self.login.dialog.setSize(400, 'auto');
		self.login.dialog.setScroll(false);
		self.login.dialog.setClearOnClose(false);
		self.login.dialog.setError(false);
		self.login.dialog.addClass('login');

		// create login button
		self.login.login_button = $('<a>');
		self.login.login_button
				.attr('href', 'javascript:void(0);')
				.click(self._handleLoginClick);
		self.login.dialog.addControl(self.login.login_button);

		// create login dialog content
		self.login.content = $('<form>');
		self.login.captcha_container = $('<div>');
		self.login.message = $('<p>');

		self.login.label_username = $('<label>');
		self.login.input_username = $('<input>');

		self.login.label_password = $('<label>');
		self.login.input_password = $('<input>');

		self.login.link_recovery = $('<a>');

		self.login.label_captcha = $('<label>');
		self.login.input_captcha = $('<input>');
		self.login.image_captcha = $('<img>');

		// configure elements
		self.login.input_username
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleLoginKeyPress)
				.attr('name', 'email')
				.attr('type', 'email');

		self.login.input_password
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleLoginKeyPress)
				.attr('name', 'password')
				.attr('type', 'password');

		self.login.link_recovery
				.click(self._showRecoveryDialog)
				.attr('href', 'javascript: void(0)');

		self.login.content
				.attr('action', '/')
				.attr('method', 'post');

		// pack elements
		self.login.content.append(self.login.message);
		self.login.label_username
				.append(self.login.input_username)
				.appendTo(self.login.content);

		self.login.label_password
				.append(self.login.input_password)
				.appendTo(self.login.content);

		self.login.label_captcha
				.append(self.login.input_captcha)
				.append(self.login.image_captcha)
				.appendTo(self.login.captcha_container);

		self.login.captcha_container
				.addClass('captcha')
				.hide()
				.appendTo(self.login.content);

		self.login.content.append(self.login.link_recovery);
		self.login.dialog.setContent(self.login.content);

		// prepare recovery dialog
		self.recovery.dialog = new Dialog();
		self.recovery.dialog.setSize(400, 'auto');
		self.recovery.dialog.setScroll(false);
		self.recovery.dialog.setClearOnClose(false);
		self.recovery.dialog.setError(false);
		self.recovery.dialog.addClass('login recovery');

		// create recover button
		self.recovery.recover_button = $('<a>');
		self.recovery.recover_button
				.attr('href', 'javascript: void(0);')
				.click(self._handleRecoverClick);

		self.recovery.dialog.addControl(self.recovery.recover_button);

		// create recovery dialog content
		self.recovery.content = $('<div>');
		self.recovery.captcha_container = $('<div>');
		self.recovery.message = $('<p>');

		self.recovery.label_email = $('<label>');
		self.recovery.input_email = $('<input>');

		self.recovery.label_captcha = $('<label>');
		self.recovery.input_captcha = $('<input>');
		self.recovery.image_captcha = $('<img>');

		self.recovery.input_email
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleRecoveryKeyPress);

		// prepare captcha image
		var base = $('base').attr('href');

		self.recovery.input_captcha
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleRecoveryKeyPress)
				.attr('maxlength', 4);

		self.login.input_captcha
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleLoginKeyPress)
				.attr('maxlength', 4);

		self.recovery.image_captcha
				.click(self._handleCaptchaClick)
				.attr('src', base + '?section=captcha&action=print_image');
		self.login.image_captcha
				.click(self._handleCaptchaClick)
				.attr('src', base + '?section=captcha&action=print_image');

		// pack elements
		self.recovery.content.append(self.recovery.message);
		self.recovery.label_email
				.append(self.recovery.input_email)
				.appendTo(self.recovery.content);

		self.recovery.label_captcha
				.append(self.recovery.input_captcha)
				.append(self.recovery.image_captcha)
				.appendTo(self.recovery.captcha_container);

		self.recovery.captcha_container
				.addClass('captcha')
				.appendTo(self.recovery.content);
		self.recovery.dialog.setContent(self.recovery.content);

		// bulk load language constants
		var constants = [
				'login', 'login_dialog_title', 'login_dialog_message', 'label_email', 'label_password',
				'label_password_recovery', 'recovery_dialog_title', 'recovery_dialog_message', 'submit',
				'label_captcha', 'captcha_message', 'signup_dialog_title', 'sign_up', 'signup_dialog_message'
			];
		language_handler.getTextArrayAsync(null, constants, self._handleStringsLoaded);

		// connect events
		$('a.login').click(self._showLoginDialog);
		$('a.logout').click(self._handleLogout);
		$('a.sign-up').click(self._showSignUpDialog);
		$('form.sign-up input').on('focusin', self._handleFocusIn);

		// store redirect url
		self.sign_up.redirect_url = $('form[data-target-url]').data('target-url');
	}

	/**
	 * Remove invalid class on focus in.
	 *
	 * @param object event
	 */
	self._handleFocusIn = function(event) {
		$(this).removeClass('invalid');
	};

	/**
	 * Handle pressing key on input fields in login dialog.
	 *
	 * @param object event
	 */
	self._handleLoginKeyPress = function(event) {
		var key_value = event.keyCode;

		switch (key_value) {
			case 13:  // enter
				self.login.login_button.trigger('click');
				event.preventDefault();

				break;

			case 27:
				self.login.dialog.hide();
				event.preventDefault();
				break;
		}
	};

	/**
	 * Handle pressing key on input fields in recovery dialog.
	 *
	 * @param object event
	 */
	self._handleRecoveryKeyPress = function(event) {
		var key_value = event.keyCode;

		switch (key_value) {
			case 13:  // enter
				self.recovery.recover_button.trigger('click');
				event.preventDefault();
				break;

			case 27:
				self.recovery.dialog.hide();
				event.preventDefault();
				break;
		}
	};

	/**
	 * Handle pressing key on input fields in login dialog.
	 *
	 * @param object event
	 */
	self._handleSignUpKeyPress = function(event) {
		var key_value = event.keyCode;

		switch (key_value) {
			case 13:  // enter
				self.sign_up.signup_button.trigger('click');
				event.preventDefault();
				break;

			case 27:
				self.sign_up.dialog.hide();
				event.preventDefault();
				break;
		}
	};

	/**
	 * Handle loading language constants from server.
	 *
	 * @param object data
	 */
	self._handleStringsLoaded = function(data) {
		with (self.login) {
			dialog.setTitle(data['login_dialog_title']);
			message.html(data['login_dialog_message']);
			login_button.html(data['login']);

			input_username.attr('placeholder', data['label_email']);
			input_password.attr('placeholder', data['label_password']);
			input_captcha.attr('placeholder', data['label_captcha']);
			link_recovery.html(data['label_password_recovery']);
			image_captcha.attr('title', data['captcha_message']);
		}

		with (self.recovery) {
			dialog.setTitle(data['recovery_dialog_title']);
			message.html(data['recovery_dialog_message']);
			recover_button.html(data['submit']);

			input_email.attr('placeholder', data['label_email']);
			input_captcha.attr('placeholder', data['label_captcha']);
			image_captcha.attr('title', data['captcha_message']);
		}

		with (self.sign_up) {
			dialog.setTitle(data['signup_dialog_title']);
			message.html(data['signup_dialog_message']);
			signup_button.html(data['sign_up']);

			input_username.attr('placeholder', data['label_email']);
			input_password.attr('placeholder', data['label_password']);
		}
	};

	/**
	 * Logout user and navigate to linked page.
	 *
	 * @param object event
	 */
	self._handleLogout = function(event) {
		event.preventDefault();

		var link = $(this);
		var url = link.attr('href');

		// perform logout
		new Communicator('backend')
				.on_success(function(data) {
					if (!data.error)
						window.location = url;
				})
				.get('json_logout');
	};

	/**
	 * Handle clicking on login link.
	 *
	 * @param object event
	 */
	self._showLoginDialog = function(event) {
		// prevent default link behavior
		event.preventDefault();

		// get redirect url
		var link = $(this);
		self.login.redirect_url = link.data('redirect-url');

		// show dialog
		self.login.dialog.show();

		// focus username
		setTimeout(function() {
			self.login.input_username[0].focus();
		}, 100);
	};

	/**
	 * Show password recovery dialog.
	 *
	 * @param object event
	 */
	self._showRecoveryDialog = function(event) {
		// prevent default link behavior
		event.preventDefault();

		self.login.dialog.hide();
		self.recovery.dialog.show();

		// focus username
		setTimeout(function() {
			self.recovery.input_email[0].focus();
		}, 100);
	};

	/**
	 * Show sign up dialog when user clicks on get started link.
	 *
	 * @param object event
	 */
	self._showSignUpDialog = function(event) {
		// prevent default link behavior
		event.preventDefault();

		// show dialog
		self.sign_up.dialog.show();

		// focus username
		setTimeout(function() {
			self.sign_up.input_username[0].focus();
		}, 100);
	};

	/**
	 * Reload captcha image.
	 */
	self._handleCaptchaClick = function(event) {
		event.preventDefault();

		var base = $('base').attr('href');
		var url = base + '?section=captcha&action=print_image&' + Date.now();

		self.recovery.image_captcha.attr('src', url);
		self.login.image_captcha.attr('src', url);
	};

	/**
	 * Handle clicking on sign up button in dialog.
	 *
	 * @param object event
	 */
	self._handleSignUpClick = function(event) {
		// prevent form from submitting
		event.preventDefault();

		// check if all fields are entered properly
		var bail = false;
		if (self.sign_up.input_username.val() == '') {
			self.sign_up.input_username.addClass('invalid');
			bail = true;
		}

		if (self.sign_up.input_password.val() == '') {
			self.sign_up.input_password.addClass('invalid');
			bail = true;
		}

		// exit as some fields are missing
		if (bail)
			return;

		// collect data
		var data = {
			username: self.sign_up.input_username.val(),
			password: self.sign_up.input_password.val()
		};

		// sign up user
		self._performSignUp(data);
	};

	/**
	 * Handle submission of sign up forms.
	 *
	 * @param object event
	 */
	self._handleSignupSubmit = function(event) {
		// prevent form from submitting
		event.preventDefault();

		// cache objects
		var form = $(this);
		var fields = form.find('input');

		// collect data
		var data = {};
		fields.each(function(index) {
			var field = $(this);
			var name = field.attr('name');
			data[name] = field.val();

			if (data[name] == '')
				field.addClass('invalid');
		});

		// submit data
		if (field.filter('.invalid').length == 0)
			self._performSignUp(data);
	};

	/**
	 * Perform sign up process with specified data.
	 *
	 * @param object data
	 */
	self._performSignUp = function(data) {
		// fill in remaining data
		data.agreed = 1;
		data.fullname = '';
		data.email = data.username;
		data.show_result = 1;

		// create new user and redirect
		new Communicator('backend')
				.on_success(self._handleSignupSuccess)
				.on_error(self._handleSignupError)
				.send('save_unpriviledged_user', data);
	};

	/**
	 * Handle successful submission of sign up data.
	 *
	 * @param object data
	 */
	self._handleSignupSuccess = function(data) {
		if (!data.error) {
			// successfully created new user account, redirect
			window.location = self.sign_up.redirect_url;

		} else {
			// there was a problem creating new user
			self.error.dialog.setTitle(language_handler.getText(null, 'signup_dialog_title'));
			self.error.content.html(data.message);
			self.error.dialog.show();
		}
	};

	/**
	 * Handle communication error during sign up process.
	 *
	 * @param object xhr
	 * @param string status_code
	 * @param string description
	 */
	self._handleSignupError = function(xhr, status_code, description) {
		self.error.dialog.setTitle(language_handler.getText(null, 'signup_dialog_title'));
		self.error.content.html(description);
		self.error.dialog.show();
	};

	/**
	 * Handle clicking on login button in dialog.
	 *
	 * @param object event
	 */
	self._handleLoginClick = function(event) {
		// prevent default control behavior
		event.preventDefault();

		// prepare data
		var data = {
				username: self.login.input_username.val(),
				password: self.login.input_password.val()
			};

		// create communicator
		new Communicator('backend')
				.on_success(self._handleLoginSuccess)
				.on_error(self._handleLoginError)
				.get('json_login', data);
	};

	/**
	 * Handle successful login response.
	 *
	 * @param object data
	 */
	self._handleLoginSuccess = function(data) {
		if (data.logged_in) {
			// redirect on successful login
			window.location = self.login.redirect_url;

		} else {
			// hide login dialog
			self.login.dialog.hide();

			// show error message
			self.error.dialog.setTitle(language_handler.getText(null, 'login_dialog_title'));
			self.error.content.html(data.message);
			self.error.dialog.show();

			// show captcha if required
			if (data.show_captcha)
				self.login.captcha_container.slideDown(); else
				self.login.captcha_container.slideUp();
		}
	};

	/**
	 * Handle communication error.
	 *
	 * @param object xhr
	 * @param string transfer_status
	 * @param string description
	 */
	self._handleLoginError = function(xhr, transfer_status, description) {
		// hide login dialog
		self.login.dialog.hide();

		// show error dialog
		self.error.dialog.setTitle(language_handler.getText(null, 'login_dialog_title'));
		self.error.content.html(description);
		self.error.dialog.show();
	};

	/**
	 * Handle clicking on recover button in dialog.
	 *
	 * @param object event
	 */
	self._handleRecoverClick = function(event) {
		// prevent default control behavior
		event.preventDefault();
	};

	// finalize object
	self._init();
}

/**
 * Shopping cart display adapter for items. Besides from displaying items
 * in the shopping cart, this adapter will find matching items on the page
 * and update units and amount according to values stored in shopping cart.
 *
 * @param object item
 */
Site.ItemView = function(item) {
	var self = this;

	self.item = item;
	self.cart = item.cart;
	self.label = null;
	self.container = null;
	self.label_count = null;
	self.label_name = null;
	self.label_price = null;
	self.image = null;

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		var item_list = self.cart.get_list_container();

		// create container
		self.container = $('<li>').appendTo(item_list);
		self.container.addClass('item');

		// create labels
		self.label_count = $('<span>').appendTo(self.container);
		self.label_count.addClass('count');

		self.image = $('<img>').appendTo(self.container);

		self.label_name = $('<span>').appendTo(self.container);
		self.label_name.addClass('name');

		self.label_price = $('<span>').appendTo(self.container);
		self.label_price.addClass('price');
	};

	/**
	 * Handle item count change.
	 */
	self.handle_change = function() {
		// update in site count label
		if (self.label == null) {
			var cid = self.item.get_cid();
			self.label = $('div.item[data-cid="'+cid+'"] div.controls span');
		}
		self.label.html(self.item.count);

		// set matching label
		var unit_definition = $('div.cart').data('size-definition');
		var price_label = language_handler.getText(null, 'label_per_kilo');

		if (self.item.properties.size_definition == unit_definition)
			price_label = language_handler.getText(null, 'label_per_unit');

		// update shopping cart elements
		self.label_name.text(self.item.name[language_handler.current_language]);
		self.label_count.text(self.item.count);
		self.label_price
				.attr('data-label', price_label)
				.attr('data-currency', language_handler.getText(null, 'currency'))
				.text(self.item.price);
		self.image
				.attr('alt', self.item.name[language_handler.current_language])
				.attr('src', self.item.image);
	};

	/**
	 * Handle change of currency in shopping cart.
	 *
	 * @param string currency
	 * @param float rate
	 */
	self.handle_currency_change = function(currency, rate) {
	};

	/**
	 * Handle item removal.
	 */
	self.handle_remove = function() {
		self.label.html(0);
	};

	// finalize object
	self._init();
}

/**
 * Function called when document and images have been completely loaded.
 */
Site.on_load = function() {
	// create dialog system
	Site.dialog_system = new Site.DialogSystem();

	// preload language constants
	var constants = ['label_per_unit', 'label_per_kilo', 'currency'];
	language_handler.getTextArrayAsync(null, constants, function(){});

	// create shopping cart
	Site.cart = new Caracal.Shop.Cart();
	Site.cart
		.ui.connect_checkout_button($('div.cart button[name=checkout]'))
		.ui.add_total_count_label($('div.cart div.total_count span'))
		.ui.add_item_list($('div.cart ul'))
		.add_item_view(Site.ItemView);

	// connect increase and decrease controls
	$('div.item div.controls a.alter').on('click', function(event) {
		var control = $(this);
		var item = control.closest('div.item');
		var difference = control.hasClass('increase') ? 1 : -1;

		Site.cart.alter_item_count_by_cid(item.data('cid'), difference);
	});

	// cache variables
	Site.header_height = $('header').height();
	Site.cart_container = $('div.cart');

	// handle page scrolling to update cart position
	$(window).on('scroll', Site.handle_scroll);
};


// connect document `load` event with handler function
$(Site.on_load);
