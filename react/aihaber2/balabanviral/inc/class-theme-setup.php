<?php
/**
 * Main Theme Setup Class
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! class_exists( 'My_Theme_Setup' ) ) {

	/**
	 * Main Theme Setup Initialization Class
	 */
	class My_Theme_Setup {

		/**
		 * Instance holder
		 *
		 * @var My_Theme_Setup|null
		 */
		private static $instance = null;

		/**
		 * Get Singleton Instance
		 */
		public static function get_instance() {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}
			return self::$instance;
		}

		/**
		 * Constructor
		 */
		private function __construct() {
			add_action( 'after_setup_theme', array( $this, 'setup' ) );
			add_action( 'widgets_init', array( $this, 'register_widgets' ) );
			add_action( 'after_setup_theme', array( $this, 'set_content_width' ), 0 );
		}

		/**
		 * Setup Theme Defaults and Theme Supports
		 */
		public function setup() {
			// Make theme available for translation.
			load_theme_textdomain( 'balabanviral', get_template_directory() . '/languages' );

			// Add default posts and comments RSS feed links to head.
			add_theme_support( 'automatic-feed-links' );

			// Let WordPress manage the document title tag.
			add_theme_support( 'title-tag' );

			// Enable support for Post Thumbnails on posts and pages.
			add_theme_support( 'post-thumbnails' );
			set_post_thumbnail_size( 800, 450, true );

			// Add custom image sizes.
			add_image_size( 'my-theme-slider', 1200, 600, true );
			add_image_size( 'my-theme-grid', 640, 360, true );
			add_image_size( 'my-theme-small', 150, 150, true );

			// Register Navigation Menus.
			register_nav_menus(
				array(
					'primary' => __( 'Primary Navigation Menu', 'balabanviral' ),
					'footer'  => __( 'Footer Links Menu', 'balabanviral' ),
				)
			);

			/*
			 * Switch default core markup for search form, comment form, comments, gallery, caption, etc.
			 * to output valid HTML5.
			 */
			add_theme_support(
				'html5',
				array(
					'search-form',
					'comment-form',
					'comment-list',
					'gallery',
					'caption',
					'style',
					'script',
				)
			);

			// Set up the WordPress core custom logo feature.
			add_theme_support(
				'custom-logo',
				array(
					'height'      => 100,
					'width'       => 300,
					'flex-height' => true,
					'flex-width'  => true,
				)
			);

			// Add support for full and wide align images.
			add_theme_support( 'align-wide' );

			// Add responsive embeds support.
			add_theme_support( 'responsive-embeds' );
		}

		/**
		 * Set content width globally
		 */
		public function set_content_width() {
			$GLOBALS['content_width'] = apply_filters( 'my_theme_content_width', 1200 );
		}

		/**
		 * Register Sidebar & Widget Areas
		 */
		public function register_widgets() {
			register_sidebar(
				array(
					'name'          => __( 'Main Sidebar', 'balabanviral' ),
					'id'            => 'sidebar-1',
					'description'   => __( 'Widgets added here will appear in the main sidebar.', 'balabanviral' ),
					'before_widget' => '<section id="%1$s" class="widget %2$s">',
					'after_widget'  => '</section>',
					'before_title'  => '<h3 class="widget-title">',
					'after_title'   => '</h3>',
				)
			);

			register_sidebar(
				array(
					'name'          => __( 'Footer Widget 1', 'balabanviral' ),
					'id'            => 'footer-1',
					'description'   => __( 'Appears in the first column of the footer.', 'balabanviral' ),
					'before_widget' => '<section id="%1$s" class="widget %2$s">',
					'after_widget'  => '</section>',
					'before_title'  => '<h3 class="widget-title">',
					'after_title'   => '</h3>',
				)
			);

			register_sidebar(
				array(
					'name'          => __( 'Footer Widget 2', 'balabanviral' ),
					'id'            => 'footer-2',
					'description'   => __( 'Appears in the second column of the footer.', 'balabanviral' ),
					'before_widget' => '<section id="%1$s" class="widget %2$s">',
					'after_widget'  => '</section>',
					'before_title'  => '<h3 class="widget-title">',
					'after_title'   => '</h3>',
				)
			);

			register_sidebar(
				array(
					'name'          => __( 'Footer Widget 3', 'balabanviral' ),
					'id'            => 'footer-3',
					'description'   => __( 'Appears in the third column of the footer.', 'balabanviral' ),
					'before_widget' => '<section id="%1$s" class="widget %2$s">',
					'after_widget'  => '</section>',
					'before_title'  => '<h3 class="widget-title">',
					'after_title'   => '</h3>',
				)
			);
		}
	}
}

// Initialize Theme Setup Singleton.
My_Theme_Setup::get_instance();
