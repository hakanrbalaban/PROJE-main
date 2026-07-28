<?php
/**
 * Theme Bootstrap and Module Loader
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define Theme Constants
 */
define( 'MY_THEME_VERSION', '1.8.12' );
define( 'MY_THEME_DIR', get_template_directory() );
define( 'MY_THEME_URI', get_template_directory_uri() );

/**
 * Require Core Inc Files
 */
require_once MY_THEME_DIR . '/inc/class-theme-setup.php';
require_once MY_THEME_DIR . '/inc/enqueue.php';
require_once MY_THEME_DIR . '/inc/helpers.php';
require_once MY_THEME_DIR . '/inc/hooks.php';
require_once MY_THEME_DIR . '/inc/template-tags.php';
require_once MY_THEME_DIR . '/inc/customizer.php';
require_once MY_THEME_DIR . '/inc/widgets.php';
require_once MY_THEME_DIR . '/inc/custom-post-types.php';
require_once MY_THEME_DIR . '/inc/post-features.php';
require_once MY_THEME_DIR . '/inc/media-helpers.php';
require_once MY_THEME_DIR . '/inc/reactions.php';
require_once MY_THEME_DIR . '/inc/dummy-data.php';
