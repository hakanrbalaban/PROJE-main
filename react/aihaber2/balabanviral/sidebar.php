<?php
/**
 * The sidebar containing the main widget area.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$show_demo = (bool) get_theme_mod( 'my_theme_show_demo_widgets', false );

$widget_args = array(
	'before_widget' => '<section class="widget animate-rise %s">',
	'after_widget'  => '</section>',
	'before_title'  => '<h3 class="widget-title">',
	'after_title'   => '</h3>',
);
?>

<aside id="secondary" class="widget-area space-y-4" aria-label="<?php esc_attr_e( 'Sidebar', 'balabanviral' ); ?>">
	<?php
	// Optional demo boxes (Customizer) — sample data only.
	if ( $show_demo ) {
		get_template_part( 'template-parts/sidebar/viral-widgets' );
	}

	if ( is_active_sidebar( 'sidebar-1' ) ) {
		dynamic_sidebar( 'sidebar-1' );
	} else {
		// Empty widget area: ThemeForest-safe fallbacks (real data, not demo).
		the_widget(
			'My_Theme_Recent_Comments_Widget',
			array(
				'title'  => __( 'Recent Comments', 'balabanviral' ),
				'number' => 5,
			),
			array_merge(
				$widget_args,
				array(
					'before_widget' => sprintf( $widget_args['before_widget'], 'widget_my_theme_recent_comments' ),
				)
			)
		);
		the_widget(
			'My_Theme_Popular_Posts_Widget',
			array(
				'title'  => __( 'Popular Posts', 'balabanviral' ),
				'number' => 5,
			),
			array_merge(
				$widget_args,
				array(
					'before_widget' => sprintf( $widget_args['before_widget'], 'widget_my_theme_popular_posts' ),
				)
			)
		);
	}
	?>
</aside>
