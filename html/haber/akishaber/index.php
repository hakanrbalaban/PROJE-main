<?php
/**
 * Main index / blog.
 *
 * @package AkisHaber
 */

get_header();
?>
<div class="container content-with-sidebar">
	<main id="primary" class="site-main archive-wrap">
		<header class="page-header section__head">
			<h1 class="page-title">
				<?php
				if ( is_home() && ! is_front_page() ) {
					single_post_title();
				} else {
					esc_html_e( 'Haberler', 'akishaber' );
				}
				?>
			</h1>
		</header>

		<?php get_template_part( 'template-parts/post/archive', 'filters' ); ?>

		<div class="archive-grid">
			<?php if ( have_posts() ) : ?>
				<?php
				while ( have_posts() ) :
					the_post();
					get_template_part( 'template-parts/post/content' );
				endwhile;
				?>
			<?php else : ?>
				<?php get_template_part( 'template-parts/post/content', 'none' ); ?>
			<?php endif; ?>
		</div>

		<?php the_posts_pagination( array( 'mid_size' => 2 ) ); ?>
	</main>
	<?php get_sidebar(); ?>
</div>
<?php
get_footer();
