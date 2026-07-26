<?php
/**
 * Verse of the day widget body.
 *
 * @package AkisHaber
 */

$verse = akishaber_daily_verse();
?>
<figure class="w-verse">
	<span class="w-verse__mark"><?php akishaber_icon( 'book', 24 ); ?></span>
	<blockquote><?php echo esc_html( $verse['text'] ); ?></blockquote>
	<?php if ( $verse['source'] ) : ?>
		<figcaption><?php echo esc_html( $verse['source'] ); ?></figcaption>
	<?php endif; ?>
</figure>
