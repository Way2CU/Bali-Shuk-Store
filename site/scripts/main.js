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
 * Global page count item view adapter
 */
Site.ItemCountView = function(item) {
	var self = this;

	self.item = item;
	self.label = null;

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
	};

	/**
	 * Handle item count change.
	 */
	self.handle_change = function() {
		if (self.label == null) {
			var cid = self.item.get_cid();
			self.label = $('div.item[data-cid="'+cid+'"] div.controls span');
		}
		self.label.html(self.item.count);
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
	// create shopping cart
	Site.cart = new Caracal.Shop.Cart();
	Site.cart
		.ui.connect_checkout_button($('div.cart button[name=checkout]'))
		.ui.add_total_cost_label($('div.cart div.total_cost span'))
		.ui.add_total_count_label($('div.cart div.total_count span'))
		.ui.add_item_list($('div.cart ul'))
		.add_item_view(Site.ItemCountView)
		.add_item_view(Caracal.Shop.ItemView);

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
