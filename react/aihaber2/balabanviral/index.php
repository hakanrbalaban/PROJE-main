<?php
/**
 * Main Template File — mixed rails + interleaved category blocks.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$is_home_surface = is_front_page() || is_home();
?>

<main id="primary" class="site-main">

	<?php if ( $is_home_surface && get_theme_mod( 'my_theme_show_hero', true ) ) : ?>
		<?php get_template_part( 'template-parts/home/manset' ); ?>
	<?php endif; ?>

	<?php if ( $is_home_surface && ! is_search() ) : ?>
		<?php
		get_template_part( 'template-parts/home/category-rail' );

		/* —— Viral / Trend (tek satır ray) —— */
		$trend_q = new WP_Query(
			array(
				'posts_per_page'      => 12,
				'orderby'             => 'comment_count',
				'order'               => 'DESC',
				'ignore_sticky_posts' => true,
				'no_found_rows'       => true,
			)
		);
		if ( function_exists( 'my_theme_merge_feature_posts' ) ) {
			$trend_q->posts         = my_theme_merge_feature_posts( $trend_q->posts, 'trending', 12 );
			$trend_q->posts         = my_theme_merge_feature_posts( $trend_q->posts, 'viral', 12 );
			$trend_q->post_count    = count( $trend_q->posts );
		}
		get_template_part(
			'template-parts/home/scroll-rail',
			null,
			array(
				'rail_id'         => 'trendler',
				'rail_title'      => __( 'Viral / Trend', 'balabanviral' ),
				'rail_emoji'      => '🔥',
				'rail_subtitle'   => __( 'Hero + sıralı liste', 'balabanviral' ),
				'rail_query'      => $trend_q,
				'rail_more_url'   => home_url( '/?filter=Trend' ),
				'rail_more_label' => __( 'Tümünü gör', 'balabanviral' ),
				'rail_layout'     => 'viral',
			)
		);

		/* 2 sütun kategori çifti */
		get_template_part( 'template-parts/home/category-blocks', null, array( 'mode' => 'next', 'rows' => 1 ) );

		/* —— En çok okunan —— */
		$read_q = new WP_Query(
			array(
				'posts_per_page'      => 12,
				'meta_key'            => 'my_theme_post_views_count',
				'orderby'             => 'meta_value_num',
				'order'               => 'DESC',
				'ignore_sticky_posts' => true,
				'no_found_rows'       => true,
			)
		);
		if ( empty( $read_q->posts ) ) {
			$read_q = new WP_Query(
				array(
					'posts_per_page'      => 12,
					'orderby'             => 'date',
					'order'               => 'DESC',
					'ignore_sticky_posts' => true,
					'no_found_rows'       => true,
				)
			);
		}
		if ( function_exists( 'my_theme_merge_feature_posts' ) ) {
			$read_q->posts      = my_theme_merge_feature_posts( $read_q->posts, 'popular', 12 );
			$read_q->post_count = count( $read_q->posts );
		}
		get_template_part(
			'template-parts/home/scroll-rail',
			null,
			array(
				'rail_id'         => 'cok-okunan',
				'rail_title'      => __( 'En çok okunan', 'balabanviral' ),
				'rail_emoji'      => '👁',
				'rail_subtitle'   => __( 'Mozaik ızgara', 'balabanviral' ),
				'rail_query'      => $read_q,
				'rail_more_url'   => home_url( '/?filter=Popüler' ),
				'rail_more_label' => __( 'Tümünü gör', 'balabanviral' ),
				'rail_layout'     => 'mosaic',
			)
		);

		/* Tam genişlik kategori + ardından 2 sütun */
		get_template_part( 'template-parts/home/category-blocks', null, array( 'mode' => 'next', 'rows' => 2 ) );

		/* —— En son —— */
		$latest_q = new WP_Query(
			array(
				'posts_per_page'      => 12,
				'orderby'             => 'date',
				'order'               => 'DESC',
				'ignore_sticky_posts' => true,
				'no_found_rows'       => true,
			)
		);
		if ( function_exists( 'my_theme_merge_feature_posts' ) ) {
			$latest_q->posts      = my_theme_merge_feature_posts( $latest_q->posts, 'latest', 12 );
			$latest_q->post_count = count( $latest_q->posts );
		}
		get_template_part(
			'template-parts/home/scroll-rail',
			null,
			array(
				'rail_id'         => 'son-yazilar',
				'rail_title'      => __( 'En son', 'balabanviral' ),
				'rail_emoji'      => '🆕',
				'rail_subtitle'   => __( 'Zikzak kart ızgarası', 'balabanviral' ),
				'rail_query'      => $latest_q,
				'rail_more_url'   => home_url( '/#yazilar' ),
				'rail_more_label' => __( 'Tümünü oku', 'balabanviral' ),
				'rail_layout'     => 'stack',
			)
		);

		get_template_part( 'template-parts/home/category-blocks', null, array( 'mode' => 'next', 'rows' => 1 ) );

		get_template_part( 'template-parts/home/photo-gallery' );

		get_template_part( 'template-parts/home/category-blocks', null, array( 'mode' => 'next', 'rows' => 2 ) );

		get_template_part( 'template-parts/home/video-gallery' );

		/* Kalan kategoriler */
		get_template_part( 'template-parts/home/category-blocks', null, array( 'mode' => 'all' ) );
		?>
	<?php endif; ?>

	<div id="yazilar" class="mx-auto grid max-w-[1280px] scroll-mt-40 gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_300px] md:px-6">
		<div class="content-area min-w-0">
			<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 class="bv-section-title text-2xl font-bold">
						<?php
						if ( is_search() ) {
							printf(
								/* translators: %s search query */
								esc_html__( '“%s” Arama Sonuçları', 'balabanviral' ),
								esc_html( get_search_query() )
							);
						} elseif ( is_category() ) {
							single_cat_title();
						} else {
							esc_html_e( 'Son Yazılar', 'balabanviral' );
						}
						?>
					</h2>
					<p class="bv-section-sub">
						<?php
						if ( is_search() ) {
							esc_html_e( 'Arama sonuçları', 'balabanviral' );
						} else {
							esc_html_e( 'Tarihe göre · 2 sütunlu karışık akış + yan panel', 'balabanviral' );
						}
						?>
					</p>
				</div>
				<?php if ( $is_home_surface && ! is_search() ) : ?>
					<a href="<?php echo esc_url( get_permalink( get_option( 'page_for_posts' ) ) ?: home_url( '/' ) ); ?>" class="magazine-more-link">
						<?php esc_html_e( 'Tüm arşiv', 'balabanviral' ); ?> →
					</a>
				<?php endif; ?>
			</div>

			<?php if ( have_posts() ) : ?>
				<div class="grid gap-4 sm:grid-cols-2">
					<?php
					global $wp_query;
					if ( $wp_query instanceof WP_Query && is_array( $wp_query->posts ) ) {
						$wp_query->posts      = array_values( $wp_query->posts );
						$wp_query->post_count = count( $wp_query->posts );
						$wp_query->rewind_posts();
					}
					while ( have_posts() ) :
						the_post();
						get_template_part( 'template-parts/post/content', get_post_format() );
					endwhile;
					?>
				</div>

				<div class="mt-8 flex justify-center">
					<?php
					the_posts_pagination(
						array(
							'prev_text' => '← ' . __( 'Önceki', 'balabanviral' ),
							'next_text' => __( 'Sonraki', 'balabanviral' ) . ' →',
						)
					);
					?>
				</div>
			<?php else : ?>
				<?php get_template_part( 'template-parts/post/content', 'none' ); ?>
			<?php endif; ?>
		</div>

		<?php get_sidebar(); ?>
	</div>
</main>

<?php
get_footer();
