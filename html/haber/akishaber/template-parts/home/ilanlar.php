<?php
/**
 * Official notices.
 *
 * @package AkisHaber
 */

$q = akishaber_query_by_cat( 'ilanlar', 3 );
if ( ! $q->have_posts() ) {
	return;
}
?>
<section class="section section--alt" id="ilanlar">
	<div class="container">
		<div class="section__head">
			<h2><?php esc_html_e( 'Resmi İlanlar', 'akishaber' ); ?></h2>
			<a class="all-link" href="<?php echo esc_url( akishaber_cat_link( 'ilanlar' ) ); ?>"><?php esc_html_e( 'Tümü', 'akishaber' ); ?></a>
		</div>
		<div class="ilan-grid">
			<?php
			while ( $q->have_posts() ) :
				$q->the_post();
				?>
				<a href="<?php the_permalink(); ?>" class="ilan-item">
					<span><?php esc_html_e( 'İlan', 'akishaber' ); ?></span>
					<strong><?php the_title(); ?></strong>
					<time><?php echo esc_html( get_the_date() ); ?></time>
				</a>
				<?php
			endwhile;
			wp_reset_postdata();
			?>
		</div>
	</div>
</section>
