<?php
/**
 * Featured category section (large + stack).
 *
 * @package AkisHaber
 * @var array $args
 */

$slug  = isset( $args['slug'] ) ? $args['slug'] : 'politika';
$title = isset( $args['title'] ) ? $args['title'] : '';
$id    = isset( $args['id'] ) ? $args['id'] : $slug;
$q     = akishaber_query_by_cat( $slug, 7 );
if ( ! $q->have_posts() ) {
	$q = akishaber_latest( 7 );
}
?>
<section class="section container" id="<?php echo esc_attr( $id ); ?>">
	<?php
	akishaber_section_head(
		array(
			'title' => $title,
			'icon'  => akishaber_icon_for_slug( $slug ),
			'link'  => akishaber_cat_link( $slug ),
		)
	);
	?>
	<div class="grid-featured">
		<?php
		$i = 0;
		if ( $q->have_posts() ) :
			while ( $q->have_posts() ) :
				$q->the_post();
				if ( 0 === $i ) :
					?>
					<article <?php post_class( 'story story--lg' ); ?>>
						<a href="<?php the_permalink(); ?>" class="story__media"><?php akishaber_the_thumb( 'akishaber-card' ); ?></a>
						<div class="story__body">
							<?php akishaber_the_category_badge(); ?>
							<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
							<p><?php echo esc_html( wp_trim_words( get_the_excerpt(), 20 ) ); ?></p>
						</div>
					</article>
					<div class="story-stack">
					<?php
				else :
					?>
					<article <?php post_class( 'story story--row' ); ?>>
						<a href="<?php the_permalink(); ?>" class="story__media"><?php akishaber_the_thumb( 'akishaber-thumb' ); ?></a>
						<div class="story__body"><h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3></div>
					</article>
					<?php
				endif;
				$i++;
			endwhile;
			if ( $i > 0 ) {
				echo '</div>';
			}
			wp_reset_postdata();
		endif;
		?>
	</div>
</section>
