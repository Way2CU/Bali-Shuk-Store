/**
 * Frequently Asked Questions
 * Licemaster
 *
 * Copyright (c) 2013. by Way2CU
 * Author: Mladen Mijatov
 */

function FAQ() {
	var self = this;

	self.questions = [];
	self.answers = [];
	self.current = null;

	/**
	 * Complete object initialization.
	 */
	self.init = function() {
		$('div#faq dt').each(function(index) {
			var question = $(this);
			var answer = question.next();

			question
				.data('index', index)
				.click(self.__handleClick);

			answer.hide();

			self.questions.push(question);
			self.answers.push(answer);
		});
	};

	/**
	 * Handle clicking on question container.
	 *
	 * @param object event
	 */
	self.__handleClick = function(event) {
		var question = $(this);
		var index = question.data('index');

		if (!question.hasClass('expanded'))
			self.expandAnswer(index); else
			self.collapseAnswer(index);

		// prevent default click behavior
		event.preventDefault();
	};

	/**
	 * Show answer for specified question.
	 *
	 * @param integer index
	 */
	self.expandAnswer = function(index) {
		var question = self.questions[index];
		var answer = self.answers[index];

		// collapse existing answer
		if (self.current != null)
			self.collapseAnswer(self.current)

		// expand current
		question.addClass('expanded');
		answer.slideDown();

		// save current index
		self.current = index;
	};

	/**
	 * Hide answer for specified question.
	 *
	 * @param integer index
	 */
	self.collapseAnswer = function(index) {
		var question = self.questions[index];
		var answer = self.answers[index];

		question.removeClass('expanded')
		answer.slideUp();
	};

	// finish object initialization
	self.init();
}

$(function() {
	new FAQ();
});
