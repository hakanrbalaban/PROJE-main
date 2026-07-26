<?php
/**
 * Grid category section.
 *
 * @package AkisHaber
 * @var array $args
 */

$slug      = isset( $args['slug'] ) ? $args['slug'] : 'ekonomi';
$title     = isset( $args['title'] ) ? $args['title'] : '';
$id        = isset( $args['id'] ) ? $args['id'] : $slug;
$alt       = ! empty( $args['alt'] );
$with_list = ! empty( $args['with_list'] );
$count     = isset( $args['count'] ) ? (int) $args['count'] : 3;
$total     = $with_list ? $count + 8 : $count;

$q = akishaber_query_by_cat( $slug, $total );
if ( ! $q->have_posts() ) {
	$q = akishaber_latest( $total );
}

$section_class = $alt ? 'section section--alt' : 'section container';
?>
<section class="<?php echo esc_attr( $section_class ); ?>" id="<?php echo esc_attr( $id ); ?>">
	<?php echo $alt ? '<div class="container">' : ''; ?>
	<?php
	akishaber_section_head(
		array(
			'title' => $title,
			'icon'  => akishaber_icon_for_slug( $slug ),
			'link'  => akishaber_cat_link( $slug ),
		)
	);
	?>
	<div class="grid-3">
		<?php
		$i = 0;
		$list_posts = array();
		if ( $q->have_posts() ) :
			while ( $q->have_posts() ) :
				$q->the_post();
				if ( $i < $count ) :
					?>
					<article <?php post_class( 'story' ); ?>>
						<a href="<?php the_permalink(); ?>" class="story__media">
							<?php akishaber_the_thumb( 'akishaber-card' ); ?>
							<?php if ( 0 === $i && 'ekonomi' === $slug ) : ?>
								<span class="story__badge"><?php esc_html_e( 'ANALİZ', 'akishaber' ); ?></span>
							<?php endif; ?>
						</a>
						<div class="story__body">
							<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
						</div>
					</article>
					<?php
				else :
					$list_posts[] = array(
						'url'   => get_permalink(),
						'title' => get_the_title(),
					);
				endif;
				$i++;
			endwhile;
			wp_reset_postdata();
		endif;
		?>
	</div>
	<?php if ( $with_list && $list_posts ) : ?>
		<ul class="bullet-list">
			<?php foreach ( $list_posts as $item ) : ?>
				<li><a href="<?php echo esc_url( $item['url'] ); ?>"><?php echo esc_html( $item['title'] ); ?></a></li>
			<?php endforeach; ?>
		</ul>
	<?php endif; ?>
	<?php echo $alt ? '</div>' : ''; ?>
</section>
