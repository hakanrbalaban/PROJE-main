<?php
/**
 * Action & Filter Hooks
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Filter Excerpt Length
 *
 * @param int $length Excerpt word count.
 * @return int Modified length.
 */
function my_theme_custom_excerpt_length( $length ) {
	return 22;
}
add_filter( 'excerpt_length', 'my_theme_custom_excerpt_length', 999 );

/**
 * Filter Excerpt More Readability String
 *
 * @param string $more Default more text.
 * @return string Modified more text.
 */
function my_theme_excerpt_more( $more ) {
	return '...';
}
add_filter( 'excerpt_more', 'my_theme_excerpt_more' );

/**
 * Add Custom Body Classes
 *
 * @param array $classes Existing body classes.
 * @return array Modified body classes.
 */
function my_theme_body_classes( $classes ) {
	$classes[] = 'dark-theme-active';

	if ( is_singular() ) {
		$classes[] = 'singular-post-view';
	}

	return $classes;
}
add_filter( 'body_class', 'my_theme_body_classes' );

/**
 * Pingback Header Meta Hook
 */
function my_theme_pingback_header() {
	if ( is_singular() && pings_open() ) {
		printf( '<link rel="pingback" href="%s">', esc_url( get_bloginfo( 'pingback_url' ) ) );
	}
}
add_action( 'wp_head', 'my_theme_pingback_header' );

/**
 * Flush rewrite rules when theme version changes (fixes pretty-permalink 404s).
 */
function my_theme_maybe_flush_rewrites() {
	$stored = get_option( 'my_theme_rewrite_version', '' );
	if ( $stored === MY_THEME_VERSION ) {
		return;
	}
	flush_rewrite_rules( false );
	update_option( 'my_theme_rewrite_version', MY_THEME_VERSION );
}
add_action( 'init', 'my_theme_maybe_flush_rewrites', 99 );

/**
 * Register public query vars for viral filters.
 *
 * @param string[] $vars Vars.
 * @return string[]
 */
function my_theme_query_vars( $vars ) {
	$vars[] = 'filter';
	return $vars;
}
add_filter( 'query_vars', 'my_theme_query_vars' );

/**
 * Apply viral / emoji filters on the main home loop.
 *
 * @param WP_Query $query Query.
 */
function my_theme_apply_home_filters( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}
	if ( ! $query->is_home() && ! $query->is_front_page() ) {
		return;
	}

	$filter = get_query_var( 'filter' );
	if ( ! $filter && isset( $_GET['filter'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$filter = sanitize_text_field( wp_unslash( $_GET['filter'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	}
	if ( ! $filter ) {
		// Keep latest posts chronological on home.
		if ( ! $query->get( 'orderby' ) ) {
			$query->set( 'orderby', 'date' );
			$query->set( 'order', 'DESC' );
		}
		return;
	}

	$filter = rawurldecode( $filter );

	switch ( $filter ) {
		case 'Trend':
			$query->set(
				'meta_query',
				array(
					'relation' => 'OR',
					array(
						'key'     => '_bv_feat_trending',
						'value'   => '1',
						'compare' => '=',
					),
					array(
						'key'     => '_bv_feat_viral',
						'value'   => '1',
						'compare' => '=',
					),
				)
			);
			$query->set( 'orderby', 'date' );
			$query->set( 'order', 'DESC' );
			break;
		case 'Viral':
			$query->set(
				'meta_query',
				array(
					array(
						'key'     => '_bv_feat_viral',
						'value'   => '1',
						'compare' => '=',
					),
				)
			);
			break;
		case 'Popüler':
			$query->set(
				'meta_query',
				array(
					'relation' => 'OR',
					array(
						'key'     => '_bv_feat_popular',
						'value'   => '1',
						'compare' => '=',
					),
					array(
						'key'     => 'my_theme_post_views_count',
						'compare' => 'EXISTS',
					),
				)
			);
			$query->set( 'meta_key', 'my_theme_post_views_count' );
			$query->set( 'orderby', 'meta_value_num' );
			$query->set( 'order', 'DESC' );
			break;
		case 'Sevilen':
			$query->set(
				'meta_query',
				array(
					array(
						'key'     => '_bv_feat_loved',
						'value'   => '1',
						'compare' => '=',
					),
				)
			);
			break;
		case 'Harika':
			$query->set(
				'meta_query',
				array(
					array(
						'key'     => '_bv_feat_harika',
						'value'   => '1',
						'compare' => '=',
					),
				)
			);
			break;
		case 'Komik':
			$query->set(
				'meta_query',
				array(
					array(
						'key'     => '_bv_feat_komik',
						'value'   => '1',
						'compare' => '=',
					),
				)
			);
			break;
		default:
			break;
	}
}
add_action( 'pre_get_posts', 'my_theme_apply_home_filters' );

/**
 * Flush on theme switch.
 */
function my_theme_after_switch() {
	// Only when BalabanViral itself is activated (not when leaving it).
	$theme = wp_get_theme();
	if ( 'balabanviral' !== $theme->get_stylesheet() && 'balabanviral' !== $theme->get_template() ) {
		return;
	}
	flush_rewrite_rules( false );
	update_option( 'my_theme_rewrite_version', MY_THEME_VERSION );
}
add_action( 'after_switch_theme', 'my_theme_after_switch' );

/**
 * Prefer CPT archives over conflicting category slugs (foto-galeri / video-galeri).
 *
 * @param array $query_vars Request vars.
 * @return array
 */
function my_theme_prefer_media_cpt_archives( $query_vars ) {
	if ( is_admin() ) {
		return $query_vars;
	}
	if ( empty( $query_vars['category_name'] ) ) {
		return $query_vars;
	}

	$slug = $query_vars['category_name'];
	if ( 'video-galeri' === $slug ) {
		unset( $query_vars['category_name'], $query_vars['cat'] );
		$query_vars['post_type'] = 'bv_video';
	} elseif ( 'foto-galeri' === $slug ) {
		unset( $query_vars['category_name'], $query_vars['cat'] );
		$query_vars['post_type'] = 'bv_photo';
	}

	return $query_vars;
}
add_filter( 'request', 'my_theme_prefer_media_cpt_archives' );
