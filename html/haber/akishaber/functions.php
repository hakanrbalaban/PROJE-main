<?php
/**
 * Akış Haber — functions
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AKISHABER_VERSION', '2.1.0' );
define( 'AKISHABER_DIR', get_template_directory() );
define( 'AKISHABER_URI', get_template_directory_uri() );

require_once AKISHABER_DIR . '/inc/class-theme-setup.php';
require_once AKISHABER_DIR . '/inc/enqueue.php';
require_once AKISHABER_DIR . '/inc/icons.php';
require_once AKISHABER_DIR . '/inc/daily-content.php';
require_once AKISHABER_DIR . '/inc/helpers.php';
require_once AKISHABER_DIR . '/inc/customizer.php';
require_once AKISHABER_DIR . '/inc/hooks.php';
require_once AKISHABER_DIR . '/inc/template-tags.php';
require_once AKISHABER_DIR . '/inc/widgets.php';
require_once AKISHABER_DIR . '/inc/custom-post-types.php';
require_once AKISHABER_DIR . '/inc/demo-content.php';
require_once AKISHABER_DIR . '/inc/admin.php';
require_once AKISHABER_DIR . '/inc/widgets-seed.php';

AkisHaber_Theme_Setup::get_instance();
