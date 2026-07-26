<?php
/**
 * Breaking news ticker.
 *
 * @package AkisHaber
 */

$q = akishaber_query_by_cat( 'son-dakika', 10 );
if ( ! $q->have_posts() ) {
	$q = akishaber_latest( 10 );
}
?>
<div class="breaking" role="region" aria-label="<?php esc_attr_e( 'Son dakika', 'akishaber' ); ?>">
	<div class="container breaking__inner">
		<span class="breaking__badge"><i class="pulse"></i> <?php esc_html_e( 'SON DAKİKA', 'akishaber' ); ?></span>
		<div class="breaking__track" id="breakingTrack">
			<div class="breaking__list" id="breakingList">
				<?php
				if ( $q->have_posts() ) :
					while ( $q->have_posts() ) :
						$q->the_post();
						?>
						<a href="<?php the_permalink(); ?>">
							<time><?php echo esc_html( get_the_time( 'H:i' ) ); ?></time>
							<?php the_title(); ?>
						</a>
						<?php
					endwhile;
					wp_reset_postdata();
				endif;
				?>
			</div>
		</div>
	</div>
</div>
