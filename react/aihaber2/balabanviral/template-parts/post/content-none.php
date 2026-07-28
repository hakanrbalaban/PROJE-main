<?php
/**
 * Template part for displaying a message that posts cannot be found
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<section class="no-results not-found widget">
	<header class="page-header">
		<h1 class="page-title"><?php esc_html_e( 'İçerik Bulunamadı', 'balabanviral' ); ?></h1>
	</header>

	<div class="page-content">
		<?php if ( is_search() ) : ?>
			<p><?php esc_html_e( 'Üzgünüz, arama terimlerinize uygun hiçbir içerik bulunamadı. Lütfen farklı kelimelerle tekrar deneyin.', 'balabanviral' ); ?></p>
			<?php get_search_form(); ?>
		<?php else : ?>
			<p><?php esc_html_e( 'Aradığınız içerik henüz yayınlanmamış olabilir. Lütfen site aramasını kullanın.', 'balabanviral' ); ?></p>
			<?php get_search_form(); ?>
		<?php endif; ?>
	</div>
</section>
