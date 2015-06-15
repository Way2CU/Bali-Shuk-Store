<?php

class Simple_DeliveryMethod extends DeliveryMethod {
	private static $_instance;
	private $days_to_show = 7;

	protected function __construct($parent) {
		parent::__construct($parent);

		// register delivery method
		$this->name = 'direct';

		if (class_exists('shop'))
			Modules\Shop\Delivery::register_method($this->name, $this);
	}

	/**
	 * Public function that creates a single instance
	 */
	public static function getInstance($parent) {
		if (!isset(self::$_instance))
			self::$_instance = new self($parent);

		return self::$_instance;
	}

	/**
	 * Get status of specified delivery. If available multiple statuses
	 * should be provided last item being the current status of delivery.
	 *
	 * Example of result array:
	 *		$result = array(
	 *					array('Prosessing', 1362040000),
	 *					array('Departure', 1362240000),
	 *					array('In transit', 1362440000),
	 *					array('Delivered', 1363440000)
	 *				);
	 *
	 * @param string $delivery_id
	 * @return array
	 */
	public function getDeliveryStatus($delivery_id) {
	}

	/**
	 * Get available delivery types for selected items. Each type needs
	 * to return estimated delivery time, cost and name of service.
	 *
	 * Example of items array:
	 * 		$items = array(
	 * 					array(
	 * 						'package'		=> 0, // number identifying package
	 * 						'properties'	=> array(),
	 * 						'package_type'	=> 0,
	 * 						'width'			=> 0.2,
	 * 						'height'		=> 0.5,
	 * 						'length'		=> 1,
	 * 						'weight'		=> 0,
	 * 						'units'			=> 1,
	 * 						'count'			=> 1
	 * 					)
	 * 				);
	 *
	 * Example of shipper array:
	 * 		$shipper = array(
	 * 					'street'	=> array(),
	 * 					'city'		=> '',
	 * 					'zip_code'	=> '',
	 * 					'state'		=> '',
	 * 					'country'	=> ''
	 * 				);
	 *
	 * Example of recipient array:
	 * 		$recipient = array(
	 * 					'street'	=> array(),
	 * 					'city'		=> '',
	 * 					'zip_code'	=> '',
	 * 					'state'		=> '',
	 * 					'country'	=> ''
	 * 				);
	 *
	 * Example of result array:
	 *		$result = array(
	 *					'normal' => array('Normal', 19.95, 'USD', 1364040000, 1365040000),
	 *					'express' => array('Express', 33.23, 'USD', 1363040000, 1364040000),
	 *					'express_no_estimate' => array('Express', 8.00, 'USD', false, false)
	 *				);
	 *
	 * @param array $items
	 * @param array $shipper
	 * @param array $recipient
	 * @param string $transaction_id
	 * @param string $preferred_currency
	 * @return array
	 */
	public function getDeliveryTypes($items, $shipper, $recipient, $transaction_id, $preferred_currency) {
		$shop = shop::getInstance();
		$manager = IntervalManager::getInstance();
		$time_manager = IntervalTimeManager::getInstance();
		$days = array();
		$result = array();

		// load all delivery intervals
		$intervals = $manager->getItems($manager->getFieldNames(), array());

		if (count($intervals) == 0)
			return $result;

		foreach ($intervals as $interval) {
			// get hours
			$times = $time_manager->getItems(
					$time_manager->getFieldNames(),
					array('interval' => $interval->id)
				);

			// make sure there are hours defined in this interval
			if (count($times) == 0)
				continue;

			// collect delivery hours
			for ($i = 0; $i < 7; $i++)
				if ($interval->days[$i] == '1') {
					if (!isset($days[$i]))
						$days[$i] = array();

					foreach ($times as $time)
						$days[$i][] = $time;
				}
		}

		// calculate shipping dates for specified number of days
		$today = mktime(0, 0, 0);
		$date_format = $this->parent->getLanguageConstant('format_date_short');
		$time_format = $this->parent->getLanguageConstant('format_time_short');
		$currency = $shop->getDefaultCurrency();

		for ($i = 0; $i < $this->days_to_show; $i++) {
			$current_date = $today + ($i * (24 * 60 * 60));
			$day_of_week = (int) date('N', $current_date) - 1;

			trigger_error($day_of_week);

			// skip day if there are no deliveries
			if (!isset($days[$day_of_week]))
				continue;

			// add intervals
			foreach ($days[$day_of_week] as $time) {
				$start = strtotime($time->start, $current_date);
				$end = strtotime($time->end, $current_date);

				// skip past intervals
				if (time() > $start)
					continue;

				// add new delivery date
				$key = date($date_format.' '.$time_format, $start);
				$result[$key] = array(
						$this->parent->getLanguageConstant('delivery_regular'),
						$time->amount, $currency, $start, $end
					);
			}
		}

		return $result;
	}

	/**
	 * Get list of supported package types. Items in resulting array must
	 * corespond to constants in PackageType class.
	 *
	 * Example of resulting array:
	 * 		$result = array(
	 * 					PackageType::BOX_10,
	 * 					PackageType::ENVELOPE,
	 * 					PackageType::PAK
	 * 				);
	 *
	 * @return array
	 */
	public function getSupportedPackageTypes() {
		return array(
				PackageType::USER_PACKAGING
			);
	}

	/**
	 * Get special params supported by delivery method which should be
	 * assigned with items in shop. Resulting array needs to contain
	 * array which will contain key-value pairs of localized group names
	 * and values and a second array with available params.
	 *
	 * Example of result array:
	 *		$result = array(
	 *					array(
	 *						'package_types'		=> 'Packaging params',
	 *						'special_services'	=> 'Special services'
	 *					),
	 *					array(
	 *						'package_types'	=> array(
	 *							array('package_box', 'Box'),
	 *							array('package_tube', 'Tube shaped box'),
	 *							array('package_envelope', 'Envelope'),
	 *						),
	 *						'special_services' => array(
	 *							array('keep_on_ice', 'Keep package cool'),
	 *							array('keep_hot', 'Keep package hot'),
	 *							array('fragile', 'Fragile')
	 *						)
	 *					)
	 *				);
	 *
	 * @return array
	 */
	public function getAvailableParams() {
		return array();
	}

	/**
	 * Whether delivery method can be used for international deliveries.
	 *
	 * @return boolean
	 */
	public function isInternational() {
		return false;
	}
}

?>
