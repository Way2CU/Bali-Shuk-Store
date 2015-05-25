/**
 * Previous Purchases JavaScript
 * Vegetable Shop
 *
 * Copyright (c) 2015. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

// create or use existing site scope
var Site = Site || {};


Site.PreviousPurchases = function(transaction_container) {
	var self = this;

	self.container = null;
	self.items_container = null;
	self.link_toggle_items = null;
	self.link_add_items = null;
	self.items = null;
	self.handlers = {};

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		// get objects
		self.container = transaction_container;
		self.items_container = self.container.find('div.items');
		self.link_toggle_items = self.container.find('div.controls a.show_items');
		self.link_add_items = self.container.find('div.controls a.add_items');

		// connect events
		self.link_toggle_items.on('click', self.handlers.toggle_items_click);
		self.link_add_items.on('click', self.handlers.add_items_click);
	};

	/**
	 * Handle clicking on toggle items button.
	 *
	 * @param object event
	 */
	self.handlers.toggle_items_click = function(event) {
		event.preventDefault();

		self.link_toggle_items.toggleClass('active');
		self.items_container.toggleClass('visible');
	};

	/**
	 * Handle clicking on add items button.
	 *
	 * @param object event
	 */
	self.handlers.add_items_click = function(event) {
		event.preventDefault();
	};

	// finalize object
	self._init();
}


$(function() {
	// create container for previous purchase objects
	Site.previous_purchases = [];

	// create previous purchase handlers
	$('div#transactions div.transaction').each(function() {
		var purchase = new Site.PreviousPurchases($(this));
		Site.previous_purchases.push(purchase);
	});
});
