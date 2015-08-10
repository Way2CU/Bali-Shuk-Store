/**
 * Checkout Modification JavaScript
 * Vegetable Shop
 *
 * Copyright (c) 2015. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var city_list = [
	'בני ברק',
	'גבעתיים',
	'גבעת שמואל',
	'הרצליה',
	'כפר שמריהו',
	'סביון',
	'פתח תקווה',
	'קריית אונו',
	'רמת אפעל',
	'רמת גן',
	'רמת השרון',
	'תל אביב'
];
var original_validator = null;

/**
 * Move DOM elements up.
 */
$.fn.moveUp = function() {
    $.each(this, function() {
         $(this).after($(this).prev());
    });
	return this;
};


/**
 * Make sure ZIP code is filled in.
 * @return boolean
 */
function validate_shipping_information() {
	var input_zip = $('div#shipping_information.page input[name=zip]');

	if (input_zip.val() == '')
		input_zip.val('0');

	return original_validator();
}


$(function() {
	// make phone number mandatory
	$('div#shipping_information input[name=phone]').attr('data-required', 1);

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

	// monkey patch validator to make zip code is optional
	original_validator = $('div#shipping_information.page').data('validator');
	$('div#shipping_information.page').data('validator', validate_shipping_information);
});
