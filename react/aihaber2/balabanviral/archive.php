<?php
/**
 * Category / archive — clean 2-column magazine layout.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$term = get_queried_object();
$meta = ( $term instanceof WP_Term && 'category' === $term->taxonomy )
	? my_theme_category_meta( $term->name )
	: array( 'emoji' => '📰', 'accent' => '#e11d48' );
?>

<main id="primary" class="site-main">
	<div class="mx-auto max-w-[1280px] px-4 pt-8 md:px-6">
		<header class="mb-6 border-b-2 pb-4" style="border-color: <?php echo esc_attr( $meta['accent'] ); ?>">
			<div class="flex flex-wrap items-end justify-between gap-3">
				<div class="flex items-center gap-3">
					<span class="grid h-12 w-12 place-items-center text-2xl" style="border-radius: var(--radius); background: <?php echo esc_attr( $meta['accent'] ); ?>22; box-shadow: inset 0 0 0 2px <?php echo esc_attr( $meta['accent'] ); ?>66">
						<?php echo esc_html( $meta['emoji'] ); ?>
					</span>
					<div>
						<?php the_archive_title( '<h1 class="bv-archive-title text-2xl sm:text-3xl">', '</h1>' ); ?>
						<?php the_archive_description( '<p class="bv-section-sub">', '</p>' ); ?>
						<?php if ( $term instanceof WP_Term && isset( $term->count ) ) : ?>
							<p class="bv-section-sub">
								<?php
								printf(
									/* translators: %d: post count */
									esc_html__( '%d yazı · tarih sırasıyla', 'balabanviral' ),
									(int) $term->count
								);
								?>
							</p>
						<?php endif; ?>
					</div>
				</div>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="magazine-more-link"><?php esc_html_e( 'Ana sayfa', 'balabanviral' ); ?> →</a>
			</div>
		</header>
	</div>

	<div id="yazilar" class="mx-auto grid max-w-[1280px] scroll-mt-40 gap-8 px-4 pb-12 lg:grid-cols-[minmax(0,1fr)_300px] md:px-6">
		<div class="content-area min-w-0">
			<?php if ( have_posts() ) : ?>
				<div class="grid gap-4 sm:grid-cols-2">
					<?php
					while ( have_posts() ) :
						the_post();
						get_template_part( 'template-parts/post/content', get_post_format() );
					endwhile;
					?>
				</div>
				<div class="mt-8 flex justify-center">
					<?php
					the_posts_pagination(
						array(
							'prev_text' => '← ' . __( 'Önceki', 'balabanviral' ),
							'next_text' => __( 'Sonraki', 'balabanviral' ) . ' →',
						)
					);
					?>
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
