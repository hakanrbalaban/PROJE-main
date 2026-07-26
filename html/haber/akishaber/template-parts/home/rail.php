<?php
/**
 * Horizontally scrollable news rail.
 *
 * @package AkisHaber
 * @var array $args
 */

$slug     = isset( $args['slug'] ) ? $args['slug'] : '';
$title    = isset( $args['title'] ) ? $args['title'] : __( 'Haber Akışı', 'akishaber' );
$icon     = isset( $args['icon'] ) ? $args['icon'] : akishaber_icon_for_slug( $slug );
$count    = isset( $args['count'] ) ? absint( $args['count'] ) : 10;
$id       = isset( $args['id'] ) ? $args['id'] : ( $slug ? $slug . '-rail' : 'haber-rail' );
$subtitle = isset( $args['subtitle'] ) ? $args['subtitle'] : '';

$query = $slug ? akishaber_query_by_cat( $slug, $count ) : akishaber_latest( $count );
$posts = akishaber_fill_posts( $query, $count );
if ( ! $posts ) {
	return;
}

$rail_id = $id . '-track';
?>
<section class="section container news-rail-section" id="<?php echo esc_attr( $id ); ?>">
	<?php
	akishaber_section_head(
		array(
			'title'    => $title,
			'subtitle' => $subtitle,
			'icon'     => $icon,
			'rail'     => $rail_id,
			'link'     => $slug ? akishaber_cat_link( $slug ) : '',
		)
	);
	?>
	<div class="news-rail" data-rail id="<?php echo esc_attr( $rail_id ); ?>">
		<?php
		foreach ( $posts as $post ) :
			setup_postdata( $post );
			?>
			<article <?php post_class( 'rail-card', $post ); ?>>
				<a class="rail-card__media" href="<?php the_permalink(); ?>">
					<?php akishaber_the_thumb( 'akishaber-card' ); ?>
					<span class="rail-card__cat"><?php akishaber_icon( akishaber_icon_for_slug( $slug ), 13 ); ?></span>
				</a>
				<div class="rail-card__body">
					<?php akishaber_the_category_badge(); ?>
					<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
					<time><?php akishaber_icon( 'clock', 12 ); ?><?php echo esc_html( akishaber_time_ago() ); ?></time>
				</div>
			</article>
			<?php
		endforeach;
		wp_reset_postdata();
		?>
	</div>
</section>
