<?php
/**
 * Authors / columnists.
 *
 * @package AkisHaber
 */

$q = akishaber_query_by_cat( 'yazarlar', 5 );
if ( ! $q->have_posts() ) {
	$q = akishaber_latest( 5 );
}
?>
<section class="section container" id="yazarlar">
	<?php
	akishaber_section_head(
		array(
			'title' => __( 'Yazarlar', 'akishaber' ),
			'icon'  => 'yazarlar',
			'link'  => akishaber_cat_link( 'yazarlar' ),
			'rail'  => 'authorsTrack',
		)
	);
	?>
	<div class="authors news-rail" data-rail id="authorsTrack">
		<?php
		if ( $q->have_posts() ) :
			while ( $q->have_posts() ) :
				$q->the_post();
				$author_id = get_the_author_meta( 'ID' );
				?>
				<article class="author-card">
					<?php echo get_avatar( $author_id, 120 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<div>
						<h3><?php the_author(); ?></h3>
						<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
					</div>
				</article>
				<?php
			endwhile;
			wp_reset_postdata();
		endif;
		?>
	</div>
</section>
