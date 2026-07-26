<?php
/**
 * Currency / markets widget body.
 *
 * @package AkisHaber
 */

$items = array(
	array( 'label' => __( 'Dolar', 'akishaber' ), 'value' => get_theme_mod( 'akishaber_market_dolar', '34,12' ), 'dir' => 'up' ),
	array( 'label' => __( 'Euro', 'akishaber' ), 'value' => get_theme_mod( 'akishaber_market_euro', '37,05' ), 'dir' => 'up' ),
	array( 'label' => __( 'Altın', 'akishaber' ), 'value' => get_theme_mod( 'akishaber_market_altin', '2.841' ), 'dir' => 'down' ),
	array( 'label' => __( 'BİST 100', 'akishaber' ), 'value' => get_theme_mod( 'akishaber_market_bist', '9.412' ), 'dir' => 'up' ),
	array( 'label' => __( 'Bitcoin', 'akishaber' ), 'value' => get_theme_mod( 'akishaber_market_btc', '67.240' ), 'dir' => 'down' ),
);
?>
<ul class="w-markets">
	<?php foreach ( $items as $item ) : ?>
		<li class="w-markets__item is-<?php echo esc_attr( $item['dir'] ); ?>">
			<span><?php echo esc_html( $item['label'] ); ?></span>
			<strong><?php echo esc_html( $item['value'] ); ?></strong>
			<i aria-hidden="true"><?php echo 'up' === $item['dir'] ? '▲' : '▼'; ?></i>
		</li>
	<?php endforeach; ?>
</ul>
