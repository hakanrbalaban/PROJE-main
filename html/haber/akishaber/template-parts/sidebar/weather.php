<?php
/**
 * Weather widget body.
 *
 * @package AkisHaber
 * @var array $args
 */

$city    = isset( $args['city'] ) && $args['city'] ? $args['city'] : get_theme_mod( 'akishaber_default_city', 'İstanbul' );
$weather = akishaber_weather_data( $city );
$uid     = wp_unique_id( 'akis-weather-' );
?>
<div class="w-weather" data-weather>
	<div class="w-weather__top">
		<span class="w-weather__icon"><?php akishaber_icon( $weather['icon'], 40 ); ?></span>
		<div class="w-weather__now">
			<strong data-weather-temp><?php echo esc_html( $weather['temp'] ); ?>°</strong>
			<span data-weather-state><?php echo esc_html( $weather['state'] ); ?></span>
		</div>
		<div class="w-weather__meta">
			<span><?php esc_html_e( 'Nem', 'akishaber' ); ?> <b data-weather-humidity><?php echo esc_html( $weather['humidity'] ); ?>%</b></span>
			<span><?php esc_html_e( 'Rüzgâr', 'akishaber' ); ?> <b data-weather-wind><?php echo esc_html( $weather['wind'] ); ?> km/s</b></span>
		</div>
	</div>

	<label class="sr-only" for="<?php echo esc_attr( $uid ); ?>"><?php esc_html_e( 'Şehir seçin', 'akishaber' ); ?></label>
	<select id="<?php echo esc_attr( $uid ); ?>" class="w-weather__select" data-weather-city>
		<?php foreach ( akishaber_cities() as $option ) : ?>
			<option value="<?php echo esc_attr( $option ); ?>" <?php selected( $option, $weather['city'] ); ?>>
				<?php echo esc_html( $option ); ?>
			</option>
		<?php endforeach; ?>
	</select>

	<ul class="w-weather__days" data-weather-days>
		<?php foreach ( $weather['days'] as $day ) : ?>
			<li>
				<span><?php echo esc_html( $day['label'] ); ?></span>
				<?php akishaber_icon( $day['icon'], 18 ); ?>
				<b><?php echo esc_html( $day['high'] ); ?>°</b>
				<i><?php echo esc_html( $day['low'] ); ?>°</i>
			</li>
		<?php endforeach; ?>
	</ul>
</div>
