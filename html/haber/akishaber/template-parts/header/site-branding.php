<?php
/**
 * Site branding.
 *
 * @package AkisHaber
 */
?>
<div class="site-branding">
	<?php akishaber_the_brand(); ?>
	<?php if ( get_bloginfo( 'description', 'display' ) && is_front_page() ) : ?>
		<p class="site-description"><?php echo esc_html( get_bloginfo( 'description', 'display' ) ); ?></p>
	<?php endif; ?>
</div>
