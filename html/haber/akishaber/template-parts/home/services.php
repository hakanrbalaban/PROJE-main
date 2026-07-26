<?php
/**
 * Services: publications, prayer, pharmacy.
 *
 * @package AkisHaber
 */
?>
<section class="section container services-row" id="servisler">
	<div class="service-card" id="yayinlar">
		<div class="section__head">
			<h2><?php esc_html_e( 'Yayınlarımız', 'akishaber' ); ?></h2>
		</div>
		<div class="pubs">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="pub">
				<img src="https://picsum.photos/seed/gaz1/200/280" alt="" />
				<span><?php bloginfo( 'name' ); ?><br /><?php echo esc_html( date_i18n( 'j F Y' ) ); ?></span>
			</a>
			<a href="<?php echo esc_url( akishaber_cat_link( 'saglik' ) ); ?>" class="pub">
				<img src="https://picsum.photos/seed/gaz2/200/280" alt="" />
				<span><?php esc_html_e( 'Sağlık Dergisi — Sayı 1', 'akishaber' ); ?></span>
			</a>
		</div>
	</div>

	<div class="service-card" id="namaz">
		<div class="section__head"><h2><?php esc_html_e( 'Namaz Vakitleri', 'akishaber' ); ?></h2></div>
		<p class="prayer-date" id="prayerDate"><?php echo esc_html( date_i18n( 'j F Y — l' ) ); ?></p>
		<label class="sr-only" for="prayerCity"><?php esc_html_e( 'Şehir', 'akishaber' ); ?></label>
		<select id="prayerCity" class="prayer-select"></select>
		<ul class="prayer-times" id="prayerTimes">
			<li><span><?php esc_html_e( 'İmsak', 'akishaber' ); ?></span><strong>04:12</strong></li>
			<li><span><?php esc_html_e( 'Güneş', 'akishaber' ); ?></span><strong>05:48</strong></li>
			<li><span><?php esc_html_e( 'Öğle', 'akishaber' ); ?></span><strong>13:12</strong></li>
			<li><span><?php esc_html_e( 'İkindi', 'akishaber' ); ?></span><strong>16:58</strong></li>
			<li><span><?php esc_html_e( 'Akşam', 'akishaber' ); ?></span><strong>20:24</strong></li>
			<li><span><?php esc_html_e( 'Yatsı', 'akishaber' ); ?></span><strong>21:52</strong></li>
		</ul>
	</div>

	<div class="service-card" id="eczane">
		<div class="section__head"><h2><?php esc_html_e( 'Nöbetçi Eczaneler', 'akishaber' ); ?></h2></div>
		<?php if ( is_active_sidebar( 'home-services' ) ) : ?>
			<?php dynamic_sidebar( 'home-services' ); ?>
		<?php else : ?>
			<ul class="pharmacy-list">
				<li>
					<strong><?php esc_html_e( 'Merkez Eczanesi', 'akishaber' ); ?></strong>
					<span>Atatürk Cad. No:12</span>
					<a href="tel:+902241112233">0224 111 22 33</a>
				</li>
				<li>
					<strong><?php esc_html_e( 'Yeşilova Eczanesi', 'akishaber' ); ?></strong>
					<span>Cumhuriyet Mah. 45. Sk.</span>
					<a href="tel:+902244445566">0224 444 55 66</a>
				</li>
				<li>
					<strong><?php esc_html_e( 'Şifa Eczanesi', 'akishaber' ); ?></strong>
					<span>Osmangazi Meydanı</span>
					<a href="tel:+902247778899">0224 777 88 99</a>
				</li>
			</ul>
		<?php endif; ?>
	</div>
</section>
