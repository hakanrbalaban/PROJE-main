<?php
/**
 * Professional 2-column manşet: main fade slider + side vertical news slider.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$q = new WP_Query(
	array(
		'posts_per_page'      => 8,
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
		'orderby'             => 'date',
		'order'               => 'DESC',
	)
);

$posts = ! empty( $q->posts ) ? array_values( $q->posts ) : array();
if ( function_exists( 'my_theme_merge_feature_posts' ) ) {
	$posts = my_theme_merge_feature_posts( $posts, 'manset', 8 );
	$side_src = my_theme_merge_feature_posts( $posts, 'one_cikan', 8 );
} else {
	$side_src = $posts;
}

if ( empty( $posts ) ) {
	return;
}

$main = array_slice( $posts, 0, 5 );
$side = count( $side_src ) > 1 ? array_slice( $side_src, 0, 6 ) : array_slice( $posts, 0, 6 );
if ( count( $side_src ) > 5 ) {
	$side = array_slice( $side_src, 0, 6 );
}

$cover = static function ( $post_id ) {
	return function_exists( 'my_theme_get_cover_url' )
		? my_theme_get_cover_url( $post_id )
		: my_theme_get_fallback_image( $post_id );
};
?>

<section id="one-cikan" class="bv-manset" aria-label="<?php esc_attr_e( 'Manşet', 'balabanviral' ); ?>">
	<div class="bv-manset__grid">
		<!-- LEFT: primary fading slider -->
		<div class="bv-manset__main" data-manset-main>
			<?php foreach ( $main as $i => $p ) : ?>
				<?php
				$pid  = (int) $p->ID;
				$cats = get_the_category( $pid );
				?>
				<article class="bv-manset-slide<?php echo 0 === $i ? ' is-active' : ''; ?>" data-manset-slide="<?php echo esc_attr( (string) $i ); ?>">
					<img class="bv-manset-slide__img" src="<?php echo esc_url( $cover( $pid ) ); ?>" alt="" loading="<?php echo 0 === $i ? 'eager' : 'lazy'; ?>" />
					<?php my_theme_react_bar( $pid ); ?>
					<div class="bv-manset-slide__veil"></div>
					<div class="bv-manset-slide__body">
						<div class="bv-manset-slide__meta">
							<span class="viral-badge">🔥 <?php esc_html_e( 'MANŞET', 'balabanviral' ); ?></span>
							<?php if ( ! empty( $cats ) ) : ?>
								<span class="bv-manset-chip"><?php echo esc_html( $cats[0]->name ); ?></span>
							<?php endif; ?>
							<span class="bv-manset-meta">
								👁 <?php echo esc_html( (string) my_theme_get_post_views( $pid ) ); ?>
								· ⏱️ <?php echo esc_html( (string) my_theme_estimate_reading_time( $pid ) ); ?> dk
							</span>
						</div>
						<h2 class="bv-manset-slide__title">
							<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>"><?php echo esc_html( get_the_title( $pid ) ); ?></a>
						</h2>
						<p class="bv-manset-slide__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt( $pid ), 28 ) ); ?></p>
						<div class="bv-manset-slide__actions">
							<a class="bv-btn bv-btn--primary" href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
								<?php esc_html_e( 'Haberi oku', 'balabanviral' ); ?> →
							</a>
							<a class="bv-btn bv-btn--ghost" href="#yazilar">
								<?php esc_html_e( 'Tüm yazılar', 'balabanviral' ); ?>
							</a>
							<?php if ( ! empty( $cats ) ) : ?>
								<a class="bv-btn bv-btn--soft" href="<?php echo esc_url( get_category_link( $cats[0]->term_id ) ); ?>">
									<?php echo esc_html( $cats[0]->name ); ?>
								</a>
							<?php endif; ?>
						</div>
					</div>
				</article>
			<?php endforeach; ?>

			<div class="bv-manset__controls">
				<button type="button" class="bv-manset-nav" data-manset-prev aria-label="<?php esc_attr_e( 'Önceki manşet', 'balabanviral' ); ?>">←</button>
				<div class="bv-manset-dots" role="tablist">
					<?php foreach ( $main as $i => $p ) : ?>
						<button
							type="button"
							class="bv-manset-dot<?php echo 0 === $i ? ' is-active' : ''; ?>"
							data-manset-goto="<?php echo esc_attr( (string) $i ); ?>"
							aria-label="<?php echo esc_attr( sprintf( /* translators: %d slide */ __( 'Manşet %d', 'balabanviral' ), $i + 1 ) ); ?>"
						></button>
					<?php endforeach; ?>
				</div>
				<button type="button" class="bv-manset-nav" data-manset-next aria-label="<?php esc_attr_e( 'Sonraki manşet', 'balabanviral' ); ?>">→</button>
			</div>
		</div>

		<!-- RIGHT: vertical news list (independent auto-slider) -->
		<div class="bv-manset__side" data-manset-side>
			<div class="bv-manset__side-head">
				<span><?php esc_html_e( 'Öne çıkanlar', 'balabanviral' ); ?></span>
				<div class="bv-manset__side-nav">
					<button type="button" data-side-prev aria-label="<?php esc_attr_e( 'Önceki', 'balabanviral' ); ?>">↑</button>
					<button type="button" data-side-next aria-label="<?php esc_attr_e( 'Sonraki', 'balabanviral' ); ?>">↓</button>
				</div>
			</div>
			<div class="bv-manset__side-viewport">
				<div class="bv-manset__side-track" data-side-track>
					<?php foreach ( $side as $i => $p ) : ?>
						<?php
						$pid  = (int) $p->ID;
						$cats = get_the_category( $pid );
						?>
						<article class="bv-manset-side-card<?php echo 0 === $i ? ' is-active' : ''; ?>" data-side-index="<?php echo esc_attr( (string) $i ); ?>">
							<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>" class="bv-manset-side-card__link">
								<img src="<?php echo esc_url( $cover( $pid ) ); ?>" alt="" loading="lazy" />
								<div class="bv-manset-side-card__txt">
									<?php if ( ! empty( $cats ) ) : ?>
										<em><?php echo esc_html( $cats[0]->name ); ?></em>
									<?php endif; ?>
									<strong><?php echo esc_html( get_the_title( $pid ) ); ?></strong>
									<span><?php echo esc_html( get_the_date( 'j M Y', $pid ) ); ?> · 👁 <?php echo esc_html( (string) my_theme_get_post_views( $pid ) ); ?></span>
								</div>
							</a>
						</article>
					<?php endforeach; ?>
				</div>
			</div>
			<a class="bv-manset__side-more" href="#yazilar"><?php esc_html_e( 'Daha fazla haber →', 'balabanviral' ); ?></a>
		</div>
	</div>
</section>
