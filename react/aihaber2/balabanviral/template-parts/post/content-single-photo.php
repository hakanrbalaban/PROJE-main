<?php
/**
 * Single bv_photo content — full image + related gallery.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$post_id     = get_the_ID();
$title       = get_the_title( $post_id );
$archive_url = get_post_type_archive_link( 'bv_photo' );
if ( ! $archive_url ) {
	$archive_url = home_url( '/foto-galeri/' );
}

$src = get_the_post_thumbnail_url( $post_id, 'large' );
if ( ! $src && function_exists( 'my_theme_get_cover_url' ) ) {
	$src = my_theme_get_cover_url( $post_id );
}

$gallery = function_exists( 'my_theme_collect_media_items' ) ? my_theme_collect_media_items( 'photo' ) : array();
$current_index = 0;
foreach ( $gallery as $i => $item ) {
	if ( (string) $post_id === (string) $item['id'] ) {
		$current_index = (int) $i;
		break;
	}
}
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'bv-single-media bv-single-media--photo' ); ?>>
	<a href="<?php echo esc_url( $archive_url ); ?>" class="mb-6 inline-block text-sm text-[var(--muted)] hover:text-[var(--hot)]">
		← <?php esc_html_e( 'Foto galeriye dön', 'balabanviral' ); ?>
	</a>

	<header class="mb-5">
		<p class="text-xs font-bold uppercase tracking-wider text-[var(--cyan)]"><?php esc_html_e( 'Fotoğraf', 'balabanviral' ); ?></p>
		<h1 class="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight text-[var(--ink)] sm:text-4xl">
			<?php echo esc_html( $title ); ?>
		</h1>
		<p class="mt-3 text-sm text-[var(--muted)]">
			<?php echo esc_html( get_the_date( 'j F Y', $post_id ) ); ?>
			<?php if ( ! empty( $gallery ) ) : ?>
				· <?php echo esc_html( (string) ( $current_index + 1 ) ); ?>/<?php echo esc_html( (string) count( $gallery ) ); ?>
			<?php endif; ?>
		</p>
	</header>

	<?php if ( $src ) : ?>
		<figure class="bv-single-photo">
			<a
				href="<?php echo esc_url( get_permalink( $post_id ) ); ?>"
				class="bv-lightbox-trigger bv-single-photo__link"
				data-lightbox-src="<?php echo esc_url( $src ); ?>"
				data-lightbox-title="<?php echo esc_attr( $title ); ?>"
				data-lightbox-page="<?php echo esc_url( get_permalink( $post_id ) ); ?>"
			>
				<img src="<?php echo esc_url( $src ); ?>" alt="<?php echo esc_attr( $title ); ?>" loading="eager" />
				<span class="bv-single-photo__hint"><?php esc_html_e( 'Büyüt', 'balabanviral' ); ?></span>
			</a>
		</figure>
	<?php endif; ?>

	<?php if ( get_the_content() ) : ?>
		<div class="prose-aiora mt-8">
			<?php the_content(); ?>
		</div>
	<?php endif; ?>

	<?php if ( count( $gallery ) > 1 ) : ?>
		<section class="mt-10" aria-label="<?php esc_attr_e( 'Foto galeri', 'balabanviral' ); ?>">
			<h2 class="bv-section-title mb-4 text-xl"><?php esc_html_e( 'Galeri', 'balabanviral' ); ?></h2>

			<section class="bv-media-slideshow" data-media-slideshow data-mode="photo" aria-label="<?php esc_attr_e( 'Foto slayt', 'balabanviral' ); ?>">
				<div class="bv-media-slideshow__stage">
					<?php foreach ( $gallery as $i => $item ) : ?>
						<article class="bv-media-slide<?php echo $i === $current_index ? ' is-active' : ''; ?>" data-slide-index="<?php echo esc_attr( (string) $i ); ?>" data-src="<?php echo esc_url( $item['src'] ); ?>" data-page="<?php echo esc_url( $item['url'] ); ?>" data-title="<?php echo esc_attr( $item['title'] ); ?>">
							<a
								href="<?php echo esc_url( $item['url'] ); ?>"
								class="bv-lightbox-trigger bv-media-slide__media"
								data-lightbox-src="<?php echo esc_url( $item['src'] ); ?>"
								data-lightbox-title="<?php echo esc_attr( $item['title'] ); ?>"
								data-lightbox-page="<?php echo esc_url( $item['url'] ); ?>"
							>
								<img src="<?php echo esc_url( $item['src'] ); ?>" alt="<?php echo esc_attr( $item['title'] ); ?>" loading="<?php echo $i === $current_index ? 'eager' : 'lazy'; ?>" />
							</a>
							<div class="bv-media-slide__caption">
								<strong><?php echo esc_html( $item['title'] ); ?></strong>
								<span><?php echo esc_html( $item['date'] ); ?> · <?php echo esc_html( (string) ( $i + 1 ) ); ?>/<?php echo esc_html( (string) count( $gallery ) ); ?></span>
							</div>
						</article>
					<?php endforeach; ?>

					<button type="button" class="bv-media-slideshow__nav bv-media-slideshow__nav--prev" data-slide-prev aria-label="<?php esc_attr_e( 'Önceki', 'balabanviral' ); ?>">← <?php esc_html_e( 'Önceki', 'balabanviral' ); ?></button>
					<button type="button" class="bv-media-slideshow__nav bv-media-slideshow__nav--next" data-slide-next aria-label="<?php esc_attr_e( 'Sonraki', 'balabanviral' ); ?>"><?php esc_html_e( 'Sonraki', 'balabanviral' ); ?> →</button>
				</div>
				<div class="bv-media-slideshow__dots" role="tablist">
					<?php foreach ( $gallery as $i => $item ) : ?>
						<button type="button" class="bv-media-slideshow__dot<?php echo $i === $current_index ? ' is-active' : ''; ?>" data-slide-goto="<?php echo esc_attr( (string) $i ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Slayt %d', 'balabanviral' ), $i + 1 ) ); ?>"></button>
					<?php endforeach; ?>
				</div>
			</section>

			<div class="bv-media-grid bv-media-grid--photo mt-6">
				<?php foreach ( $gallery as $i => $item ) : ?>
					<figure class="bv-media-card bv-media-card--photo<?php echo $i === $current_index ? ' is-current' : ''; ?>">
						<a
							href="<?php echo esc_url( $item['url'] ); ?>"
							class="bv-lightbox-trigger bv-media-card__media"
							data-lightbox-src="<?php echo esc_url( $item['src'] ); ?>"
							data-lightbox-title="<?php echo esc_attr( $item['title'] ); ?>"
							data-lightbox-page="<?php echo esc_url( $item['url'] ); ?>"
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
		</section>
	<?php endif; ?>
</article>
