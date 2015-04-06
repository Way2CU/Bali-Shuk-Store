<?php

/**
 * Vegetable Shop - Fixed Delivery Method
 *
 * This module provides delivery method with fixed shipping rate
 * with few additional options such as desired date and time of delivery.
 *
 * Author: Mladen Mijatov
 */
use Core\Module;


class delivery extends Module {
	private static $_instance;

	/**
	 * Constructor
	 */
	protected function __construct() {
		global $section;

		parent::__construct(__FILE__);

		// register backend
		if (class_exists('backend')) {
			$backend = backend::getInstance();
		}
	}

	/**
	 * Public function that creates a single instance
	 */
	public static function getInstance() {
		if (!isset(self::$_instance))
			self::$_instance = new self();

		return self::$_instance;
	}

	/**
	 * Transfers control to module functions
	 *
	 * @param array $params
	 * @param array $children
	 */
	public function transferControl($params=array(), $children=array()) {
		// global control actions
		if (isset($params['action']))
			switch ($params['action']) {
				case 'show_price':
					$this->show_price($params, $children);
					break;

				default:
					break;
			}

		// global control actions
		if (isset($params['backend_action']))
			switch ($params['backend_action']) {
				default:
					break;
			}
	}

	/**
	 * Event triggered upon module initialization
	 */
	public function onInit() {
	}

	/**
	 * Event triggered upon module deinitialization
	 */
	public function onDisable() {
	}

	/**
	 * Show price for this delivery method.
	 *
	 * @param array $tag_params
	 * @param array $children
	 */
	private function show_price($tag_params, $children) {
	}
}
