<?php
/**
 * 404.
 *
 * @package AkisHaber
 */

get_header();
?>
<main id="primary" class="site-main">
	<div class="container content-page error-404">
		<header class="section__head">
			<h1><?php esc_html_e( 'Sayfa bulunamadı', 'akishaber' ); ?></h1>
		</header>
		<p><?php esc_html_e( 'Aradığınız sayfa taşınmış veya silinmiş olabilir. Ana sayfaya dönebilir veya arama yapabilirsiniz.', 'akishaber' ); ?></p>
		<p><a class="btn-outline" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Ana Sayfa', 'akishaber' ); ?></a></p>
		<?php get_search_form(); ?>
	</div>
</main>
<?php
get_footer();
