<?php
/**
 * Single video — embed player + related clips.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<main id="primary" class="site-main">
	<div class="mx-auto grid max-w-[1280px] gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_300px] md:px-6">
		<div class="content-area min-w-0">
			<?php
			while ( have_posts() ) :
				the_post();
				get_template_part( 'template-parts/post/content-single', 'video' );
			endwhile;
			?>
		</div>

		<?php get_sidebar(); ?>
	</div>
</main>

<?php
get_footer();
