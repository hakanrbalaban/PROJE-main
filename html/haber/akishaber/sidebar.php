<?php
/**
 * Sidebar for posts/archives — with defaults.
 *
 * @package AkisHaber
 */
?>
<aside id="secondary" class="widget-area sidebar-panel home-sidebar" role="complementary">
	<?php if ( is_active_sidebar( 'sidebar-1' ) ) : ?>
		<?php dynamic_sidebar( 'sidebar-1' ); ?>
	<?php else : ?>
		<?php get_template_part( 'template-parts/home/sidebar-default' ); ?>
	<?php endif; ?>
</aside>
