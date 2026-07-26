<?php
/**
 * Core theme setup.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers theme supports, menus, image sizes and widget areas.
 */
final class AkisHaber_Theme_Setup {

	/**
	 * Singleton instance.
	 *
	 * @var AkisHaber_Theme_Setup|null
	 */
	private static $instance = null;

	/**
	 * Get singleton instance.
	 *
	 * @return AkisHaber_Theme_Setup
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Register hooks.
	 */
	private function __construct() {
		add_action( 'after_setup_theme', array( $this, 'setup' ) );
		add_action( 'after_setup_theme', array( $this, 'content_width' ), 0 );
		add_action( 'widgets_init', array( $this, 'register_sidebars' ) );
	}

	/**
	 * Configure WordPress theme features.
	 */
	public function setup() {
		load_theme_textdomain( 'akishaber', AKISHABER_DIR . '/languages' );

		add_theme_support( 'automatic-feed-links' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'customize-selective-refresh-widgets' );
		add_theme_support( 'align-wide' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'wp-block-styles' );
		add_theme_support( 'editor-styles' );
		add_editor_style( 'assets/css/editor-style.css' );
		add_theme_support(
			'html5',
			array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' )
		);
		add_theme_support(
			'custom-logo',
			array(
				'height'      => 80,
				'width'       => 260,
				'flex-height' => true,
				'flex-width'  => true,
			)
		);

		set_post_thumbnail_size( 800, 500, true );
		add_image_size( 'akishaber-hero', 1280, 720, true );
		add_image_size( 'akishaber-card', 720, 450, true );
		add_image_size( 'akishaber-thumb', 240, 160, true );
		add_image_size( 'akishaber-related', 480, 300, true );
		add_image_size( 'akishaber-author', 160, 160, true );

		register_nav_menus(
			array(
				'primary'  => __( 'Ana Menü', 'akishaber' ),
				'quick'    => __( 'Hızlı Linkler', 'akishaber' ),
				'topbar'   => __( 'Üst Bar Menü', 'akishaber' ),
				'footer-1' => __( 'Alt Bilgi Kategoriler', 'akishaber' ),
				'footer-2' => __( 'Alt Bilgi Servisler', 'akishaber' ),
				'footer-3' => __( 'Alt Bilgi Kurumsal', 'akishaber' ),
				'mobile'   => __( 'Mobil Menü', 'akishaber' ),
			)
		);
	}

	/**
	 * Set global content width.
	 */
	public function content_width() {
		$GLOBALS['content_width'] = apply_filters( 'akishaber_content_width', 820 );
	}

	/**
	 * Register widget areas.
	 */
	public function register_sidebars() {
		$sidebars = array(
			'sidebar-1'     => __( 'Yazı ve Arşiv Kenar Çubuğu', 'akishaber' ),
			'home-sidebar'  => __( 'Ana Sayfa Kenar Çubuğu', 'akishaber' ),
			'home-markets'  => __( 'Piyasalar Ek Alanı', 'akishaber' ),
			'home-services' => __( 'Servisler Ek Alanı', 'akishaber' ),
			'footer-extra'  => __( 'Alt Bilgi Ek Alanı', 'akishaber' ),
		);

		foreach ( $sidebars as $id => $name ) {
			register_sidebar(
				array(
					'name'          => $name,
					'id'            => $id,
					'description'   => sprintf(
						/* translators: %s: widget area name. */
						__( '%s için bileşen alanı.', 'akishaber' ),
						$name
					),
					'before_widget' => '<section id="%1$s" class="widget sidebar-card %2$s">',
					'after_widget'  => '</section>',
					'before_title'  => '<h2 class="widget-title">',
					'after_title'   => '</h2>',
				)
			);
		}
	}
}
