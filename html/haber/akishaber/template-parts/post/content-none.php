<?php
/**
 * Empty result state.
 *
 * @package AkisHaber
 */
?>
<section class="no-results not-found">
	<header class="page-header">
		<h2 class="page-title"><?php esc_html_e( 'İçerik bulunamadı', 'akishaber' ); ?></h2>
	</header>
	<div class="page-content">
		<p><?php esc_html_e( 'Seçtiğiniz filtrelere uygun haber bulunamadı. Filtreleri temizleyip tekrar deneyin.', 'akishaber' ); ?></p>
		<?php get_search_form(); ?>
	</div>
</section>
