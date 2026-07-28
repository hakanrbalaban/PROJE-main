<?php
/**
 * Template part for displaying page content in page.php
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'page-wrapper' ); ?>>
	<header class="entry-header">
		<h1 class="entry-title single-post-title"><?php the_title(); ?></h1>
	</header>

	<?php if ( has_post_thumbnail() ) : ?>
		<div class="featured-media-wrapper">
			<?php the_post_thumbnail( 'my-theme-slider' ); ?>
		</div>
	<?php endif; ?>

	<div class="entry-content">
		<?php
		the_content();

		wp_link_pages(
			array(
				'before' => '<div class="page-links">' . esc_html__( 'Sayfalar:', 'balabanviral' ),
				'after'  => '</div>',
			)
		);
		?>
	</div>
</article>
