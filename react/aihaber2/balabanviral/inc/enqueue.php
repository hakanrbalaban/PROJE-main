<?php
/**
 * Script & Style Enqueue Logic
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue Theme Scripts and Styles
 */
function my_theme_enqueue_assets() {
	$theme_version = wp_get_theme()->get( 'Version' );

	// Google Fonts: Figtree (display, OFL) + Montserrat (body / UI).
	wp_enqueue_style(
		'balabanviral-fonts',
		'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&display=swap',
		array(),
		null
	);

	// Local layout utilities (replaces Tailwind CDN for marketplace compliance).
	wp_enqueue_style(
		'balabanviral-utilities',
		get_template_directory_uri() . '/assets/css/utilities.css',
		array( 'balabanviral-fonts' ),
		$theme_version
	);

	wp_enqueue_style(
		'balabanviral-main',
		get_template_directory_uri() . '/assets/css/main.css',
		array( 'balabanviral-utilities' ),
		$theme_version
	);

	wp_enqueue_style(
		'balabanviral-style',
		get_stylesheet_uri(),
		array( 'balabanviral-main' ),
		$theme_version
	);

	wp_enqueue_script(
		'balabanviral-main',
		get_template_directory_uri() . '/assets/js/main.js',
		array(),
		$theme_version,
		true
	);

	wp_localize_script(
		'balabanviral-main',
		'MyThemeAjax',
		array(
			'ajax_url'    => admin_url( 'admin-ajax.php' ),
			'nonce'       => wp_create_nonce( 'my_theme_reaction_nonce' ),
			'placeholder' => get_template_directory_uri() . '/assets/images/placeholder.svg',
		)
	);

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_assets' );
