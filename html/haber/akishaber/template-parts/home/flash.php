<?php
/**
 * Flash strip.
 *
 * @package AkisHaber
 */

$q = akishaber_query_by_cat( 'son-dakika', 8 );
if ( ! $q->have_posts() ) {
	$q = akishaber_latest( 8 );
}
?>
<section class="flash-strip container" aria-label="<?php esc_attr_e( 'Hızlı başlıklar', 'akishaber' ); ?>">
	<div class="flash-strip__track" id="flashTrack">
		<?php
		if ( $q->have_posts() ) :
			while ( $q->have_posts() ) :
				$q->the_post();
				?>
				<a href="<?php the_permalink(); ?>"><span><?php esc_html_e( 'SON DAKİKA', 'akishaber' ); ?></span> <?php the_title(); ?></a>
				<?php
			endwhile;
			wp_reset_postdata();
		endif;
		?>
	</div>
</section>
