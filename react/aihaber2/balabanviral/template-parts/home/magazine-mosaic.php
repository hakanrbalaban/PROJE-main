<?php
/**
 * Top magazine mosaic: 1 hero + 4 side stories.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$q = new WP_Query(
	array(
		'posts_per_page'      => 5,
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
		'orderby'             => 'date',
		'order'               => 'DESC',
	)
);

if ( empty( $q->posts ) ) {
	return;
}

$items    = array_values( $q->posts );
$featured = $items[0];
$rest     = array_slice( $items, 1 );
$cover    = static function ( $post_id ) {
	return function_exists( 'my_theme_get_cover_url' )
		? my_theme_get_cover_url( $post_id )
		: my_theme_get_fallback_image( $post_id );
};
?>

<section id="one-cikan" class="magazine-section mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-10 md:px-6">
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-[family-name:var(--font-display)] text-xl font-bold text-white sm:text-2xl">
				📰 <?php esc_html_e( 'Öne çıkanlar', 'balabanviral' ); ?>
			</h2>
			<p class="mt-1 text-sm text-[var(--muted)]"><?php esc_html_e( 'Manşet altı seçki — magazin grid', 'balabanviral' ); ?></p>
		</div>
		<a href="#yazilar" class="magazine-more-link"><?php esc_html_e( 'Tümünü gör', 'balabanviral' ); ?> →</a>
	</div>

	<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
		<?php
		$fid    = (int) $featured->ID;
		$fthumb = $cover( $fid );
		$fcats  = get_the_category( $fid );
		?>
		<article class="group relative min-h-[300px] overflow-hidden rounded-[4px] border-2 border-[var(--line)] md:col-span-2 md:row-span-2 lg:min-h-[420px]">
			<a href="<?php echo esc_url( get_permalink( $fid ) ); ?>" class="absolute inset-0 block">
				<img src="<?php echo esc_url( $fthumb ); ?>" alt="" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
				<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
				<div class="absolute inset-x-0 bottom-0 p-5 sm:p-7">
					<?php if ( ! empty( $fcats ) ) : ?>
						<span class="mb-2 inline-block rounded-[3px] bg-[rgba(0,229,192,0.25)] px-3 py-1 text-xs font-bold text-[var(--cyan)]">
							<?php echo esc_html( $fcats[0]->name ); ?>
						</span>
					<?php endif; ?>
					<h3 class="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-white sm:text-3xl">
						<?php echo esc_html( get_the_title( $fid ) ); ?>
					</h3>
					<p class="mt-2 line-clamp-2 max-w-xl text-sm text-white/80"><?php echo esc_html( get_the_excerpt( $fid ) ); ?></p>
					<span class="mt-3 inline-flex text-sm font-bold text-[var(--hot-2)]"><?php esc_html_e( 'Tümünü oku →', 'balabanviral' ); ?></span>
				</div>
			</a>
		</article>

		<?php foreach ( $rest as $p ) : ?>
			<?php
			$pid   = (int) $p->ID;
			$thumb = $cover( $pid );
			$pcats = get_the_category( $pid );
			?>
			<article class="group relative min-h-[180px] overflow-hidden rounded-[4px] border-2 border-[var(--line)]">
				<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>" class="absolute inset-0 block">
					<img src="<?php echo esc_url( $thumb ); ?>" alt="" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
					<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
					<div class="absolute inset-x-0 bottom-0 p-3.5">
						<?php if ( ! empty( $pcats ) ) : ?>
							<span class="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--cyan)]"><?php echo esc_html( $pcats[0]->name ); ?></span>
						<?php endif; ?>
						<h3 class="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-bold leading-snug text-white">
							<?php echo esc_html( get_the_title( $pid ) ); ?>
						</h3>
					</div>
				</a>
			</article>
		<?php endforeach; ?>
	</div>
</section>
