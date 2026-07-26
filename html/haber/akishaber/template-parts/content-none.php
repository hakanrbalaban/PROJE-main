<?php
/**
 * No results.
 *
 * @package AkisHaber
 */
?>
<section class="no-results not-found">
	<header class="page-header">
		<h2 class="page-title"><?php esc_html_e( 'İçerik bulunamadı', 'akishaber' ); ?></h2>
	</header>
	<div class="page-content">
		<p><?php esc_html_e( 'Aradığınız kriterlere uygun haber yok. Farklı bir arama deneyin.', 'akishaber' ); ?></p>
		<?php get_search_form(); ?>
	</div>
</section>
