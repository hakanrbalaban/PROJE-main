<?php
/**
 * Photo gallery — bento mosaic grid (not a single scroll strip).
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$items = array();
if ( function_exists( 'my_theme_collect_media_items' ) ) {
	foreach ( my_theme_collect_media_items( 'photo' ) as $row ) {
		$items[] = array(
			'id'    => $row['id'],
			'src'   => $row['src'],
			'title' => $row['title'],
			'url'   => $row['url'],
		);
		if ( count( $items ) >= 9 ) {
			break;
		}
	}
} else {
	$photo_q = new WP_Query(
		array(
			'post_type'           => 'bv_photo',
			'posts_per_page'      => 9,
			'orderby'             => 'date',
			'order'               => 'DESC',
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
		)
	);
	if ( ! empty( $photo_q->posts ) ) {
		foreach ( $photo_q->posts as $p ) {
			$pid     = (int) $p->ID;
			$items[] = array(
				'id'    => (string) $pid,
				'src'   => function_exists( 'my_theme_get_cover_url' ) ? my_theme_get_cover_url( $pid ) : my_theme_get_fallback_image( $pid ),
				'title' => get_the_title( $pid ),
				'url'   => get_permalink( $pid ),
			);
		}
	}
}

$archive_url = get_post_type_archive_link( 'bv_photo' );
if ( ! $archive_url ) {
	$archive_url = home_url( '/foto-galeri/' );
}

if ( empty( $items ) && get_theme_mod( 'my_theme_allow_remote_demo_images', false ) ) {
	foreach ( my_theme_unsplash_gallery( 9, 'foto' ) as $g ) {
		$items[] = array(
			'id'    => $g['id'],
			'src'   => $g['src'],
			'title' => $g['title'],
			'url'   => $archive_url,
		);
	}
}

if ( empty( $items ) ) {
	return;
}

$sizes = array( 'big', 'tall', 'wide', 'sq', 'sq', 'tall', 'sq', 'wide', 'sq' );
?>

<section id="foto-galeri" class="magazine-section bv-sec bv-sec--photo mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-10 md:px-6">
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)] sm:text-2xl">
				📷 <?php esc_html_e( 'Foto galeri', 'balabanviral' ); ?>
			</h2>
			<p class="mt-1 text-sm text-[var(--muted)]"><?php esc_html_e( 'Mozaik ızgara · tıkla · büyüt', 'balabanviral' ); ?></p>
		</div>
		<a href="<?php echo esc_url( $archive_url ); ?>" class="magazine-more-link"><?php esc_html_e( 'Tüm fotoğraflar', 'balabanviral' ); ?> →</a>
	</div>

	<div class="bv-grid bv-grid--photo-bento">
		<?php foreach ( $items as $i => $item ) : ?>
			<?php $size = isset( $sizes[ $i ] ) ? $sizes[ $i ] : 'sq'; ?>
			<figure class="bv-bento bv-bento--<?php echo esc_attr( $size ); ?>">
				<a
					href="<?php echo esc_url( $item['url'] ); ?>"
					class="bv-lightbox-trigger bv-bento__link"
					data-lightbox-src="<?php echo esc_url( $item['src'] ); ?>"
					data-lightbox-title="<?php echo esc_attr( $item['title'] ); ?>"
					data-lightbox-page="<?php echo esc_url( $item['url'] ); ?>"
				>
					<img src="<?php echo esc_url( $item['src'] ); ?>" alt="<?php echo esc_attr( $item['title'] ); ?>" loading="<?php echo 0 === $i ? 'eager' : 'lazy'; ?>" />
					<figcaption>
						<span><?php echo esc_html( $item['title'] ); ?></span>
					</figcaption>
				</a>
			</figure>
		<?php endforeach; ?>
	</div>
</section>
