<?php
/**
 * Daily horoscope widget body.
 *
 * @package AkisHaber
 */

$signs   = akishaber_zodiac_signs();
$default = 'koc';
$uid     = wp_unique_id( 'akis-zodiac-' );
?>
<div class="w-zodiac" data-zodiac>
	<div class="w-zodiac__grid" role="tablist" aria-label="<?php esc_attr_e( 'Burçlar', 'akishaber' ); ?>">
		<?php foreach ( $signs as $slug => $sign ) : ?>
			<button
				type="button"
				role="tab"
				class="w-zodiac__sign<?php echo $default === $slug ? ' is-active' : ''; ?>"
				aria-selected="<?php echo $default === $slug ? 'true' : 'false'; ?>"
				data-zodiac-sign="<?php echo esc_attr( $slug ); ?>"
				data-zodiac-name="<?php echo esc_attr( $sign['name'] ); ?>"
				data-zodiac-range="<?php echo esc_attr( $sign['range'] ); ?>"
				data-zodiac-text="<?php echo esc_attr( akishaber_zodiac_text( $slug ) ); ?>"
			>
				<?php akishaber_icon( 'star', 16 ); ?>
				<span><?php echo esc_html( $sign['name'] ); ?></span>
			</button>
		<?php endforeach; ?>
	</div>
	<div class="w-zodiac__panel" id="<?php echo esc_attr( $uid ); ?>" aria-live="polite">
		<h4 data-zodiac-title>
			<?php
			printf(
				/* translators: %s: zodiac sign name. */
				esc_html__( '%s Burcu', 'akishaber' ),
				esc_html( $signs[ $default ]['name'] )
			);
			?>
			<small data-zodiac-range><?php echo esc_html( $signs[ $default ]['range'] ); ?></small>
		</h4>
		<p data-zodiac-text><?php echo esc_html( akishaber_zodiac_text( $default ) ); ?></p>
	</div>
</div>
