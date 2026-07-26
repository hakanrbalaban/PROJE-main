<?php
/**
 * Newsletter CTA.
 *
 * @package AkisHaber
 */
?>
<section class="newsletter" id="bulten">
	<div class="container newsletter__inner">
		<div>
			<h2><?php esc_html_e( 'Günün özeti e-postanda', 'akishaber' ); ?></h2>
			<p><?php echo esc_html( akishaber_mod( 'akishaber_newsletter', __( 'Sabah bülteni ile manşetleri, piyasa özetini ve son dakikaları kaçırma.', 'akishaber' ) ) ); ?></p>
		</div>
		<form class="newsletter__form" id="newsletterForm" action="<?php echo esc_url( home_url( '/' ) ); ?>" method="get">
			<label class="sr-only" for="emailInput"><?php esc_html_e( 'E-posta', 'akishaber' ); ?></label>
			<input id="emailInput" type="email" name="newsletter_email" placeholder="<?php esc_attr_e( 'E-posta adresiniz', 'akishaber' ); ?>" required />
			<button type="submit"><?php esc_html_e( 'Abone ol', 'akishaber' ); ?></button>
		</form>
	</div>
</section>
