<?php
/**
 * Post section with selectable grid layouts (not only 1-row rail).
 *
 * @package BalabanViral
 *
 * @var array $args
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$args = wp_parse_args(
	isset( $args ) && is_array( $args ) ? $args : array(),
	array(
		'rail_id'         => '',
		'rail_title'      => '',
		'rail_emoji'      => '✨',
		'rail_subtitle'   => '',
		'rail_query'      => null,
		'rail_more_url'   => '',
		'rail_more_label' => __( 'Tümünü gör', 'balabanviral' ),
		'rail_layout'     => 'strip', // strip | viral | mosaic | stack
	)
);

$rail_query = $args['rail_query'];
if ( ! ( $rail_query instanceof WP_Query ) || empty( $rail_query->posts ) ) {
	return;
}

$items       = array_values( $rail_query->posts );
$rail_dom_id = $args['rail_id'] ? $args['rail_id'] : 'rail-' . uniqid();
$layout      = in_array( $args['rail_layout'], array( 'strip', 'viral', 'mosaic', 'stack' ), true )
	? $args['rail_layout']
	: 'strip';
$cover       = static function ( $post_id ) {
	return function_exists( 'my_theme_get_cover_url' )
		? my_theme_get_cover_url( $post_id )
		: my_theme_get_fallback_image( $post_id );
};
?>

<section id="<?php echo esc_attr( $rail_dom_id ); ?>" class="magazine-section bv-sec bv-sec--<?php echo esc_attr( $layout ); ?> mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-8 md:px-6 first:pt-10" data-rail>
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div class="min-w-0 flex-1">
			<h2 class="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)] sm:text-2xl">
				<span class="mr-1" aria-hidden="true"><?php echo esc_html( $args['rail_emoji'] ); ?></span><?php echo esc_html( $args['rail_title'] ); ?>
			</h2>
			<?php if ( ! empty( $args['rail_subtitle'] ) ) : ?>
				<p class="mt-1 text-sm text-[var(--muted)]"><?php echo esc_html( $args['rail_subtitle'] ); ?></p>
			<?php endif; ?>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			<?php if ( ! empty( $args['rail_more_url'] ) ) : ?>
				<a href="<?php echo esc_url( $args['rail_more_url'] ); ?>" class="magazine-more-link">
					<?php echo esc_html( $args['rail_more_label'] ); ?> →
				</a>
			<?php endif; ?>
			<?php if ( 'strip' === $layout ) : ?>
				<button type="button" class="rail-scroll-btn" data-rail-scroll="-1" data-rail-target="<?php echo esc_attr( $rail_dom_id ); ?>" aria-label="<?php esc_attr_e( 'Sola kaydır', 'balabanviral' ); ?>">←</button>
				<button type="button" class="rail-scroll-btn" data-rail-scroll="1" data-rail-target="<?php echo esc_attr( $rail_dom_id ); ?>" aria-label="<?php esc_attr_e( 'Sağa kaydır', 'balabanviral' ); ?>">→</button>
			<?php endif; ?>
		</div>
	</div>

	<?php if ( 'viral' === $layout ) : ?>
		<?php
		$featured = $items[0];
		$rest     = array_slice( $items, 1, 5 );
		$fid      = (int) $featured->ID;
		?>
		<div class="bv-grid bv-grid--viral">
			<article class="bv-viral-hero">
				<div class="bv-viral-hero__stage">
					<a href="<?php echo esc_url( get_permalink( $fid ) ); ?>">
						<img src="<?php echo esc_url( $cover( $fid ) ); ?>" alt="" loading="eager" />
						<div class="bv-viral-hero__veil"></div>
						<?php my_theme_react_bar( $fid ); ?>
						<div class="bv-viral-hero__txt">
							<span class="mag-tag mag-tag--overlay"><?php esc_html_e( 'Viral', 'balabanviral' ); ?></span>
							<h3><?php echo esc_html( get_the_title( $fid ) ); ?></h3>
							<p><?php echo esc_html( wp_trim_words( get_the_excerpt( $fid ), 20 ) ); ?></p>
							<span class="bv-viral-hero__meta">👁 <?php echo esc_html( (string) my_theme_get_post_views( $fid ) ); ?> · ⏱ <?php echo esc_html( (string) my_theme_estimate_reading_time( $fid ) ); ?> <?php esc_html_e( 'dk', 'balabanviral' ); ?></span>
						</div>
					</a>
				</div>
			</article>
			<ol class="bv-viral-list">
				<?php foreach ( $rest as $idx => $p ) : ?>
					<?php $pid = (int) $p->ID; ?>
					<li>
						<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
							<em><?php echo esc_html( str_pad( (string) ( $idx + 2 ), 2, '0', STR_PAD_LEFT ) ); ?></em>
							<img src="<?php echo esc_url( $cover( $pid ) ); ?>" alt="" loading="lazy" />
							<span>
								<strong><?php echo esc_html( get_the_title( $pid ) ); ?></strong>
								<small>👁 <?php echo esc_html( (string) my_theme_get_post_views( $pid ) ); ?></small>
							</span>
						</a>
					</li>
				<?php endforeach; ?>
			</ol>
		</div>

	<?php elseif ( 'mosaic' === $layout ) : ?>
		<div class="bv-grid bv-grid--mosaic">
			<?php foreach ( array_slice( $items, 0, 6 ) as $idx => $p ) : ?>
				<?php
				$pid = (int) $p->ID;
				$cls = 0 === $idx ? 'bv-mosaic__big' : ( $idx < 3 ? 'bv-mosaic__mid' : 'bv-mosaic__sm' );
				?>
				<article class="<?php echo esc_attr( $cls ); ?>">
					<div class="bv-mosaic__stage">
						<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
							<img src="<?php echo esc_url( $cover( $pid ) ); ?>" alt="" loading="<?php echo 0 === $idx ? 'eager' : 'lazy'; ?>" />
							<?php if ( $idx < 3 ) : ?>
								<?php my_theme_react_bar( $pid ); ?>
							<?php endif; ?>
							<div class="bv-mosaic__txt">
								<?php if ( 0 === $idx ) : ?>
									<span class="mag-tag mag-tag--overlay"><?php esc_html_e( 'Popüler', 'balabanviral' ); ?></span>
								<?php endif; ?>
								<h3><?php echo esc_html( get_the_title( $pid ) ); ?></h3>
								<small>👁 <?php echo esc_html( (string) my_theme_get_post_views( $pid ) ); ?></small>
							</div>
						</a>
					</div>
				</article>
			<?php endforeach; ?>
		</div>

	<?php elseif ( 'stack' === $layout ) : ?>
		<div class="bv-grid bv-grid--stack">
			<?php foreach ( array_slice( $items, 0, 6 ) as $idx => $p ) : ?>
				<?php
				$pid  = (int) $p->ID;
				$cats = get_the_category( $pid );
				?>
				<article class="bv-stack-card<?php echo ( $idx % 2 ) ? ' bv-stack-card--flip' : ''; ?>">
					<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
						<img src="<?php echo esc_url( $cover( $pid ) ); ?>" alt="" loading="lazy" />
						<div>
							<?php if ( ! empty( $cats ) ) : ?>
								<span class="mag-tag mag-tag--text"><?php echo esc_html( $cats[0]->name ); ?></span>
							<?php endif; ?>
							<h3><?php echo esc_html( get_the_title( $pid ) ); ?></h3>
							<p><?php echo esc_html( wp_trim_words( get_the_excerpt( $pid ), 14 ) ); ?></p>
							<small><?php echo esc_html( get_the_date( 'j M Y', $pid ) ); ?> · ⏱ <?php echo esc_html( (string) my_theme_estimate_reading_time( $pid ) ); ?> <?php esc_html_e( 'dk', 'balabanviral' ); ?></small>
						</div>
					</a>
				</article>
			<?php endforeach; ?>
		</div>

	<?php else : /* strip — küçük kart, react yok */ ?>
		<div class="rail-track hide-scrollbar flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
			<?php foreach ( $items as $post_obj ) : ?>
				<?php
				$pid   = (int) $post_obj->ID;
				$thumb = $cover( $pid );
				$cats  = get_the_category( $pid );
				?>
				<article class="magazine-card-sm min-w-[220px] max-w-[240px] snap-start overflow-hidden rounded-[4px] border border-[var(--line)] bg-[var(--panel)] transition hover:border-[var(--hot)]/50">
					<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>" class="block">
						<div class="relative aspect-[16/10] overflow-hidden">
							<img src="<?php echo esc_url( $thumb ); ?>" alt="" class="h-full w-full object-cover" loading="lazy" />
							<?php if ( ! empty( $cats ) ) : ?>
								<span class="absolute left-2 bottom-2 rounded-[3px] bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-[var(--cyan)]">
									<?php echo esc_html( $cats[0]->name ); ?>
								</span>
							<?php endif; ?>
						</div>
						<div class="p-3">
							<h3 class="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-bold leading-snug text-[var(--ink)]">
								<?php echo esc_html( get_the_title( $pid ) ); ?>
							</h3>
							<p class="mt-1 text-[10px] text-[var(--muted)]">
								👁 <?php echo esc_html( (string) my_theme_get_post_views( $pid ) ); ?> · ⏱️ <?php echo esc_html( (string) my_theme_estimate_reading_time( $pid ) ); ?> dk
							</p>
						</div>
					</a>
				</article>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</section>
