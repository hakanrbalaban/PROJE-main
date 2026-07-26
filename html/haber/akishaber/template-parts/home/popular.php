<?php
/**
 * Most read / popular.
 *
 * @package AkisHaber
 */

$q = new WP_Query(
	array(
		'posts_per_page'      => 12,
		'orderby'             => 'comment_count',
		'order'               => 'DESC',
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
	)
);
if ( ! $q->have_posts() ) {
	$q = akishaber_latest( 12 );
}
$posts = array();
while ( $q->have_posts() ) {
	$q->the_post();
	$posts[] = get_post();
}
wp_reset_postdata();
?>
<section class="section container" id="cok-okunanlar">
	<?php
	akishaber_section_head(
		array(
			'title'    => __( 'Günün Çok Okunanları', 'akishaber' ),
			'subtitle' => __( 'Son 24 saatte en çok tıklanan haberler', 'akishaber' ),
			'icon'     => 'fire',
		)
	);
	?>
	<div class="popular-grid">
		<ol class="popular-list">
			<?php
			for ( $i = 0; $i < min( 6, count( $posts ) ); $i++ ) :
				$post = $posts[ $i ];
				setup_postdata( $post );
				?>
				<li>
					<a href="<?php the_permalink(); ?>">
						<em><?php echo esc_html( str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></em>
						<?php akishaber_the_category_badge( null, false ); ?>
						<strong><?php the_title(); ?></strong>
					</a>
				</li>
				<?php
				wp_reset_postdata();
			endfor;
			?>
		</ol>
		<ol class="popular-list" start="7">
			<?php
			for ( $i = 6; $i < count( $posts ); $i++ ) :
				$post = $posts[ $i ];
				setup_postdata( $post );
				?>
				<li>
					<a href="<?php the_permalink(); ?>">
						<em><?php echo esc_html( str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></em>
						<?php akishaber_the_category_badge( null, false ); ?>
						<strong><?php the_title(); ?></strong>
					</a>
				</li>
				<?php
				wp_reset_postdata();
			endfor;
			?>
		</ol>
	</div>
</section>
