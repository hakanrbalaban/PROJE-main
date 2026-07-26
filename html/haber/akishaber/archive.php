<?php
/**
 * Archive / category.
 *
 * @package AkisHaber
 */

get_header();
?>
<div class="container content-with-sidebar">
	<main id="primary" class="site-main archive-wrap">
		<header class="page-header section__head">
			<?php the_archive_title( '<h1 class="page-title">', '</h1>' ); ?>
			<?php the_archive_description( '<div class="archive-description">', '</div>' ); ?>
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
