<?php
/**
 * Video gallery section.
 *
 * @package AkisHaber
 * @var array $args
 */

$slug  = isset( $args['slug'] ) ? $args['slug'] : 'video';
$title = isset( $args['title'] ) ? $args['title'] : __( 'Video Galeri', 'akishaber' );
$id    = isset( $args['id'] ) ? $args['id'] : 'video';

$q = akishaber_query_by_cat( $slug, 6 );
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
<section class="section container" id="<?php echo esc_attr( $id ); ?>">
	<?php
	akishaber_section_head(
		array(
			'title' => $title,
			'icon'  => 'video',
			'link'  => akishaber_cat_link( $slug ),
		)
	);
	?>
	<div class="video-grid">
		<?php if ( ! empty( $posts[0] ) ) : ?>
			<?php
			$post = $posts[0];
			setup_postdata( $post );
			?>
			<article class="video-card video-card--main">
				<a href="<?php the_permalink(); ?>">
					<?php akishaber_the_thumb( 'akishaber-hero' ); ?>
					<span class="play-btn" aria-hidden="true"></span>
					<div class="video-card__caption"><h3><?php the_title(); ?></h3></div>
				</a>
			</article>
			<?php wp_reset_postdata(); ?>
		<?php endif; ?>
		<div class="video-side">
			<?php
			for ( $i = 1; $i < count( $posts ) && $i < 4; $i++ ) :
				$post = $posts[ $i ];
				setup_postdata( $post );
				?>
				<article class="video-card">
					<a href="<?php the_permalink(); ?>">
						<?php akishaber_the_thumb( 'akishaber-card' ); ?>
						<span class="play-btn play-btn--sm" aria-hidden="true"></span>
						<h3><?php the_title(); ?></h3>
					</a>
				</article>
				<?php
				wp_reset_postdata();
			endfor;
			?>
		</div>
	</div>
	<?php if ( count( $posts ) > 4 ) : ?>
		<ul class="bullet-list mt">
			<?php
			for ( $i = 4; $i < count( $posts ); $i++ ) :
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
</section>
