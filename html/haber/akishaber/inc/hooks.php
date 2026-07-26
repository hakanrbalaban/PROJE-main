<?php
/**
 * Theme actions and filters.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add contextual body classes.
 *
 * @param string[] $classes Body classes.
 * @return string[]
 */
function akishaber_body_classes( $classes ) {
	if ( ! is_singular() ) {
		$classes[] = 'hfeed';
	}
	if ( is_front_page() ) {
		$classes[] = 'akis-front';
	}
	if ( is_active_sidebar( 'sidebar-1' ) ) {
		$classes[] = 'has-sidebar';
	}

	return $classes;
}
add_filter( 'body_class', 'akishaber_body_classes' );

/**
 * Keep excerpts suitable for news cards.
 *
 * @param int $length Existing length.
 * @return int
 */
function akishaber_excerpt_length( $length ) {
	return is_admin() ? $length : 24;
}
add_filter( 'excerpt_length', 'akishaber_excerpt_length' );

/**
 * Custom excerpt suffix.
 *
 * @return string
 */
function akishaber_excerpt_more() {
	return '&hellip;';
}
add_filter( 'excerpt_more', 'akishaber_excerpt_more' );

/**
 * Apply public category/archive filters to the main query.
 *
 * @param WP_Query $query Query instance.
 */
function akishaber_filter_main_query( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}

	if ( ! ( $query->is_archive() || $query->is_home() || $query->is_search() ) ) {
		return;
	}

	$sort = akishaber_archive_sort();
	switch ( $sort ) {
		case 'oldest':
			$query->set( 'order', 'ASC' );
			$query->set( 'orderby', 'date' );
			break;
		case 'popular':
		case 'commented':
			$query->set( 'order', 'DESC' );
			$query->set( 'orderby', 'comment_count' );
			break;
		default:
			$query->set( 'order', 'DESC' );
			$query->set( 'orderby', 'date' );
			break;
	}

	$period = akishaber_archive_period();
	if ( 'all' !== $period ) {
		$after = array(
			'today' => '1 day ago',
			'week'  => '1 week ago',
			'month' => '1 month ago',
		);
		$query->set(
			'date_query',
			array(
				array(
					'after'     => $after[ $period ],
					'inclusive' => true,
				),
			)
		);
	}

	if ( isset( $_GET['haber_kategori'] ) ) {
		$category_id = absint( wp_unslash( $_GET['haber_kategori'] ) );
		if ( $category_id > 0 ) {
			$query->set( 'cat', $category_id );
		}
	}
}
add_action( 'pre_get_posts', 'akishaber_filter_main_query' );

/**
 * Create essential terms and starter menu after activation.
 */
function akishaber_after_switch_theme() {
	$categories = array(
		'gundem'      => __( 'Gündem', 'akishaber' ),
		'politika'    => __( 'Politika', 'akishaber' ),
		'ekonomi'     => __( 'Ekonomi', 'akishaber' ),
		'spor'        => __( 'Spor', 'akishaber' ),
		'magazin'     => __( 'Magazin', 'akishaber' ),
		'saglik'      => __( 'Sağlık', 'akishaber' ),
		'teknoloji'   => __( 'Teknoloji', 'akishaber' ),
		'dunya'       => __( 'Dünya', 'akishaber' ),
		'foto-galeri' => __( 'Foto Galeri', 'akishaber' ),
		'video'       => __( 'Video', 'akishaber' ),
		'yazarlar'    => __( 'Yazarlar', 'akishaber' ),
		'ilanlar'     => __( 'Resmi İlanlar', 'akishaber' ),
		'son-dakika'  => __( 'Son Dakika', 'akishaber' ),
	);

	foreach ( $categories as $slug => $name ) {
		if ( ! term_exists( $slug, 'category' ) ) {
			wp_insert_term( $name, 'category', array( 'slug' => $slug ) );
		}
	}

	if ( ! get_option( 'akishaber_demo_seeded' ) && (int) wp_count_posts( 'post' )->publish < 5 ) {
		akishaber_seed_demo_posts();
	}

	$locations = get_theme_mod( 'nav_menu_locations', array() );
	if ( empty( $locations['primary'] ) ) {
		$menu = wp_get_nav_menu_object( 'Akış Ana Menü' );
		$menu_id = $menu ? (int) $menu->term_id : wp_create_nav_menu( 'Akış Ana Menü' );

		if ( ! is_wp_error( $menu_id ) && ! $menu ) {
			foreach ( array( 'gundem', 'politika', 'ekonomi', 'spor', 'magazin', 'saglik', 'teknoloji' ) as $position => $slug ) {
				$term = get_term_by( 'slug', $slug, 'category' );
				if ( $term && ! is_wp_error( $term ) ) {
					wp_update_nav_menu_item(
						$menu_id,
						0,
						array(
							'menu-item-title'     => $term->name,
							'menu-item-object'    => 'category',
							'menu-item-object-id' => $term->term_id,
							'menu-item-type'      => 'taxonomy',
							'menu-item-status'    => 'publish',
							'menu-item-position'  => $position + 1,
						)
					);
				}
			}
		}

		if ( ! is_wp_error( $menu_id ) ) {
			$locations['primary'] = (int) $menu_id;
			set_theme_mod( 'nav_menu_locations', $locations );
		}
	}
}
add_action( 'after_switch_theme', 'akishaber_after_switch_theme' );
