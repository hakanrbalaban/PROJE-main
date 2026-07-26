<?php
/**
 * Standard page content.
 *
 * @package AkisHaber
 */
?>
<article <?php post_class( 'page-article' ); ?>>
	<header class="entry-header section__head">
		<h1 class="entry-title"><?php the_title(); ?></h1>
	</header>
	<?php if ( has_post_thumbnail() ) : ?>
		<figure class="entry-thumb"><?php the_post_thumbnail( 'akishaber-hero' ); ?></figure>
	<?php endif; ?>
	<div class="entry-content">
		<?php the_content(); ?>
		<?php
		wp_link_pages(
			array(
				'before' => '<nav class="page-links">' . esc_html__( 'Sayfalar:', 'akishaber' ),
				'after'  => '</nav>',
			)
		);
		?>
	</div>
</article>
