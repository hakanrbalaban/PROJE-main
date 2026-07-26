<?php
/**
 * Front-end asset loading.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue theme styles and scripts.
 */
function akishaber_enqueue_assets() {
	$styles = array(
		'akishaber-main'    => array( 'assets/css/main.css', array() ),
		'akishaber-wp'      => array( 'assets/css/wordpress.css', array( 'akishaber-main' ) ),
		'akishaber-fixes'   => array( 'assets/css/fixes.css', array( 'akishaber-wp' ) ),
		'akishaber-manset'  => array( 'assets/css/manset.css', array( 'akishaber-fixes' ) ),
		'akishaber-premium' => array( 'assets/css/professional.css', array( 'akishaber-manset' ) ),
		'akishaber-parts'   => array( 'assets/css/components.css', array( 'akishaber-premium' ) ),
	);

	foreach ( $styles as $handle => $asset ) {
		$path = AKISHABER_DIR . '/' . $asset[0];
		wp_enqueue_style(
			$handle,
			AKISHABER_URI . '/' . $asset[0],
			$asset[1],
			file_exists( $path ) ? (string) filemtime( $path ) : AKISHABER_VERSION
		);
	}

	$script_path = AKISHABER_DIR . '/assets/js/main.js';
	wp_enqueue_script(
		'akishaber-main',
		AKISHABER_URI . '/assets/js/main.js',
		array(),
		file_exists( $script_path ) ? (string) filemtime( $script_path ) : AKISHABER_VERSION,
		true
	);

	wp_localize_script(
		'akishaber-main',
		'akisHaber',
		array(
			'homeUrl' => esc_url( home_url( '/' ) ),
			'ajaxUrl' => esc_url( admin_url( 'admin-ajax.php' ) ),
			'nonce'   => wp_create_nonce( 'akishaber_public' ),
			'i18n'    => array(
				'copied'          => __( 'Bağlantı kopyalandı', 'akishaber' ),
				'copyFailed'      => __( 'Bağlantıyı kopyalayın:', 'akishaber' ),
				'newsletterSaved' => __( 'Bülten kaydı alındı (demo).', 'akishaber' ),
			),
		)
	);

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'akishaber_enqueue_assets' );
