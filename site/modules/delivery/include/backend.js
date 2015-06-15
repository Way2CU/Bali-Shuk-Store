/**
 * Backend JavaScript
 * Delivery Options
 *
 * Copyright (c) 2015. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var Caracal = Caracal || {};
Caracal.Shop = Caracal.Shop || {};
Caracal.Shop.ManualDelivery = Caracal.Shop.ManualDelivery || {};


/**
 * Handle adding interval to list.
 *
 * @param object button
 */
Caracal.Shop.ManualDelivery.add_time = function(button) {
	var delivery_window = $(button).closest('div.window');
	var time_list = delivery_window.find('div.scrollable_list div.list_content');
	var input_start = delivery_window.find('input.start');
	var input_end = delivery_window.find('input.end');
	var input_price = delivery_window.find('input.price');

	// make sure all the values are entered
	if (input_start.val() == '' || input_end.val() == '' || input_price.val() == '')
		return;

	// create elements
	var container = $('<div>');
	var column_start = $('<span>');
	var column_end = $('<span>');
	var column_price = $('<span>');
	var column_options = $('<span>');
	var option_delete = $('<a>');
	var value_start = $('<input>');
	var value_end = $('<input>');
	var value_price = $('<input>');

	// configure and pack elements
	column_start
		.addClass('column')
		.css('width', 70)
		.appendTo(container);

	column_end
		.addClass('column')
		.css('width', 70)
		.appendTo(container);

	column_price
		.addClass('column')
		.css('width', 70)
		.appendTo(container);

	column_options
		.addClass('column')
		.appendTo(container);

	option_delete
		.html(language_handler.getText(null, 'delete'))
		.click(Caracal.Shop.ManualDelivery.delete_time)
		.appendTo(column_options);

	container
		.addClass('list_item')
		.appendTo(time_list);

	// configure params for sending
	value_start
		.attr('type', 'hidden')
		.attr('name', 'start[]')
		.attr('value', input_start.val())
		.appendTo(container);

	value_end
		.attr('type', 'hidden')
		.attr('name', 'end[]')
		.attr('value', input_end.val())
		.appendTo(container);

	value_price
		.attr('type', 'hidden')
		.attr('name', 'price[]')
		.attr('value', input_price.val())
		.appendTo(container);

	// configure values
	column_start.html(input_start.val());
	column_end.html(input_end.val());
	column_price.html(input_price.val());
};

/**
 * Handle clicking on remove time.
 *
 * @param object button
 */
Caracal.Shop.ManualDelivery.delete_time = function(button) {
	if ('type' in button && button.type == 'click')
		var button = $(this); else
		var button = $(button);

	var interval = button.closest('div.list_item');
	interval.remove();
};
