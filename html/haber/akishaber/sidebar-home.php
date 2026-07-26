<?php
/**
 * Homepage sidebar.
 *
 * @package AkisHaber
 */
?>
<aside id="home-sidebar" class="widget-area home-sidebar" role="complementary">
	<?php if ( is_active_sidebar( 'home-sidebar' ) ) : ?>
		<?php dynamic_sidebar( 'home-sidebar' ); ?>
	<?php else : ?>
		<?php get_template_part( 'template-parts/home/sidebar-default' ); ?>
	<?php endif; ?>
</aside>
