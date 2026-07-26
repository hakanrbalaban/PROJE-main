<?php
/**
 * Prayer times widget body.
 *
 * @package AkisHaber
 * @var array $args
 */

$city  = isset( $args['city'] ) && $args['city'] ? $args['city'] : get_theme_mod( 'akishaber_default_city', 'İstanbul' );
$times = akishaber_prayer_times( $city );
?>
<div class="w-prayer">
	<p class="w-prayer__head">
		<?php akishaber_icon( 'mosque', 18 ); ?>
		<span><?php echo esc_html( $city ); ?></span>
		<time><?php echo esc_html( date_i18n( 'j F Y' ) ); ?></time>
	</p>
	<ul class="w-prayer__list">
		<?php foreach ( $times as $label => $time ) : ?>
			<li>
				<span><?php echo esc_html( $label ); ?></span>
				<strong><?php echo esc_html( $time ); ?></strong>
			</li>
		<?php endforeach; ?>
	</ul>
</div>
