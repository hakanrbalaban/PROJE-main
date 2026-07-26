<?php
/**
 * Theme-supported custom post types.
 *
 * Content remains accessible if the theme changes; production sites should
 * move these registrations to a companion plugin.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register gallery and publication content types.
 */
function akishaber_register_post_types() {
	register_post_type(
		'akis_gallery',
		array(
			'labels' => array(
				'name'          => __( 'Galeriler', 'akishaber' ),
				'singular_name' => __( 'Galeri', 'akishaber' ),
				'add_new_item'  => __( 'Yeni Galeri Ekle', 'akishaber' ),
				'edit_item'     => __( 'Galeriyi Düzenle', 'akishaber' ),
			),
			'public'       => true,
			'show_in_rest' => true,
			'has_archive'  => true,
			'rewrite'      => array( 'slug' => 'galeri' ),
			'menu_icon'    => 'dashicons-format-gallery',
			'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'author', 'comments' ),
		)
	);

	register_post_type(
		'akis_publication',
		array(
			'labels' => array(
				'name'          => __( 'Yayınlar', 'akishaber' ),
				'singular_name' => __( 'Yayın', 'akishaber' ),
				'add_new_item'  => __( 'Yeni Yayın Ekle', 'akishaber' ),
				'edit_item'     => __( 'Yayını Düzenle', 'akishaber' ),
			),
			'public'       => true,
			'show_in_rest' => true,
			'has_archive'  => true,
			'rewrite'      => array( 'slug' => 'yayinlar' ),
			'menu_icon'    => 'dashicons-media-document',
			'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt', 'author' ),
		)
	);
}
add_action( 'init', 'akishaber_register_post_types' );
