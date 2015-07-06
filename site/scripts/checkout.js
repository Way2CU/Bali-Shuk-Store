/**
 * Checkout Modification JavaScript
 * Vegetable Shop
 *
 * Copyright (c) 2015. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var city_list = ['Test', 'Test2'];

/**
 * Move DOM elements up.
 */
$.fn.moveUp = function() {
    $.each(this, function() {
         $(this).after($(this).prev());
    });
	return this;
};


$(function() {
	// replace city input field with select
	var city_input = $('div#input_details input[name=city]');

	if (city_input.length > 0) {
		var city_select = $('<select>');
		city_select.attr('name', 'city')

		for (var i=0, count=city_list.length; i<count; i++) {
			var city_option = $('<option>');
			city_option
				.attr('value', city_list[i])
				.html(city_list[i])
				.appendTo(city_select);
		}

		city_input.replaceWith(city_select);
	}

	// move city above address for who knows what reason
	$('div#shipping_information label').eq(6).moveUp().moveUp().addClass('separator');
});
