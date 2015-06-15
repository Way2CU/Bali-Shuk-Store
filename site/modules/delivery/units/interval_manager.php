<?php

class IntervalManager extends ItemManager {
	private static $_instance;

	/**
	 * Constructor
	 */
	protected function __construct() {
		parent::__construct('delivery_intervals');

		$this->addProperty('id', 'int');
		$this->addProperty('days', 'char');
		$this->addProperty('enabled', 'boolean');
	}

	/**
	* Public function that creates a single instance
	*/
	public static function getInstance() {
		if (!isset(self::$_instance))
			self::$_instance = new self();

		return self::$_instance;
	}
}

?>
