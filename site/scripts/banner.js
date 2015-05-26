/**
 * Banner JavaScript
 * Vegetable Shop
 *
 * Copyright (c) 2015. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

// create or use existing site scope
var Site = Site || {};


Site.Banner = function() {
	var self = this;

	self.container = null;
	self.button = null;
	self.image = null;
	self.destination_url = null;
	self.handlers = {};

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		// create elements
		self.container = $('<div>');
		self.button = $('<a>');

		// configure elements
		self.container
				.addClass('banner')
				.appendTo($('body'));

		self.button
				.attr('href', 'javascript: void(0);')
				.appendTo(self.container)
				.on('click', self.handlers.button_click);

		// load banner from the server
		new Communicator('links')
			.on_success(self.handlers.load_success)
			.on_error(self.handlers.load_error)
			.get('json_link', null);
	};

	/**
	 * Handle clicking on banner button.
	 *
	 * @param object event
	 */
	self.handlers.button_click = function(event) {
		event.preventDefault();
		self.container.toggleClass('visible');
	};

	/**
	 * Handle clicking on image.
	 *
	 * @param object event
	 */
	self.handlers.image_click = function(event) {
		event.preventDefault();

		if (self.destination_url != null)
			window.location.href = self.destination_url;
	};

	/**
	 * Handle loading banner data.
	 *
	 * @param object data
	 */
	self.handlers.load_success = function(data) {
		if (!data.error) {
			// create image and load
			self.destination_url = data.item.redirect_url;
			self.image = $('<img>');
			self.image
					.attr('src', data.item.image)
					.attr('alt', data.item.text)
					.appendTo(self.container)
					.on('click', self.handlers.image_click);

		} else {
			// problem loading link, remove banner from the page
			self.container.remove();
		}
	};

	/**
	 * Handler communication error with server.
	 *
	 * @param object xhr
	 * @param string status_code
	 * @param string description
	 */
	self.handlers.load_error = function(xhr, status_code, description) {
		// remove container from the document after communication error
		self.container.remove();
	};

	// finalize object
	self._init();
}


$(function() {
	Site.banner = new Site.Banner();
});
