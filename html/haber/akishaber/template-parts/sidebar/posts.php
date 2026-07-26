<?php
/**
 * Post list widget body.
 *
 * @package AkisHaber
 * @var array $args
 */

$type     = isset( $args['type'] ) ? $args['type'] : 'latest';
$count    = isset( $args['count'] ) ? absint( $args['count'] ) : 5;
$thumbs   = isset( $args['thumbs'] ) ? (bool) $args['thumbs'] : true;
$numbered = ! empty( $args['numbered'] );
$category = isset( $args['category'] ) ? $args['category'] : '';

$query_args = array(
	'posts_per_page'      => $count,
	'ignore_sticky_posts' => true,
	'no_found_rows'       => true,
	'post_status'         => 'publish',
);

switch ( $type ) {
	case 'popular':
	case 'commented':
		$query_args['orderby'] = 'comment_count';
		$query_args['order']   = 'DESC';
		break;
	case 'random':
		$query_args['orderby'] = 'rand';
		break;
	case 'oldest':
		$query_args['orderby'] = 'date';
		$query_args['order']   = 'ASC';
		break;
}

if ( $category ) {
	$query = akishaber_query_by_cat( $category, $count, $query_args );
} else {
	$query = new WP_Query( $query_args );
}

if ( ! $query->have_posts() ) {
	$query = akishaber_latest( $count );
}

$list_class = 'sidebar-news';
if ( $thumbs ) {
	$list_class .= ' sidebar-news--thumbs';
}
if ( $numbered ) {
	$list_class .= ' sidebar-news--numbered';
}
?>
<ul class="<?php echo esc_attr( $list_class ); ?>">
	<?php
	$index = 1;
	while ( $query->have_posts() ) :
		$query->the_post();
		?>
		<li>
			<a href="<?php the_permalink(); ?>">
				<?php if ( $numbered ) : ?>
					<em><?php echo esc_html( str_pad( (string) $index, 2, '0', STR_PAD_LEFT ) ); ?></em>
				<?php elseif ( $thumbs ) : ?>
					<?php akishaber_the_thumb( 'akishaber-thumb' ); ?>
				<?php endif; ?>
				<span>
					<?php if ( $thumbs && ! $numbered ) : ?>
						<?php akishaber_the_category_badge( null, false ); ?>
					<?php endif; ?>
					<strong><?php the_title(); ?></strong>
					<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>">
						<?php akishaber_icon( 'clock', 12 ); ?>
						<?php echo esc_html( akishaber_time_ago() ); ?>
					</time>
				</span>
			</a>
		</li>
		<?php
		$index++;
	endwhile;
	wp_reset_postdata();
	?>
</ul>
