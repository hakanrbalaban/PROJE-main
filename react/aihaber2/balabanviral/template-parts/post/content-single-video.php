<?php
/**
 * Single bv_video content — playable embed.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$post_id     = get_the_ID();
$title       = get_the_title( $post_id );
$archive_url = get_post_type_archive_link( 'bv_video' );
if ( ! $archive_url ) {
	$archive_url = home_url( '/video-galeri/' );
}

$video_url = (string) get_post_meta( $post_id, '_bv_video_url', true );
$embed     = function_exists( 'my_theme_video_embed_url' ) ? my_theme_video_embed_url( $video_url ) : '';
if ( $embed && false === strpos( $embed, 'autoplay=' ) ) {
	$embed .= ( false !== strpos( $embed, '?' ) ? '&' : '?' ) . 'autoplay=1';
}

$poster = get_the_post_thumbnail_url( $post_id, 'large' );
if ( ! $poster && function_exists( 'my_theme_video_poster_url' ) ) {
	$poster = my_theme_video_poster_url( $video_url );
}
if ( ! $poster && function_exists( 'my_theme_get_cover_url' ) ) {
	$poster = my_theme_get_cover_url( $post_id );
}

$related = function_exists( 'my_theme_collect_media_items' ) ? my_theme_collect_media_items( 'video' ) : array();
$related = array_values(
	array_filter(
		$related,
		static function ( $item ) use ( $post_id ) {
			return (string) $post_id !== (string) $item['id'];
		}
	)
);
$related = array_slice( $related, 0, 6 );
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'bv-single-media bv-single-media--video' ); ?>>
	<a href="<?php echo esc_url( $archive_url ); ?>" class="mb-6 inline-block text-sm text-[var(--muted)] hover:text-[var(--hot)]">
		← <?php esc_html_e( 'Video galeriye dön', 'balabanviral' ); ?>
	</a>

	<header class="mb-5">
		<p class="text-xs font-bold uppercase tracking-wider text-[var(--hot)]"><?php esc_html_e( 'Video', 'balabanviral' ); ?></p>
		<h1 class="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight text-[var(--ink)] sm:text-4xl">
			<?php echo esc_html( $title ); ?>
		</h1>
		<p class="mt-3 text-sm text-[var(--muted)]">
			<?php echo esc_html( get_the_date( 'j F Y', $post_id ) ); ?>
		</p>
	</header>

	<div class="bv-single-player">
		<?php if ( $embed ) : ?>
			<iframe
				src="<?php echo esc_url( $embed ); ?>"
				title="<?php echo esc_attr( $title ); ?>"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				loading="eager"
			></iframe>
		<?php elseif ( $poster ) : ?>
			<img src="<?php echo esc_url( $poster ); ?>" alt="<?php echo esc_attr( $title ); ?>" />
			<p class="bv-single-player__empty"><?php esc_html_e( 'Video adresi bulunamadı.', 'balabanviral' ); ?></p>
		<?php else : ?>
			<p class="bv-single-player__empty"><?php esc_html_e( 'Video adresi bulunamadı.', 'balabanviral' ); ?></p>
		<?php endif; ?>
	</div>

	<?php if ( get_the_content() ) : ?>
		<div class="prose-aiora mt-8">
			<?php the_content(); ?>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $related ) ) : ?>
		<section class="mt-10" aria-label="<?php esc_attr_e( 'Diğer videolar', 'balabanviral' ); ?>">
			<h2 class="bv-section-title mb-4 text-xl"><?php esc_html_e( 'Diğer videolar', 'balabanviral' ); ?></h2>
			<div class="bv-media-grid bv-media-grid--video">
				<?php foreach ( $related as $item ) : ?>
					<article class="bv-media-card bv-media-card--video">
						<?php if ( ! empty( $item['embed'] ) ) : ?>
							<button
								type="button"
								class="bv-video-lightbox bv-media-card__media"
								data-lightbox-embed="<?php echo esc_url( $item['embed'] ); ?>"
								data-lightbox-title="<?php echo esc_attr( $item['title'] ); ?>"
								data-lightbox-page="<?php echo esc_url( $item['url'] ); ?>"
							>
								<img src="<?php echo esc_url( $item['src'] ); ?>" alt="" loading="lazy" />
								<span class="bv-media-card__play" aria-hidden="true">▶</span>
							</button>
						<?php else : ?>
							<a href="<?php echo esc_url( $item['url'] ); ?>" class="bv-media-card__media">
								<img src="<?php echo esc_url( $item['src'] ); ?>" alt="" loading="lazy" />
								<span class="bv-media-card__play" aria-hidden="true">▶</span>
							</a>
						<?php endif; ?>
						<div class="bv-media-card__body">
							<h3 class="bv-media-card__title"><a href="<?php echo esc_url( $item['url'] ); ?>"><?php echo esc_html( $item['title'] ); ?></a></h3>
							<p class="bv-media-card__meta"><?php echo esc_html( $item['date'] ); ?></p>
						</div>
					</article>
				<?php endforeach; ?>
			</div>
		</section>
	<?php endif; ?>
</article>
