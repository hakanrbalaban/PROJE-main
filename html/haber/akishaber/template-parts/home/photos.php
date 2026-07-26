<?php
/**
 * Photo gallery section with lightbox support.
 *
 * @package AkisHaber
 */

$query = akishaber_query_by_cat( 'foto-galeri', 7 );
$posts = akishaber_fill_posts( $query, 7 );
if ( ! $posts ) {
	return;
}
?>
<section class="section section--alt" id="foto">
	<div class="container">
		<?php
		akishaber_section_head(
			array(
				'title'    => __( 'Foto Galeri', 'akishaber' ),
				'subtitle' => __( 'Kareler büyütmek için tıklayın', 'akishaber' ),
				'icon'     => 'foto',
				'link'     => akishaber_cat_link( 'foto-galeri' ),
			)
		);
		?>
		<div class="gallery-grid">
			<?php
			foreach ( $posts as $index => $post ) :
				setup_postdata( $post );
				$images = akishaber_gallery_images( $post->ID, 12 );
				$total  = count( $images );
				?>
				<figure class="gallery-tile<?php echo 0 === $index ? ' gallery-tile--lead' : ''; ?>">
					<button
						type="button"
						class="gallery-tile__open"
						data-gallery="<?php echo esc_attr( wp_json_encode( $images ) ); ?>"
						data-title="<?php the_title_attribute(); ?>"
						data-link="<?php the_permalink(); ?>"
						aria-label="<?php echo esc_attr( sprintf( /* translators: %s: gallery title. */ __( '%s galerisini aç', 'akishaber' ), get_the_title() ) ); ?>"
					>
						<?php akishaber_the_thumb( 0 === $index ? 'akishaber-hero' : 'akishaber-card' ); ?>
						<span class="gallery-tile__overlay">
							<span class="gallery-tile__zoom"><?php akishaber_icon( 'expand', 22 ); ?></span>
						</span>
						<span class="gallery-tile__count">
							<?php akishaber_icon( 'foto', 13 ); ?>
							<?php echo esc_html( (string) $total ); ?>
						</span>
					</button>
					<figcaption class="gallery-tile__caption">
						<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
					</figcaption>
				</figure>
				<?php
			endforeach;
			wp_reset_postdata();
			?>
		</div>
	</div>
</section>
