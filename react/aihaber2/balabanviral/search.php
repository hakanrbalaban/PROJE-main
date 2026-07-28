<?php
/**
 * Search results — clean 2-column layout.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<main id="primary" class="site-main">
	<div id="yazilar" class="mx-auto grid max-w-[1280px] scroll-mt-40 gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_300px] md:px-6">
		<div class="content-area min-w-0">
			<header class="mb-6 border-b-2 border-[var(--hot)] pb-4">
				<h1 class="bv-archive-title text-2xl sm:text-3xl">
					<?php
					printf(
						/* translators: %s: search query. */
						esc_html__( 'Arama: %s', 'balabanviral' ),
						esc_html( get_search_query() )
					);
					?>
				</h1>
				<p class="bv-section-sub"><?php esc_html_e( 'Başlık ve içerikte arama sonuçları', 'balabanviral' ); ?></p>
			</header>

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
