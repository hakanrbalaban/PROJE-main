<?php
/**
 * Seed the editorial sidebars with the theme widgets on activation.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Widget layout used for both the homepage and article sidebars.
 *
 * @return array<string,array<int,array>>
 */
function akishaber_default_widget_layout() {
	return array(
		'akishaber_weather'   => array( array( 'title' => __( 'Hava Durumu', 'akishaber' ), 'city' => get_theme_mod( 'akishaber_default_city', 'İstanbul' ) ) ),
		'akishaber_tabs'      => array( array( 'title' => __( 'Haber Akışı', 'akishaber' ), 'count' => 5 ) ),
		'akishaber_posts'     => array(
			array(
				'title'    => __( 'Son Dakika', 'akishaber' ),
				'type'     => 'latest',
				'category' => 'son-dakika',
				'count'    => 5,
				'thumbs'   => 0,
				'numbered' => 1,
			),
		),
		'akishaber_quote'     => array( array( 'title' => __( 'Günün Sözü', 'akishaber' ) ) ),
		'akishaber_verse'     => array( array( 'title' => __( 'Günün Ayeti', 'akishaber' ) ) ),
		'akishaber_horoscope' => array( array( 'title' => __( 'Günlük Burç', 'akishaber' ) ) ),
		'akishaber_markets'   => array( array( 'title' => __( 'Piyasalar', 'akishaber' ) ) ),
		'akishaber_gallery'   => array( array( 'title' => __( 'Foto Galeri', 'akishaber' ), 'count' => 6 ) ),
		'akishaber_prayer'    => array( array( 'title' => __( 'Namaz Vakitleri', 'akishaber' ), 'city' => get_theme_mod( 'akishaber_default_city', 'İstanbul' ) ) ),
		'akishaber_ad'        => array( array( 'title' => '', 'code' => '' ) ),
	);
}

/**
 * Populate sidebar-1 and home-sidebar with theme widgets.
 */
function akishaber_seed_widgets() {
	$version  = '2.1.0';
	$previous = get_option( 'akishaber_widgets_seeded' );
	if ( $version === $previous ) {
		return;
	}

	// Value "1" marks the legacy auto-seeded layout, which may be replaced safely.
	$replaceable = ! $previous || '1' === (string) $previous;
	$sidebars    = get_option( 'sidebars_widgets', array() );
	$targets     = array( 'sidebar-1', 'home-sidebar' );
	$layout      = akishaber_default_widget_layout();

	foreach ( $targets as $offset => $sidebar_id ) {
		if ( ! empty( $sidebars[ $sidebar_id ] ) && ! $replaceable ) {
			continue;
		}

		$assigned = array();
		$counter  = 0;
		foreach ( $layout as $base => $instances ) {
			$option   = 'widget_' . $base;
			$existing = get_option( $option, array() );
			if ( ! is_array( $existing ) ) {
				$existing = array();
			}

			foreach ( $instances as $instance ) {
				// Distinct instance id per sidebar so both areas stay independently editable.
				$instance_id              = 100 + ( $offset * 50 ) + $counter;
				$existing[ $instance_id ] = $instance;
				$assigned[]               = $base . '-' . $instance_id;
				$counter++;
			}

			$existing['_multiwidget'] = 1;
			update_option( $option, $existing );
		}

		$sidebars[ $sidebar_id ] = $assigned;
	}

	update_option( 'sidebars_widgets', $sidebars );
	update_option( 'akishaber_widgets_seeded', $version );
}
add_action( 'after_switch_theme', 'akishaber_seed_widgets', 20 );

/**
 * Upgrade routine so existing installs receive the new widget layout once.
 */
function akishaber_maybe_upgrade_widgets() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}
	akishaber_seed_widgets();
}
add_action( 'admin_init', 'akishaber_maybe_upgrade_widgets' );
