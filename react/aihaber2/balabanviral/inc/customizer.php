<?php
/**
 * WordPress Customizer Settings & Controls
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register Customizer settings and controls.
 *
 * @param WP_Customize_Manager $wp_customize Customizer Manager object.
 */
function my_theme_customize_register( $wp_customize ) {

	// Panel: Theme Settings
	$wp_customize->add_panel(
		'my_theme_options_panel',
		array(
			'title'       => __( 'Theme Options', 'balabanviral' ),
			'description' => __( 'Customize theme layouts, hero section, social channels, and footer information.', 'balabanviral' ),
			'priority'    => 30,
		)
	);

	// Section: Hero & Headline Slider
	$wp_customize->add_section(
		'my_theme_hero_section',
		array(
			'title'    => __( 'Hero & Headline Slider', 'balabanviral' ),
			'panel'    => 'my_theme_options_panel',
			'priority' => 10,
		)
	);

	// Setting: Show Hero Slider
	$wp_customize->add_setting(
		'my_theme_show_hero',
		array(
			'default'           => true,
			'sanitize_callback' => 'my_theme_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'my_theme_show_hero',
		array(
			'label'    => __( 'Enable Hero Slider on Homepage', 'balabanviral' ),
			'section'  => 'my_theme_hero_section',
			'type'     => 'checkbox',
			'priority' => 10,
		)
	);

	// Setting: Ticker Headline Text
	$wp_customize->add_setting(
		'my_theme_ticker_label',
		array(
			'default'           => __( 'Öne Çıkan Haberler', 'balabanviral' ),
			'sanitize_callback' => 'sanitize_text_field',
		)
	);

	$wp_customize->add_control(
		'my_theme_ticker_label',
		array(
			'label'    => __( 'Ticker Badge Label', 'balabanviral' ),
			'section'  => 'my_theme_hero_section',
			'type'     => 'text',
			'priority' => 20,
		)
	);

	// Section: Social Links
	$wp_customize->add_section(
		'my_theme_social_section',
		array(
			'title'    => __( 'Social Media Links', 'balabanviral' ),
			'panel'    => 'my_theme_options_panel',
			'priority' => 20,
		)
	);

	$social_services = array(
		'twitter'   => __( 'Twitter / X URL', 'balabanviral' ),
		'instagram' => __( 'Instagram URL', 'balabanviral' ),
		'youtube'   => __( 'YouTube URL', 'balabanviral' ),
		'telegram'  => __( 'Telegram URL', 'balabanviral' ),
		'linkedin'  => __( 'LinkedIn URL', 'balabanviral' ),
	);

	foreach ( $social_services as $id => $label ) {
		$wp_customize->add_setting(
			"my_theme_social_{$id}",
			array(
				'default'           => '',
				'sanitize_callback' => 'esc_url_raw',
			)
		);

		$wp_customize->add_control(
			"my_theme_social_{$id}",
			array(
				'label'   => $label,
				'section' => 'my_theme_social_section',
				'type'    => 'url',
			)
		);
	}

	// Section: Footer Options
	$wp_customize->add_section(
		'my_theme_footer_section',
		array(
			'title'    => __( 'Footer Settings', 'balabanviral' ),
			'panel'    => 'my_theme_options_panel',
			'priority' => 30,
		)
	);

	// Setting: Copyright Text
	$wp_customize->add_setting(
		'my_theme_copyright_text',
		array(
			'default'           => sprintf( __( '© %s Tüm Hakları Saklıdır.', 'balabanviral' ), date( 'Y' ) ),
			'sanitize_callback' => 'wp_kses_post',
		)
	);

	$wp_customize->add_control(
		'my_theme_copyright_text',
		array(
			'label'    => __( 'Footer Copyright Text', 'balabanviral' ),
			'section'  => 'my_theme_footer_section',
			'type'     => 'textarea',
			'priority' => 10,
		)
	);

	// Section: Demo / compliance options.
	$wp_customize->add_section(
		'my_theme_demo_section',
		array(
			'title'       => __( 'Demo & Sidebar', 'balabanviral' ),
			'panel'       => 'my_theme_options_panel',
			'priority'    => 40,
			'description' => __( 'Marketplace-safe defaults: remote stock images off; demo widgets optional.', 'balabanviral' ),
		)
	);

	$wp_customize->add_setting(
		'my_theme_show_demo_widgets',
		array(
			'default'           => false,
			'sanitize_callback' => 'my_theme_sanitize_checkbox',
		)
	);
	$wp_customize->add_control(
		'my_theme_show_demo_widgets',
		array(
			'label'       => __( 'Show demo sidebar widgets (weather, FX, etc.)', 'balabanviral' ),
			'description' => __( 'Off by default. Sample data only — not live APIs. Enable for theme demos.', 'balabanviral' ),
			'section'     => 'my_theme_demo_section',
			'type'        => 'checkbox',
		)
	);

	$wp_customize->add_setting(
		'my_theme_allow_remote_demo_images',
		array(
			'default'           => false,
			'sanitize_callback' => 'my_theme_sanitize_checkbox',
		)
	);
	$wp_customize->add_control(
		'my_theme_allow_remote_demo_images',
		array(
			'label'       => __( 'Allow remote Unsplash fallback images', 'balabanviral' ),
			'description' => __( 'Off by default (local placeholder). Enable only for local demos; respect Unsplash license.', 'balabanviral' ),
			'section'     => 'my_theme_demo_section',
			'type'        => 'checkbox',
		)
	);
}
add_action( 'customize_register', 'my_theme_customize_register' );

/**
 * Sanitize Checkbox
 *
 * @param bool $checked Input status.
 * @return bool
 */
function my_theme_sanitize_checkbox( $checked ) {
	return ( isset( $checked ) && true === (bool) $checked );
}
