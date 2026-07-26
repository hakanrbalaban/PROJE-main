<?php
/**
 * Category highlight columns.
 *
 * @package AkisHaber
 */

$blocks = array(
	array( 'slug' => 'ekonomi', 'title' => __( 'Ekonomide Öne Çıkanlar', 'akishaber' ) ),
	array( 'slug' => 'spor', 'title' => __( 'Sporda Öne Çıkanlar', 'akishaber' ) ),
	array( 'slug' => 'dunya', 'title' => __( 'Dünyada Öne Çıkanlar', 'akishaber' ) ),
);

$used = array();
?>
<section class="section section--alt" id="one-cikanlar">
	<div class="container">
		<?php
		akishaber_section_head(
			array(
				'title' => __( 'Öne Çıkanlar', 'akishaber' ),
				'icon'  => 'fire',
			)
		);
		?>
		<div class="highlights">
			<?php
			foreach ( $blocks as $block ) :
				$query = akishaber_query_by_cat( $block['slug'], 5 );
				$items = akishaber_fill_posts( $query, 5, $used );
				if ( ! $items ) {
					continue;
				}
				$used = array_merge( $used, wp_list_pluck( $items, 'ID' ) );
				$lead = array_shift( $items );
				?>
				<div class="highlight-col">
					<h3 class="highlight-col__title">
						<span class="highlight-col__icon"><?php akishaber_icon( akishaber_icon_for_slug( $block['slug'] ), 16 ); ?></span>
						<a href="<?php echo esc_url( akishaber_cat_link( $block['slug'] ) ); ?>"><?php echo esc_html( $block['title'] ); ?></a>
					</h3>

					<?php
					// The global $post must be reassigned so template tags read the right post.
					$post = $lead;
					setup_postdata( $post );
					?>
					<article <?php post_class( 'highlight-lead', $post ); ?>>
						<a class="highlight-lead__media" href="<?php the_permalink(); ?>">
							<?php akishaber_the_thumb( 'akishaber-card' ); ?>
							<span class="highlight-lead__badge"><?php akishaber_icon( 'fire', 13 ); ?></span>
						</a>
						<h4><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
						<time><?php akishaber_icon( 'clock', 12 ); ?><?php echo esc_html( akishaber_time_ago() ); ?></time>
					</article>
					<?php wp_reset_postdata(); ?>

					<?php if ( $items ) : ?>
						<ul class="highlight-list">
							<?php
							foreach ( $items as $post ) :
								setup_postdata( $post );
								?>
								<li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
								<?php
							endforeach;
							wp_reset_postdata();
							?>
						</ul>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>
