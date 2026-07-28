<?php
/**
 * Video gallery — featured player + side grid (not a single scroll strip).
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$archive_url = get_post_type_archive_link( 'bv_video' );
if ( ! $archive_url ) {
	$archive_url = home_url( '/video-galeri/' );
}

$videos = array();
if ( function_exists( 'my_theme_collect_media_items' ) ) {
	foreach ( my_theme_collect_media_items( 'video' ) as $row ) {
		$videos[] = array(
			'id'     => $row['id'],
			'title'  => $row['title'],
			'embed'  => $row['embed'],
			'poster' => $row['src'],
			'url'    => $row['url'],
		);
		if ( count( $videos ) >= 7 ) {
			break;
		}
	}
}

if ( empty( $videos ) ) {
	$videos = array(
		array(
			'id'     => 'v1',
			'title'  => __( 'Şehirde sabah yürüyüşü', 'balabanviral' ),
			'embed'  => 'https://www.youtube.com/embed/aqz-KE-bpKQ',
			'poster' => 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
			'url'    => $archive_url,
		),
		array(
			'id'     => 'v2',
			'title'  => __( 'Doğa ve sessizlik', 'balabanviral' ),
			'embed'  => 'https://www.youtube.com/embed/5qap5aO4i9A',
			'poster' => 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
			'url'    => $archive_url,
		),
		array(
			'id'     => 'v3',
			'title'  => __( 'Mutfak ritüeli', 'balabanviral' ),
			'embed'  => 'https://www.youtube.com/embed/jfKfPfyJRdk',
			'poster' => 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
			'url'    => $archive_url,
		),
		array(
			'id'     => 'v4',
			'title'  => __( 'Odak müziği', 'balabanviral' ),
			'embed'  => 'https://www.youtube.com/embed/DWcJFNfaw9c',
			'poster' => 'https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg',
			'url'    => $archive_url,
		),
	);
}

$lead = $videos[0];
$rest = array_slice( $videos, 1 );
?>

<section id="video-galeri" class="magazine-section bv-sec bv-sec--video mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-8 md:px-6">
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)] sm:text-2xl">
				▶️ <?php esc_html_e( 'Video galeri', 'balabanviral' ); ?>
			</h2>
			<p class="mt-1 text-sm text-[var(--muted)]"><?php esc_html_e( 'Öne çıkan + ızgara · popup veya sayfa', 'balabanviral' ); ?></p>
		</div>
		<a href="<?php echo esc_url( $archive_url ); ?>" class="magazine-more-link"><?php esc_html_e( 'Tüm videolar', 'balabanviral' ); ?> →</a>
	</div>

	<div class="bv-grid bv-grid--video-stage">
		<article class="bv-video-lead">
			<button
				type="button"
				class="bv-video-lightbox bv-video-lead__play"
				data-lightbox-embed="<?php echo esc_url( $lead['embed'] ); ?>"
				data-lightbox-title="<?php echo esc_attr( $lead['title'] ); ?>"
				data-lightbox-page="<?php echo esc_url( $lead['url'] ); ?>"
			>
				<img src="<?php echo esc_url( $lead['poster'] ); ?>" alt="" loading="eager" />
				<span class="bv-video-lead__btn" aria-hidden="true">▶</span>
			</button>
			<div class="bv-video-lead__meta">
				<h3><a href="<?php echo esc_url( $lead['url'] ); ?>"><?php echo esc_html( $lead['title'] ); ?></a></h3>
				<a href="<?php echo esc_url( $lead['url'] ); ?>" class="mag-block__more"><?php esc_html_e( 'Sayfada aç', 'balabanviral' ); ?> →</a>
			</div>
		</article>

		<div class="bv-video-tiles">
			<?php foreach ( $rest as $v ) : ?>
				<article class="bv-video-tile">
					<button
						type="button"
						class="bv-video-lightbox bv-video-tile__media"
						data-lightbox-embed="<?php echo esc_url( $v['embed'] ); ?>"
						data-lightbox-title="<?php echo esc_attr( $v['title'] ); ?>"
						data-lightbox-page="<?php echo esc_url( $v['url'] ); ?>"
					>
						<img src="<?php echo esc_url( $v['poster'] ); ?>" alt="" loading="lazy" />
						<span aria-hidden="true">▶</span>
					</button>
					<a href="<?php echo esc_url( $v['url'] ); ?>" class="bv-video-tile__title"><?php echo esc_html( $v['title'] ); ?></a>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
