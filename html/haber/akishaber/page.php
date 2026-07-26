<?php
/**
 * Page template.
 *
 * @package AkisHaber
 */

get_header();
?>
<main id="primary" class="site-main">
	<div class="container content-with-sidebar">
		<div class="content-page">
			<?php
			while ( have_posts() ) :
				the_post();
				get_template_part( 'template-parts/page/content', 'page' );
				if ( comments_open() || get_comments_number() ) {
					comments_template();
				}
			endwhile;
			?>
		</div>
		<?php get_sidebar(); ?>
	</div>
</main>
<?php
get_footer();
