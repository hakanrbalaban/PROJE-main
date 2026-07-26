<?php
/**
 * Theme admin: demo import tools.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add Appearance submenu.
 */
function akishaber_admin_menu() {
	add_theme_page(
		__( 'Akış Haber Demo', 'akishaber' ),
		__( 'Akış Haber Demo', 'akishaber' ),
		'manage_options',
		'akishaber-demo',
		'akishaber_demo_page'
	);
}
add_action( 'admin_menu', 'akishaber_admin_menu' );

/**
 * Demo admin page.
 */
function akishaber_demo_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$notice = '';
	if ( isset( $_POST['akishaber_import_demo'] ) && check_admin_referer( 'akishaber_import_demo' ) ) {
		$force = ! empty( $_POST['akishaber_force'] );
		$n     = akishaber_seed_demo_posts( $force );
		$notice = sprintf(
			/* translators: %d count */
			__( 'Demo içerik güncellendi. İşlenen yazı: %d', 'akishaber' ),
			(int) $n
		);
	}
	if ( isset( $_POST['akishaber_refresh_images'] ) && check_admin_referer( 'akishaber_import_demo' ) ) {
		$updated = akishaber_refresh_post_images( ! empty( $_POST['akishaber_force'] ) );
		$notice  = sprintf(
			/* translators: %d: number of posts. */
			__( 'Görseller yenilendi. Güncellenen yazı: %d', 'akishaber' ),
			(int) $updated
		);
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Akış Haber — Demo İçerik', 'akishaber' ); ?></h1>
		<?php if ( $notice ) : ?>
			<div class="notice notice-success is-dismissible"><p><?php echo esc_html( $notice ); ?></p></div>
		<?php endif; ?>
		<p><?php esc_html_e( 'Telifsiz örnek haberler ve Unsplash görselleri yükler. Mevcut “Merhaba dünya!” yazısını çöpe taşır.', 'akishaber' ); ?></p>
		<form method="post">
			<?php wp_nonce_field( 'akishaber_import_demo' ); ?>
			<p>
				<label>
					<input type="checkbox" name="akishaber_force" value="1" />
					<?php esc_html_e( 'Var olan demo yazılarını da yeniden yaz (force)', 'akishaber' ); ?>
				</label>
			</p>
			<?php submit_button( __( 'Demo İçeriği Yükle / Güncelle', 'akishaber' ), 'primary', 'akishaber_import_demo', false ); ?>
			<?php submit_button( __( 'Haber Görsellerini Yenile', 'akishaber' ), 'secondary', 'akishaber_refresh_images', false ); ?>
		</form>
		<p class="description">
			<?php esc_html_e( 'Görsel yenileme, öne çıkan görseli olmayan veya yer tutucu kullanan yazılara tema ile gelen fotoğrafları atar.', 'akishaber' ); ?>
		</p>
		<hr />
		<p><strong><?php esc_html_e( 'Kurulum ipuçları', 'akishaber' ); ?></strong></p>
		<ol>
			<li><?php esc_html_e( 'Görünüm → Menüler: Ana Menüyü atayın', 'akishaber' ); ?></li>
			<li><?php esc_html_e( 'Görünüm → Özelleştir → Akış Haber Ayarları', 'akishaber' ); ?></li>
			<li><?php esc_html_e( 'Yazılara öne çıkan görsel ekleyin (demo otomatik dener)', 'akishaber' ); ?></li>
		</ol>
	</div>
	<?php
}

/**
 * Admin notice after theme activation.
 */
function akishaber_admin_notice() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( ! $screen || 'themes' !== $screen->base ) {
		return;
	}
	$url = admin_url( 'themes.php?page=akishaber-demo' );
	printf(
		'<div class="notice notice-info is-dismissible"><p>%s <a href="%s">%s</a></p></div>',
		esc_html__( 'Akış Haber etkin. Anasayfanın dolu görünmesi için demo içeriği yükleyin:', 'akishaber' ),
		esc_url( $url ),
		esc_html__( 'Demo İçerik Sayfası', 'akishaber' )
	);
}
add_action( 'admin_notices', 'akishaber_admin_notice' );
