<?php

class IntervalTimeManager extends ItemManager {
	private static $_instance;

	/**
	 * Constructor
	 */
	protected function __construct() {
		parent::__construct('delivery_times');

		$this->addProperty('interval', 'int');
		$this->addProperty('start', 'time');
		$this->addProperty('end', 'time');
		$this->addProperty('amount', 'decimal');
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
