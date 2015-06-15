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

require_once('units/interval_manager.php');
require_once('units/time_manager.php');


class delivery extends Module {
	private static $_instance;

	/**
	 * Constructor
	 */
	protected function __construct() {
		global $section;

		parent::__construct(__FILE__);

		// register delivery method and create menu items
		if (class_exists('backend') && class_exists('shop')) {
			require_once('units/method.php');
			Simple_DeliveryMethod::getInstance($this);

			$backend = backend::getInstance();
			$method_menu = $backend->getMenu('shop_delivery_methods');

			if (!is_null($method_menu))
				$method_menu->addChild('', new backend_MenuItem(
									$this->getLanguageConstant('menu_delivery'),
									url_GetFromFilePath($this->path.'images/icon.png'),

									window_Open( // on click open window
												'delivery_intervals',
												650,
												$this->getLanguageConstant('title_intervals'),
												true, true,
												backend_UrlMake($this->name, 'intervals')
											),
									$level=5
								));
		}

		// register backend style
		$head_tag = head_tag::getInstance();
		$head_tag->addTag('link',
					array(
						'href'	=> url_GetFromFilePath($this->path.'include/backend.css'),
						'rel'	=> 'stylesheet',
						'type'	=> 'text/css'
					));
		$head_tag->addTag('script',
					array(
						'src' 	=> url_GetFromFilePath($this->path.'include/backend.js'),
						'type'	=> 'text/javascript'
					));
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
				case 'intervals':
					$this->show_intervals();
					break;

				case 'intervals_add':
					$this->add_interval();
					break;

				case 'intervals_change':
					$this->change_interval();
					break;

				case 'intervals_save':
					$this->save_interval();
					break;

				case 'intervals_delete':
					$this->delete_interval();
					break;

				case 'intervals_delete_commit':
					$this->delete_interval_commit();

				default:
					break;
			}
	}

	/**
	 * Event triggered upon module initialization
	 */
	public function onInit() {
		global $db;

		// create delivery intervals table
		$sql = "
			CREATE TABLE `delivery_intervals` (
				`id` int NOT NULL AUTO_INCREMENT,
				`days` char(7) NOT NULL,
				`enabled` boolean NOT NULL DEFAULT '1',
				PRIMARY KEY (`id`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=0;";
		$db->query($sql);

		// create delivery times table
		$sql = "
			CREATE TABLE `delivery_times` (
				`interval` int NOT NULL,
				`start` time NOT NULL,
				`end` time NOT NULL,
				`amount` decimal(10,2) NULL,
				KEY (`interval`)
			) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=0;";
		$db->query($sql);
	}

	/**
	 * Event triggered upon module deinitialization
	 */
	public function onDisable() {
		global $db;

		$tables = array('delivery_intervals', 'delivery_times');
		$db->drop_tables($tables);
	}

	/**
	 * Show settings window.
	 */
	private function show_intervals() {
		$template = new TemplateHandler('list.xml', $this->path.'templates/');
		$template->setMappedModule($this->name);

		$params = array(
					'link_new'		=> window_OpenHyperlink(
										$this->getLanguageConstant('new'),
										'delivery_intervals_add', 500,
										$this->getLanguageConstant('title_interval_new'),
										true, false,
										$this->name,
										'intervals_add'
									),
					);

		$template->registerTagHandler('cms:list', $this, 'tag_IntervalList');
		$template->setLocalParams($params);
		$template->restoreXML();
		$template->parse();
	}

	/**
	 * Show form for adding new interval.
	 */
	private function add_interval() {
		$template = new TemplateHandler('add.xml', $this->path.'templates/');
		$template->setMappedModule($this->name);
		$template->registerTagHandler('cms:days', $this, 'tag_Days');

		$params = array(
					'form_action'	=> backend_UrlMake($this->name, 'intervals_save'),
					'cancel_action'	=> window_Close('delivery_intervals_add')
				);

		$template->restoreXML();
		$template->setLocalParams($params);
		$template->parse();
	}

	/**
	 * Show form for changing specified interval.
	 */
	private function change_interval() {
		$id = fix_id($_REQUEST['id']);
		$manager = IntervalManager::getInstance();

		// get interval
		$item = $manager->getSingleItem($manager->getFieldNames(), array('id' => $id));

		if (!is_object($item))
			return;

		// show template
		$template = new TemplateHandler('change.xml', $this->path.'templates/');
		$template->setMappedModule($this->name);
		$template->registerTagHandler('cms:days', $this, 'tag_Days');
		$template->registerTagHandler('cms:times', $this, 'tag_Times');

		$params = array(
					'id'			=> $item->id,
					'days'			=> $item->days,
					'enabled'		=> $item->enabled,
					'form_action'	=> backend_UrlMake($this->name, 'intervals_save'),
					'cancel_action'	=> window_Close('delivery_intervals_change')
				);

		$template->restoreXML();
		$template->setLocalParams($params);
		$template->parse();
	}

	/**
	 * Save new or modified interval data.
	 */
	private function save_interval() {
		$manager = IntervalManager::getInstance();
		$time_manager = IntervalTimeManager::getInstance();
		$id = isset($_POST['id']) ? fix_id($_POST['id']) : null;
		$enabled = $_POST['enabled'] == '1';

		// get days selection
		$days = '0000000';
		for ($i = 1; $i <= 7; $i++) {
			$name = 'day_'.$i;
			$days[$i-1] = fix_id($_POST[$name]);
		}

		if (is_null($id)) {
			// insert new interval
			$manager->insertData(array(
				'days'		=> $days,
				'enabled'	=> $enabled
			));
			$id = $manager->getInsertedId();
			$window = 'delivery_intervals_add';

		} else {
			// save modified interval
			$manager->updateData(
				array(
					'days'		=> $days,
					'enabled'	=> $enabled
				),
				array('id' => $id));
			$time_manager->deleteData(array('interval' => $id));
			$window = 'delivery_intervals_change';
		}

		// insert time intervals
		foreach ($_POST['price'] as $index => $price) {
			$start = escape_chars(urldecode($_POST['start'][$index])).':00';
			$end = escape_chars(urldecode($_POST['end'][$index])).':00';

			$time_manager->insertData(array(
				'interval'	=> $id,
				'start'		=> $start,
				'end'		=> $end,
				'amount'	=> escape_chars($price)
			));
		}

		// show message
		$template = new TemplateHandler('message.xml', $this->path.'templates/');
		$template->setMappedModule($this->name);

		$params = array(
					'message'	=> $this->getLanguageConstant('message_interval_saved'),
					'button'	=> $this->getLanguageConstant('close'),
					'action'	=> window_Close($window).';'.window_ReloadContent('delivery_intervals'),
				);

		$template->restoreXML();
		$template->setLocalParams($params);
		$template->parse();
	}

	/**
	 * Show confirmation form for interval.
	 */
	private function delete_interval() {
		global $language;

		$id = fix_id($_REQUEST['id']);
		$manager = IntervalManager::getInstance();

		$item = $manager->getSingleItem(array('days'), array('id' => $id));
		$days = array();
		for ($i = 0; $i < 7; $i++) {
			if ($item->days[$i] == '1')
				$days[] = $this->getLanguageConstant('label_'.($i+1));
		}
		$days = implode(', ', $days);

		$template = new TemplateHandler('confirmation.xml', $this->path.'templates/');
		$template->setMappedModule($this->name);

		$params = array(
					'message'		=> $this->getLanguageConstant('message_interval_delete'),
					'name'			=> $days,
					'yes_text'		=> $this->getLanguageConstant('delete'),
					'no_text'		=> $this->getLanguageConstant('cancel'),
					'yes_action'	=> window_LoadContent(
											'delivery_intervals_delete',
											url_Make(
												'transfer_control',
												'backend_module',
												array('module', $this->name),
												array('backend_action', 'intervals_delete_commit'),
												array('id', $id)
											)
										),
					'no_action'		=> window_Close('delivery_intervals_delete')
				);

		$template->restoreXML();
		$template->setLocalParams($params);
		$template->parse();
	}

	/**
	 * Perform interval removal.
	 */
	private function delete_interval_commit() {
		$id = fix_id($_REQUEST['id']);
		$manager = IntervalManager::getInstance();
		$time_manager = IntervalTimeManager::getInstance();

		$manager->deleteData(array('id' => $id));
		$time_manager->deleteData(array('interval' => $id));

		$template = new TemplateHandler('message.xml', $this->path.'templates/');
		$template->setMappedModule($this->name);

		$params = array(
					'message'	=> $this->getLanguageConstant('message_interval_deleted'),
					'button'	=> $this->getLanguageConstant('close'),
					'action'	=> window_Close('delivery_intervals_delete').';'.window_ReloadContent('delivery_intervals')
				);

		$template->restoreXML();
		$template->setLocalParams($params);
		$template->parse();
	}

	/**
	 * Show price for this delivery method.
	 *
	 * @param array $tag_params
	 * @param array $children
	 */
	private function show_price($tag_params, $children) {
		$shop = shop::getInstance();
		$template = $this->loadTemplate($tag_params, 'price.xml');

		// prepare parameters
		$params = array(
				'price'		=> 10,
				'currency'	=> $shop->getDefaultCurrency()
			);

		// parse template
		$template->restoreXML();
		$template->setLocalParams($params);
		$template->parse();
	}

	/**
	 * Tag handler for interval list.
	 *
	 * @param array $tag_params
	 * @param array $children
	 */
	public function tag_IntervalList($tag_params, $children) {
		$manager = IntervalManager::getInstance();
		$conditions = array();

		// get intervals
		$intervals = $manager->getItems($manager->getFieldNames(), $conditions);

		// load template
		$template = $this->loadTemplate($tag_params, 'list_item.xml');
		$template->registerTagHandler('cms:days', $this, 'tag_Days');
		$template->registerTagHandler('cms:times', $this, 'tag_Times'); 
		// parse template
		if (count($intervals) > 0)
			foreach ($intervals as $interval) {
				$params = array(
					'id'		=> $interval->id,
					'days'		=> $interval->days,
					'enabled'	=> $interval->enabled,
					'item_change'	=> url_MakeHyperlink(
											$this->getLanguageConstant('change'),
											window_Open(
												'delivery_intervals_change', 	// window id
												500,				// width
												$this->getLanguageConstant('title_interval_change'), // title
												false, false,
												url_Make(
													'transfer_control',
													'backend_module',
													array('module', $this->name),
													array('backend_action', 'intervals_change'),
													array('id', $interval->id)
												)
											)
										),
					'item_delete'	=> url_MakeHyperlink(
											$this->getLanguageConstant('delete'),
											window_Open(
												'delivery_intervals_delete', 	// window id
												400,				// width
												$this->getLanguageConstant('title_interval_delete'), // title
												false, false,
												url_Make(
													'transfer_control',
													'backend_module',
													array('module', $this->name),
													array('backend_action', 'intervals_delete'),
													array('id', $interval->id)
												)
											)
										),
				);

				$template->setLocalParams($params);
				$template->restoreXML();
				$template->parse();
			}
	}

	/**
	 * Tag handler for showing days selection.
	 *
	 * @param array $tag_params
	 * @param array $children
	 */
	public function tag_Days($tag_params, $children) {
		$value = '0000000';

		// check if value is set
		if (isset($tag_params['value']))
			$value = escape_chars($tag_params['value']);

		// load template
		$template = $this->loadTemplate($tag_params, 'day.xml');

		// parse template
		for ($i = 1; $i <= 7; $i++) {
			$params = array(
					'name'		=> 'day_'.$i,
					'label'		=> $this->getLanguageConstant('label_'.$i),
					'checked'	=> $value[$i-1] == '1'
				);

			$template->setLocalParams($params);
			$template->restoreXML();
			$template->parse();
		}
	}

	/**
	 * Handle drawing time list.
	 *
	 * @param array $tag_params
	 * @param array $children
	 */
	public function tag_Times($tag_params, $children) {
		$manager = IntervalTimeManager::getInstance();
		$conditions = array();
		$order_by = array('start');

		if (isset($tag_params['interval']))
			$conditions['interval'] = fix_id($tag_params['interval']); else
			$conditions['interval'] = -1;

		// get all times
		$times = $manager->getItems($manager->getFieldNames(), $conditions, $order_by, True);

		// load template
		$template = $this->loadTemplate($tag_params, 'time.xml');

		if (count($times) > 0)
			foreach ($times as $time) {
				$params = array(
					'start'		=> $time->start,
					'end'		=> $time->end,
					'price'		=> $time->amount
				);

				$template->setLocalParams($params);
				$template->restoreXML();
				$template->parse();
			}
	}
}
