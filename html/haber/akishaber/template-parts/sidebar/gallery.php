<?php
/**
 * Mini photo gallery widget body.
 *
 * @package AkisHaber
 * @var array $args
 */

$count = isset( $args['count'] ) ? absint( $args['count'] ) : 6;
$query = akishaber_query_by_cat( 'foto-galeri', $count );
if ( ! $query->have_posts() ) {
	$query = akishaber_latest( $count );
}
?>
<div class="w-gallery">
	<?php
	while ( $query->have_posts() ) :
		$query->the_post();
		?>
		<a
			class="w-gallery__item"
			href="<?php echo esc_url( akishaber_thumb_url( 'akishaber-hero' ) ); ?>"
			data-lightbox="sidebar-gallery"
			data-caption="<?php the_title_attribute(); ?>"
			data-link="<?php the_permalink(); ?>"
		>
			<?php akishaber_the_thumb( 'akishaber-thumb' ); ?>
			<span class="w-gallery__zoom"><?php akishaber_icon( 'expand', 16 ); ?></span>
		</a>
		<?php
	endwhile;
	wp_reset_postdata();
	?>
</div>
