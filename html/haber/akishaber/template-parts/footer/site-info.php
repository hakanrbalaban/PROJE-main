<?php
/**
 * Footer site information.
 *
 * @package AkisHaber
 */
?>
<div class="footer__bottom">
	<div class="container footer__legal">
		<p>
			&copy; <?php echo esc_html( date_i18n( 'Y' ) ); ?>
			<?php echo esc_html( get_bloginfo( 'name' ) ); ?>.
			<?php esc_html_e( 'Tüm hakları saklıdır.', 'akishaber' ); ?>
		</p>
		<nav aria-label="<?php esc_attr_e( 'Yasal bağlantılar', 'akishaber' ); ?>">
			<a href="<?php echo esc_url( home_url( '/gizlilik-politikasi/' ) ); ?>"><?php esc_html_e( 'Gizlilik', 'akishaber' ); ?></a>
			<a href="<?php echo esc_url( home_url( '/kunye/' ) ); ?>"><?php esc_html_e( 'Künye', 'akishaber' ); ?></a>
			<a href="<?php echo esc_url( home_url( '/iletisim/' ) ); ?>"><?php esc_html_e( 'İletişim', 'akishaber' ); ?></a>
		</nav>
	</div>
</div>
