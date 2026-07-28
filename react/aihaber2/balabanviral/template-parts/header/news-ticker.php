<?php
/**
 * Breaking news ticker (top of site).
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$ticker_label = get_theme_mod( 'my_theme_ticker_label', __( 'SON DAKİKA', 'balabanviral' ) );

$ticker_q = new WP_Query(
	array(
		'posts_per_page'      => 10,
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
		'orderby'             => 'date',
		'order'               => 'DESC',
	)
);

$items = ! empty( $ticker_q->posts ) ? array_values( $ticker_q->posts ) : array();
if ( function_exists( 'my_theme_merge_feature_posts' ) ) {
	$items = my_theme_merge_feature_posts( $items, 'ticker', 10 );
}

if ( empty( $items ) ) {
	return;
}
?>

<div class="bv-ticker" role="region" aria-label="<?php esc_attr_e( 'Son dakika şeridi', 'balabanviral' ); ?>">
	<div class="bv-ticker__inner">
		<span class="bv-ticker__badge"><?php echo esc_html( $ticker_label ); ?></span>
		<div class="bv-ticker__viewport">
			<div class="bv-ticker__track">
				<?php foreach ( array_merge( $items, $items ) as $p ) : ?>
					<?php $pid = (int) $p->ID; ?>
					<a class="bv-ticker__item" href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
						<span class="bv-ticker__dot" aria-hidden="true"></span>
						<?php echo esc_html( get_the_title( $pid ) ); ?>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
		<div class="bv-ticker__actions">
			<button type="button" class="bv-theme-switch" id="bv-theme-toggle" aria-label="<?php esc_attr_e( 'Light / Dark tema değiştir', 'balabanviral' ); ?>">
				<span class="bv-theme-switch__opt" data-mode="light">☀️ Light</span>
				<span class="bv-theme-switch__opt" data-mode="dark">🌙 Dark</span>
				<span class="bv-theme-switch__knob" aria-hidden="true"></span>
			</button>
		</div>
	</div>
</div>
