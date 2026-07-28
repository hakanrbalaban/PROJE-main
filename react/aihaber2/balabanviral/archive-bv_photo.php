<?php
/**
 * Photo gallery archive — slideshow + grid + widgets.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$items = function_exists( 'my_theme_collect_media_items' ) ? my_theme_collect_media_items( 'photo' ) : array();
?>

<main id="primary" class="site-main">
	<div class="mx-auto max-w-[1280px] px-4 pt-8 md:px-6">
		<header class="mb-6 border-b-2 border-[var(--cyan)] pb-4">
			<div class="flex flex-wrap items-end justify-between gap-3">
				<div class="flex items-center gap-3">
					<span class="grid h-12 w-12 place-items-center text-2xl" style="border-radius: var(--radius); background: color-mix(in srgb, var(--cyan) 16%, var(--panel)); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--cyan) 55%, transparent)">📷</span>
					<div>
						<h1 class="bv-archive-title text-2xl sm:text-3xl"><?php post_type_archive_title(); ?></h1>
						<p class="bv-section-sub">
							<?php
							printf(
								/* translators: %d count */
								esc_html__( '%d foto · slayt veya ızgara', 'balabanviral' ),
								count( $items )
							);
							?>
						</p>
					</div>
				</div>
				<a href="<?php echo esc_url( home_url( '/#foto-galeri' ) ); ?>" class="magazine-more-link"><?php esc_html_e( 'Ana sayfa', 'balabanviral' ); ?> →</a>
			</div>
		</header>
	</div>

	<div class="mx-auto grid max-w-[1280px] gap-8 px-4 pb-12 lg:grid-cols-[minmax(0,1fr)_300px] md:px-6">
		<div class="min-w-0">
			<?php if ( ! empty( $items ) ) : ?>
				<section class="bv-media-slideshow" data-media-slideshow data-mode="photo" aria-label="<?php esc_attr_e( 'Foto slayt', 'balabanviral' ); ?>">
					<div class="bv-media-slideshow__stage">
						<?php foreach ( $items as $i => $item ) : ?>
							<article class="bv-media-slide<?php echo 0 === $i ? ' is-active' : ''; ?>" data-slide-index="<?php echo esc_attr( (string) $i ); ?>" data-src="<?php echo esc_url( $item['src'] ); ?>" data-page="<?php echo esc_url( $item['url'] ); ?>" data-title="<?php echo esc_attr( $item['title'] ); ?>">
								<a
									href="<?php echo esc_url( $item['url'] ); ?>"
									class="bv-lightbox-trigger bv-media-slide__media"
									data-lightbox-src="<?php echo esc_url( $item['src'] ); ?>"
									data-lightbox-title="<?php echo esc_attr( $item['title'] ); ?>"
									data-lightbox-page="<?php echo esc_url( $item['url'] ); ?>"
								>
									<img src="<?php echo esc_url( $item['src'] ); ?>" alt="<?php echo esc_attr( $item['title'] ); ?>" loading="<?php echo 0 === $i ? 'eager' : 'lazy'; ?>" />
								</a>
								<div class="bv-media-slide__caption">
									<strong><?php echo esc_html( $item['title'] ); ?></strong>
									<span><?php echo esc_html( $item['date'] ); ?> · <?php echo esc_html( (string) ( $i + 1 ) ); ?>/<?php echo esc_html( (string) count( $items ) ); ?></span>
								</div>
							</article>
						<?php endforeach; ?>

						<button type="button" class="bv-media-slideshow__nav bv-media-slideshow__nav--prev" data-slide-prev aria-label="<?php esc_attr_e( 'Önceki', 'balabanviral' ); ?>">← <?php esc_html_e( 'Önceki', 'balabanviral' ); ?></button>
						<button type="button" class="bv-media-slideshow__nav bv-media-slideshow__nav--next" data-slide-next aria-label="<?php esc_attr_e( 'Sonraki', 'balabanviral' ); ?>"><?php esc_html_e( 'Sonraki', 'balabanviral' ); ?> →</button>
					</div>
					<div class="bv-media-slideshow__dots" role="tablist">
						<?php foreach ( $items as $i => $item ) : ?>
							<button type="button" class="bv-media-slideshow__dot<?php echo 0 === $i ? ' is-active' : ''; ?>" data-slide-goto="<?php echo esc_attr( (string) $i ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Slayt %d', 'balabanviral' ), $i + 1 ) ); ?>"></button>
						<?php endforeach; ?>
					</div>
				</section>

				<h2 class="bv-section-title mt-8 mb-4 text-xl"><?php esc_html_e( 'Tüm fotoğraflar', 'balabanviral' ); ?></h2>
				<div class="bv-media-grid bv-media-grid--photo">
					<?php foreach ( $items as $i => $item ) : ?>
						<figure class="bv-media-card bv-media-card--photo">
							<a
								href="<?php echo esc_url( $item['url'] ); ?>"
								class="bv-lightbox-trigger bv-media-card__media"
								data-lightbox-src="<?php echo esc_url( $item['src'] ); ?>"
								data-lightbox-title="<?php echo esc_attr( $item['title'] ); ?>"
								data-lightbox-page="<?php echo esc_url( $item['url'] ); ?>"
								data-open-slide="<?php echo esc_attr( (string) $i ); ?>"
							>
								<img src="<?php echo esc_url( $item['src'] ); ?>" alt="<?php echo esc_attr( $item['title'] ); ?>" loading="lazy" />
							</a>
							<figcaption class="bv-media-card__body">
								<h3 class="bv-media-card__title"><a href="<?php echo esc_url( $item['url'] ); ?>"><?php echo esc_html( $item['title'] ); ?></a></h3>
								<p class="bv-media-card__meta"><?php echo esc_html( $item['date'] ); ?></p>
							</figcaption>
						</figure>
					<?php endforeach; ?>
				</div>
			<?php else : ?>
				<?php get_template_part( 'template-parts/post/content', 'none' ); ?>
			<?php endif; ?>
		</div>

		<?php get_sidebar(); ?>
	</div>
</main>

<?php
get_footer();
