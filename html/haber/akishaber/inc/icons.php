<?php
/**
 * Inline SVG icon library.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return the raw path markup for an icon.
 *
 * @param string $name Icon key.
 * @return string
 */
function akishaber_icon_path( $name ) {
	$icons = array(
		'gundem'    => '<path d="M4 5h11a2 2 0 0 1 2 2v11a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><path d="M7 9h6M7 13h6M7 17h4"/>',
		'politika'  => '<path d="M12 3l9 5-9 5-9-5z"/><path d="M6 11v6M18 11v6M4 20h16"/>',
		'ekonomi'   => '<path d="M4 18l5-6 4 3 6-8"/><path d="M15 7h5v5"/><path d="M4 20h16"/>',
		'spor'      => '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M6 6c3 2 9 2 12 0M6 18c3-2 9-2 12 0"/>',
		'magazin'   => '<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.2l5.9-.8z"/>',
		'saglik'    => '<path d="M3 12h4l2-4 3 8 2-4h7"/>',
		'teknoloji' => '<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M2 20h20M9 8h6M9 12h4"/>',
		'dunya'     => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
		'foto'      => '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
		'video'     => '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
		'yazarlar'  => '<path d="M4 20l4-1 10-10a2.5 2.5 0 0 0-3.5-3.5L4.5 15.5z"/><path d="M13.5 6.5l4 4"/>',
		'ilan'      => '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>',
		'fire'      => '<path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.6.6-3 1.5-4.2.4 1.2 1.2 2 2.2 2.2C10 8 12 6 12 3z"/>',
		'clock'     => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
		'quote'     => '<path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v1a3 3 0 0 1-3 3"/><path d="M20 7h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v1a3 3 0 0 1-3 3"/>',
		'book'      => '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 8h7M8 12h7"/>',
		'sun'       => '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
		'star'      => '<path d="M12 4l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 17.8l.9-5L4.8 9.3l5-.7z"/>',
		'chart'     => '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
		'mosque'    => '<path d="M12 3c3 2.5 4.5 4.6 4.5 6.5H7.5C7.5 7.6 9 5.5 12 3z"/><path d="M5 21v-8a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 13v8z"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/>',
		'tag'       => '<path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
		'share'     => '<circle cx="6" cy="12" r="3"/><circle cx="17" cy="6" r="3"/><circle cx="17" cy="18" r="3"/><path d="M8.7 10.6l5.6-3.2M8.7 13.4l5.6 3.2"/>',
		'play'      => '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/>',
		'expand'    => '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
		'close'     => '<path d="M6 6l12 12M18 6L6 18"/>',
		'left'      => '<path d="M15 5l-7 7 7 7"/>',
		'right'     => '<path d="M9 5l7 7-7 7"/>',
		'flash'     => '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
		'mail'      => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
	);

	return isset( $icons[ $name ] ) ? $icons[ $name ] : $icons['gundem'];
}

/**
 * Return inline SVG icon markup.
 *
 * @param string $name Icon key.
 * @param int    $size Pixel size.
 * @return string
 */
function akishaber_get_icon( $name, $size = 20 ) {
	return sprintf(
		'<svg class="akis-icon akis-icon--%1$s" width="%2$d" height="%2$d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">%3$s</svg>',
		esc_attr( $name ),
		absint( $size ),
		akishaber_icon_path( $name )
	);
}

/**
 * Print an inline SVG icon.
 *
 * @param string $name Icon key.
 * @param int    $size Pixel size.
 */
function akishaber_icon( $name, $size = 20 ) {
	echo akishaber_get_icon( $name, $size ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}

/**
 * Map a category slug to an icon key.
 *
 * @param string $slug Category slug.
 * @return string
 */
function akishaber_icon_for_slug( $slug ) {
	$map = array(
		'gundem'      => 'gundem',
		'son-dakika'  => 'flash',
		'politika'    => 'politika',
		'ekonomi'     => 'ekonomi',
		'spor'        => 'spor',
		'magazin'     => 'magazin',
		'saglik'      => 'saglik',
		'teknoloji'   => 'teknoloji',
		'dunya'       => 'dunya',
		'foto-galeri' => 'foto',
		'video'       => 'video',
		'yazarlar'    => 'yazarlar',
		'ilanlar'     => 'ilan',
	);

	return isset( $map[ $slug ] ) ? $map[ $slug ] : 'gundem';
}

/**
 * Print a section heading with icon, optional archive link and rail controls.
 *
 * @param array $args Heading arguments.
 */
function akishaber_section_head( $args = array() ) {
	$args = wp_parse_args(
		$args,
		array(
			'title'    => '',
			'icon'     => 'gundem',
			'link'     => '',
			'link_text' => __( 'Tümü', 'akishaber' ),
			'rail'     => '',
			'subtitle' => '',
		)
	);
	?>
	<div class="section__head section__head--icon">
		<h2>
			<span class="section__icon"><?php akishaber_icon( $args['icon'], 20 ); ?></span>
			<span class="section__titles">
				<span class="section__title-text"><?php echo esc_html( $args['title'] ); ?></span>
				<?php if ( $args['subtitle'] ) : ?>
					<small><?php echo esc_html( $args['subtitle'] ); ?></small>
				<?php endif; ?>
			</span>
		</h2>
		<div class="section__tools">
			<?php if ( $args['rail'] ) : ?>
				<div class="rail-nav" data-rail-nav="<?php echo esc_attr( $args['rail'] ); ?>">
					<button type="button" class="rail-btn" data-dir="-1" aria-label="<?php esc_attr_e( 'Geri kaydır', 'akishaber' ); ?>"><?php akishaber_icon( 'left', 18 ); ?></button>
					<button type="button" class="rail-btn" data-dir="1" aria-label="<?php esc_attr_e( 'İleri kaydır', 'akishaber' ); ?>"><?php akishaber_icon( 'right', 18 ); ?></button>
				</div>
			<?php endif; ?>
			<?php if ( $args['link'] ) : ?>
				<a class="all-link" href="<?php echo esc_url( $args['link'] ); ?>"><?php echo esc_html( $args['link_text'] ); ?></a>
			<?php endif; ?>
		</div>
	</div>
	<?php
}
