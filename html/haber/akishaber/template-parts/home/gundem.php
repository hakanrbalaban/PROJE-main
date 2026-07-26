<?php
/**
 * Gündem numbered section.
 *
 * @package AkisHaber
 */

$q = akishaber_query_by_cat( 'gundem', 7 );
if ( ! $q->have_posts() ) {
	$q = akishaber_latest( 7 );
}
$posts = array();
while ( $q->have_posts() ) {
	$q->the_post();
	$posts[] = get_post();
}
wp_reset_postdata();
?>
<section class="section section--alt" id="gundem">
	<div class="container">
		<?php
		akishaber_section_head(
			array(
				'title' => __( 'Gündem', 'akishaber' ),
				'icon'  => 'gundem',
				'link'  => akishaber_cat_link( 'gundem' ),
			)
		);
		?>
		<div class="grid-numbered">
			<ol class="numbered-news">
				<?php
				for ( $i = 0; $i < min( 6, count( $posts ) ); $i++ ) :
					$post = $posts[ $i ];
					setup_postdata( $post );
					?>
					<li>
						<a href="<?php the_permalink(); ?>">
							<span><?php echo esc_html( str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span>
							<?php the_title(); ?>
						</a>
					</li>
					<?php
					wp_reset_postdata();
				endfor;
				?>
			</ol>
			<div class="gundem-featured">
				<?php if ( ! empty( $posts[0] ) ) : ?>
					<?php
					$post = $posts[0];
					setup_postdata( $post );
					?>
					<article <?php post_class( 'story story--overlay', $post ); ?>>
						<a href="<?php the_permalink(); ?>" class="story__media"><?php akishaber_the_thumb( 'akishaber-hero' ); ?></a>
						<div class="story__body">
							<?php akishaber_the_category_badge(); ?>
							<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
						</div>
					</article>
					<?php wp_reset_postdata(); ?>
				<?php endif; ?>
			</div>
		</div>
	</div>
</section>
