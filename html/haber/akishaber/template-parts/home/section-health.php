<?php
/**
 * Health slider section.
 *
 * @package AkisHaber
 * @var array $args
 */

$slug  = isset( $args['slug'] ) ? $args['slug'] : 'saglik';
$title = isset( $args['title'] ) ? $args['title'] : __( 'Sağlık', 'akishaber' );
$id    = isset( $args['id'] ) ? $args['id'] : 'saglik';

$q = akishaber_query_by_cat( $slug, 10 );
if ( ! $q->have_posts() ) {
	$q = akishaber_latest( 10 );
}
$posts = array();
while ( $q->have_posts() ) {
	$q->the_post();
	$posts[] = get_post();
}
wp_reset_postdata();
?>
<section class="section container" id="<?php echo esc_attr( $id ); ?>">
	<?php
	akishaber_section_head(
		array(
			'title' => $title,
			'icon'  => 'saglik',
			'link'  => akishaber_cat_link( $slug ),
		)
	);
	?>
	<div class="health-layout">
		<div class="health-slider" id="healthSlider">
			<?php
			for ( $i = 0; $i < min( 5, count( $posts ) ); $i++ ) :
				$post = $posts[ $i ];
				setup_postdata( $post );
				?>
				<article class="health-slide<?php echo 0 === $i ? ' is-active' : ''; ?>">
					<?php akishaber_the_thumb( 'akishaber-hero' ); ?>
					<div>
						<span class="flash-tag"><?php esc_html_e( 'SON DAKİKA', 'akishaber' ); ?></span>
						<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
					</div>
				</article>
				<?php
				wp_reset_postdata();
			endfor;
			?>
			<div class="health-dots" id="healthDots"></div>
		</div>
		<ul class="bullet-list">
			<?php
			for ( $i = 5; $i < count( $posts ); $i++ ) :
				$post = $posts[ $i ];
				setup_postdata( $post );
				?>
				<li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
				<?php
				wp_reset_postdata();
			endfor;
			?>
		</ul>
	</div>
</section>
