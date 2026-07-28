<?php
/**
 * Collect media items for photo/video archives (CPT + flagged posts).
 *
 * @package BalabanViral
 *
 * @param string $mode 'photo'|'video'.
 * @return array<int, array<string, string>>
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build unified media item list.
 *
 * @param string $mode photo|video.
 * @return array<int, array{id:string,title:string,src:string,embed:string,url:string,date:string}>
 */
function my_theme_collect_media_items( $mode = 'photo' ) {
	$mode  = ( 'video' === $mode ) ? 'video' : 'photo';
	$items = array();
	$seen  = array();

	$cpt = ( 'video' === $mode ) ? 'bv_video' : 'bv_photo';
	$q   = new WP_Query(
		array(
			'post_type'           => $cpt,
			'posts_per_page'      => 40,
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
			'orderby'             => 'date',
			'order'               => 'DESC',
		)
	);

	foreach ( $q->posts as $p ) {
		$pid = (int) $p->ID;
		$seen[ $pid ] = true;
		$items[]      = my_theme_format_media_item( $pid, $mode );
	}

	$flagged = my_theme_get_posts_by_feature( $mode, 40 );
	foreach ( $flagged as $p ) {
		$pid = (int) $p->ID;
		if ( isset( $seen[ $pid ] ) ) {
			continue;
		}
		$seen[ $pid ] = true;
		$items[]      = my_theme_format_media_item( $pid, $mode );
	}

	return $items;
}

/**
 * Format one media card payload.
 *
 * @param int    $pid  Post ID.
 * @param string $mode photo|video.
 * @return array{id:string,title:string,src:string,embed:string,url:string,date:string}
 */
function my_theme_format_media_item( $pid, $mode ) {
	$url   = get_permalink( $pid );
	$title = get_the_title( $pid );
	$date  = get_the_date( 'j M Y', $pid );
	$embed = '';
	$src   = get_the_post_thumbnail_url( $pid, 'large' );

	if ( 'video' === $mode ) {
		$vurl  = (string) get_post_meta( $pid, '_bv_video_url', true );
		$embed = function_exists( 'my_theme_video_embed_url' ) ? my_theme_video_embed_url( $vurl ) : '';
		if ( ! $src && function_exists( 'my_theme_video_poster_url' ) ) {
			$src = my_theme_video_poster_url( $vurl );
		}
	}

	if ( ! $src ) {
		$src = function_exists( 'my_theme_get_cover_url' ) ? my_theme_get_cover_url( $pid ) : '';
	}

	return array(
		'id'    => (string) $pid,
		'title' => $title,
		'src'   => (string) $src,
		'embed' => (string) $embed,
		'url'   => (string) $url,
		'date'  => (string) $date,
	);
}
