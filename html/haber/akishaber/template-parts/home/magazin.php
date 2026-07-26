<?php
/**
 * Magazin + horoscope.
 *
 * @package AkisHaber
 */

$q = akishaber_query_by_cat( 'magazin', 6 );
if ( ! $q->have_posts() ) {
	$q = akishaber_latest( 6 );
}
$posts = array();
while ( $q->have_posts() ) {
	$q->the_post();
	$posts[] = get_post();
}
wp_reset_postdata();
?>
<section class="section section--alt" id="magazin">
	<div class="container magazin-layout">
		<div>
			<?php
			akishaber_section_head(
				array(
					'title' => __( 'Magazin', 'akishaber' ),
					'icon'  => 'magazin',
					'link'  => akishaber_cat_link( 'magazin' ),
				)
			);
			?>
			<div class="grid-2">
				<?php
				for ( $i = 0; $i < min( 2, count( $posts ) ); $i++ ) :
					$post = $posts[ $i ];
					setup_postdata( $post );
					?>
					<article <?php post_class( 'story', $post ); ?>>
						<a href="<?php the_permalink(); ?>" class="story__media"><?php akishaber_the_thumb( 'akishaber-card' ); ?></a>
						<div class="story__body"><h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3></div>
					</article>
					<?php
					wp_reset_postdata();
				endfor;
				?>
			</div>
			<?php if ( count( $posts ) > 2 ) : ?>
				<ul class="bullet-list mt">
					<?php
					for ( $i = 2; $i < count( $posts ); $i++ ) :
						$post = $posts[ $i ];
						setup_postdata( $post );
						?>
						<li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
						<?php
						wp_reset_postdata();
					endfor;
					?>
				</ul>
			<?php endif; ?>
		</div>
		<aside class="horoscope" aria-label="<?php esc_attr_e( 'Günlük burç yorumları', 'akishaber' ); ?>">
			<h3><?php esc_html_e( 'Günlük Burç', 'akishaber' ); ?></h3>
			<div class="zodiac-tabs" id="zodiacTabs" role="tablist">
				<?php
				$signs = array(
					'koc' => 'Koç', 'boga' => 'Boğa', 'ikizler' => 'İkizler', 'yengec' => 'Yengeç',
					'aslan' => 'Aslan', 'basak' => 'Başak', 'terazi' => 'Terazi', 'akrep' => 'Akrep',
					'yay' => 'Yay', 'oglak' => 'Oğlak', 'kova' => 'Kova', 'balik' => 'Balık',
				);
				$first = true;
				foreach ( $signs as $key => $label ) :
					?>
					<button type="button" role="tab" aria-selected="<?php echo $first ? 'true' : 'false'; ?>" data-z="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></button>
					<?php
					$first = false;
				endforeach;
				?>
			</div>
			<div class="zodiac-panel" id="zodiacPanel">
				<h4 id="zodiacTitle"><?php esc_html_e( 'Koç Burcu Yorumu', 'akishaber' ); ?></h4>
				<p id="zodiacText"><?php esc_html_e( 'Bugün cesaretin ve kararlılığın ön plana çıktığı bir gün. İçsel motivasyonun yüksek; yeni projelere adım atmak için uygun bir zaman.', 'akishaber' ); ?></p>
			</div>
		</aside>
	</div>
</section>
