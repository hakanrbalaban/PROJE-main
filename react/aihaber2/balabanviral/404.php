<?php
/**
 * 404 Page Not Found Template (404.php)
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<main id="primary" class="site-main container">
	<section class="error-404 not-found widget" style="text-align: center; padding: 4rem 2rem; max-width: 720px; margin: 3rem auto;">
		<span style="font-size: 5rem; line-height:1; display:block; margin-bottom: 1rem;">⚠️</span>
		<h1 class="page-title single-post-title"><?php esc_html_e( '404 - Sayfa Bulunamadı', 'balabanviral' ); ?></h1>
		<p style="color: var(--muted); font-size: 1.1rem; margin-bottom: 2rem;">
			<?php esc_html_e( 'Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.', 'balabanviral' ); ?>
		</p>
		<?php get_search_form(); ?>
		<div style="margin-top: 2rem;">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" style="display: inline-block; background: var(--panel-2); border: 1px solid var(--hot); color: #fff; padding: 0.75rem 1.75rem; border-radius: 999px; font-weight: 700;">
				<?php esc_html_e( '← Ana Sayfaya Dön', 'balabanviral' ); ?>
			</a>
		</div>
	</section>
</main>

<?php
get_footer();
