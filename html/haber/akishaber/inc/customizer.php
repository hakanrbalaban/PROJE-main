<?php
/**
 * Theme Customizer.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register customizer settings.
 *
 * @param WP_Customize_Manager $wp_customize Customizer.
 */
function akishaber_customize_register( $wp_customize ) {
	$wp_customize->add_section(
		'akishaber_settings',
		array(
			'title'    => __( 'Akış Haber Ayarları', 'akishaber' ),
			'priority' => 30,
		)
	);

	$settings = array(
		'akishaber_whatsapp'     => array(
			'label'   => __( 'WhatsApp İhbar Linki', 'akishaber' ),
			'default' => 'https://wa.me/',
			'type'    => 'url',
		),
		'akishaber_default_city' => array(
			'label'   => __( 'Varsayılan Şehir', 'akishaber' ),
			'default' => 'Bursa',
			'type'    => 'text',
		),
		'akishaber_market_dolar' => array(
			'label'   => __( 'Dolar', 'akishaber' ),
			'default' => '34,12',
			'type'    => 'text',
		),
		'akishaber_market_euro'  => array(
			'label'   => __( 'Euro', 'akishaber' ),
			'default' => '37,05',
			'type'    => 'text',
		),
		'akishaber_market_altin' => array(
			'label'   => __( 'Altın', 'akishaber' ),
			'default' => '2.841',
			'type'    => 'text',
		),
		'akishaber_market_bist'  => array(
			'label'   => __( 'BİST', 'akishaber' ),
			'default' => '9.412',
			'type'    => 'text',
		),
		'akishaber_market_btc'   => array(
			'label'   => __( 'Bitcoin', 'akishaber' ),
			'default' => '67.240',
			'type'    => 'text',
		),
		'akishaber_newsletter'   => array(
			'label'   => __( 'Bülten kısa açıklama', 'akishaber' ),
			'default' => __( 'Sabah bülteni ile manşetleri, piyasa özetini ve son dakikaları kaçırma.', 'akishaber' ),
			'type'    => 'textarea',
		),
		'akishaber_quote_custom' => array(
			'label'   => __( 'Günün sözü (Söz|Kaynak)', 'akishaber' ),
			'default' => '',
			'type'    => 'textarea',
		),
		'akishaber_verse_custom' => array(
			'label'   => __( 'Günün ayeti (Meal|Sure, Ayet)', 'akishaber' ),
			'default' => '',
			'type'    => 'textarea',
		),
		'akishaber_social_facebook'  => array(
			'label'   => __( 'Facebook adresi', 'akishaber' ),
			'default' => '',
			'type'    => 'url',
		),
		'akishaber_social_x'         => array(
			'label'   => __( 'X (Twitter) adresi', 'akishaber' ),
			'default' => '',
			'type'    => 'url',
		),
		'akishaber_social_instagram' => array(
			'label'   => __( 'Instagram adresi', 'akishaber' ),
			'default' => '',
			'type'    => 'url',
		),
		'akishaber_social_youtube'   => array(
			'label'   => __( 'YouTube adresi', 'akishaber' ),
			'default' => '',
			'type'    => 'url',
		),
	);

	foreach ( $settings as $id => $cfg ) {
		$wp_customize->add_setting(
			$id,
			array(
				'default'           => $cfg['default'],
				'sanitize_callback' => 'url' === $cfg['type'] ? 'esc_url_raw' : 'sanitize_text_field',
			)
		);
		$wp_customize->add_control(
			$id,
			array(
				'label'   => $cfg['label'],
				'section' => 'akishaber_settings',
				'type'    => $cfg['type'],
			)
		);
	}
}
add_action( 'customize_register', 'akishaber_customize_register' );

/**
 * Helper get theme mod with default.
 *
 * @param string $key Key.
 * @param mixed  $default Default.
 * @return mixed
 */
function akishaber_mod( $key, $default = '' ) {
	return get_theme_mod( $key, $default );
}
