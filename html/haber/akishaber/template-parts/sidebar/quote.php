<?php
/**
 * Quote of the day widget body.
 *
 * @package AkisHaber
 */

$quote = akishaber_daily_quote();
?>
<figure class="w-quote">
	<span class="w-quote__mark"><?php akishaber_icon( 'quote', 26 ); ?></span>
	<blockquote><?php echo esc_html( $quote['text'] ); ?></blockquote>
	<?php if ( $quote['author'] ) : ?>
		<figcaption><?php echo esc_html( $quote['author'] ); ?></figcaption>
	<?php endif; ?>
	<time class="w-quote__date" datetime="<?php echo esc_attr( date_i18n( 'Y-m-d' ) ); ?>">
		<?php echo esc_html( date_i18n( 'j F Y' ) ); ?>
	</time>
</figure>
