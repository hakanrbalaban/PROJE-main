<?php
/**
 * Headline slider with side headline list (classic news portal manşet).
 *
 * @package AkisHaber
 */

$sticky     = get_option( 'sticky_posts' );
$hero_query = null;

if ( ! empty( $sticky ) ) {
	$hero_query = new WP_Query(
		array(
			'posts_per_page'      => 5,
			'post__in'            => array_slice( (array) $sticky, 0, 5 ),
			'orderby'             => 'post__in',
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
		)
	);
}

if ( ! $hero_query || ! $hero_query->have_posts() ) {
	$hero_query = akishaber_latest( 5 );
}

$slides = akishaber_fill_posts( $hero_query, 5 );
if ( ! $slides ) {
	return;
}

$side_query = akishaber_latest(
	5,
	array( 'post__not_in' => wp_list_pluck( $slides, 'ID' ) )
);
$side_posts = $side_query->have_posts() ? $side_query->posts : array();
?>
<section class="manset container" aria-label="<?php esc_attr_e( 'Manşet haberler', 'akishaber' ); ?>">
	<div class="manset__layout">
		<div class="mslider" data-slider data-autoplay="6000">
			<div class="mslider__viewport" data-slider-viewport>
				<?php
				foreach ( $slides as $index => $post ) :
					setup_postdata( $post );
					?>
					<article <?php post_class( 'mslide' . ( 0 === $index ? ' is-active' : '' ), $post ); ?> data-slide="<?php echo esc_attr( (string) $index ); ?>" <?php echo 0 === $index ? '' : 'aria-hidden="true"'; ?>>
						<a class="mslide__media" href="<?php the_permalink(); ?>" tabindex="<?php echo 0 === $index ? '0' : '-1'; ?>">
							<?php akishaber_the_thumb( 'akishaber-hero', null, 0 === $index ? array( 'loading' => 'eager' ) : array() ); ?>
						</a>
						<div class="mslide__body">
							<div class="mslide__tags">
								<span class="live-badge"><?php esc_html_e( 'MANŞET', 'akishaber' ); ?></span>
								<?php akishaber_the_category_badge(); ?>
							</div>
							<h2 class="mslide__title"><a href="<?php the_permalink(); ?>" tabindex="<?php echo 0 === $index ? '0' : '-1'; ?>"><?php the_title(); ?></a></h2>
							<p class="mslide__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 20 ) ); ?></p>
							<div class="mslide__meta">
								<span><?php akishaber_icon( 'clock', 14 ); ?><?php echo esc_html( akishaber_time_ago() ); ?></span>
								<span><?php akishaber_icon( 'book', 14 ); ?><?php echo esc_html( akishaber_reading_time() ); ?></span>
							</div>
						</div>
					</article>
					<?php
				endforeach;
				wp_reset_postdata();
				?>
			</div>

			<button type="button" class="mslider__arrow mslider__arrow--prev" data-slider-prev aria-label="<?php esc_attr_e( 'Önceki manşet', 'akishaber' ); ?>">
				<?php akishaber_icon( 'left', 22 ); ?>
			</button>
			<button type="button" class="mslider__arrow mslider__arrow--next" data-slider-next aria-label="<?php esc_attr_e( 'Sonraki manşet', 'akishaber' ); ?>">
				<?php akishaber_icon( 'right', 22 ); ?>
			</button>

			<div class="mslider__bar"><span data-slider-progress></span></div>

			<div class="mslider__dots" data-slider-dots role="tablist" aria-label="<?php esc_attr_e( 'Manşet seçimi', 'akishaber' ); ?>">
				<?php foreach ( $slides as $index => $post ) : ?>
					<button
						type="button"
						role="tab"
						class="<?php echo 0 === $index ? 'is-active' : ''; ?>"
						data-slider-dot="<?php echo esc_attr( (string) $index ); ?>"
						aria-selected="<?php echo 0 === $index ? 'true' : 'false'; ?>"
						aria-label="<?php echo esc_attr( sprintf( /* translators: %d: slide number. */ __( '%d. manşet', 'akishaber' ), $index + 1 ) ); ?>"
					></button>
				<?php endforeach; ?>
			</div>
		</div>

		<aside class="manset__side" aria-label="<?php esc_attr_e( 'Manşet listesi', 'akishaber' ); ?>">
			<div class="manset__side-head">
				<?php akishaber_icon( 'flash', 18 ); ?>
				<span><?php esc_html_e( 'Öne Çıkanlar', 'akishaber' ); ?></span>
			</div>
			<ol class="manset__side-list">
				<?php
				foreach ( $slides as $index => $post ) :
					setup_postdata( $post );
					?>
					<li>
						<button type="button" class="manset__side-item<?php echo 0 === $index ? ' is-active' : ''; ?>" data-slider-jump="<?php echo esc_attr( (string) $index ); ?>">
							<span class="manset__side-thumb"><?php akishaber_the_thumb( 'akishaber-thumb' ); ?></span>
							<span class="manset__side-text">
								<em><?php echo esc_html( str_pad( (string) ( $index + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></em>
								<strong><?php the_title(); ?></strong>
							</span>
						</button>
					</li>
					<?php
				endforeach;
				wp_reset_postdata();
				?>
			</ol>
		</aside>
	</div>

	<?php if ( $side_posts ) : ?>
		<div class="manset__strip">
			<?php
			foreach ( $side_posts as $post ) :
				setup_postdata( $post );
				?>
				<article <?php post_class( 'manset__card', $post ); ?>>
					<a href="<?php the_permalink(); ?>">
						<span class="manset__card-media"><?php akishaber_the_thumb( 'akishaber-card' ); ?></span>
						<span class="manset__card-body">
							<?php akishaber_the_category_badge( null, false ); ?>
							<strong><?php the_title(); ?></strong>
							<time><?php akishaber_icon( 'clock', 12 ); ?><?php echo esc_html( akishaber_time_ago() ); ?></time>
						</span>
					</a>
				</article>
				<?php
			endforeach;
			wp_reset_postdata();
			?>
		</div>
	<?php endif; ?>
</section>
