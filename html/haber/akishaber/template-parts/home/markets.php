<?php
/**
 * Markets bar.
 *
 * @package AkisHaber
 */
?>
<section class="markets" aria-label="<?php esc_attr_e( 'Piyasalar', 'akishaber' ); ?>">
	<div class="container markets__inner" id="marketsBar">
		<span class="markets__label"><?php esc_html_e( 'PİYASALAR', 'akishaber' ); ?></span>
		<div class="market-item up"><span><?php esc_html_e( 'DOLAR', 'akishaber' ); ?></span><strong><?php echo esc_html( akishaber_mod( 'akishaber_market_dolar', '34,12' ) ); ?></strong><em>+0,18%</em></div>
		<div class="market-item down"><span><?php esc_html_e( 'EURO', 'akishaber' ); ?></span><strong><?php echo esc_html( akishaber_mod( 'akishaber_market_euro', '37,05' ) ); ?></strong><em>−0,09%</em></div>
		<div class="market-item up"><span><?php esc_html_e( 'ALTIN', 'akishaber' ); ?></span><strong><?php echo esc_html( akishaber_mod( 'akishaber_market_altin', '2.841' ) ); ?></strong><em>+0,42%</em></div>
		<div class="market-item up"><span><?php esc_html_e( 'BİST', 'akishaber' ); ?></span><strong><?php echo esc_html( akishaber_mod( 'akishaber_market_bist', '9.412' ) ); ?></strong><em>+0,65%</em></div>
		<div class="market-item down" id="kripto"><span><?php esc_html_e( 'BITCOIN', 'akishaber' ); ?></span><strong><?php echo esc_html( akishaber_mod( 'akishaber_market_btc', '67.240' ) ); ?></strong><em>−1,12%</em></div>
		<?php if ( is_active_sidebar( 'home-markets' ) ) : ?>
			<?php dynamic_sidebar( 'home-markets' ); ?>
		<?php endif; ?>
	</div>
</section>
