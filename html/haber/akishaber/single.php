<?php
/**
 * Single post — always with sidebar.
 *
 * @package AkisHaber
 */

get_header();
?>
<main id="primary" class="site-main">
	<div class="container content-with-sidebar single-layout">
		<?php
		while ( have_posts() ) :
			the_post();
			get_template_part( 'template-parts/post/content', 'single' );
		endwhile;
		?>
		<?php get_sidebar(); ?>
	</div>
</main>
<?php
get_footer();
