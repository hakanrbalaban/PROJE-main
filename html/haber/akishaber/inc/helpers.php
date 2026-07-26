<?php
/**
 * General helper functions.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return permitted archive sort value.
 *
 * @return string
 */
function akishaber_archive_sort() {
	$sort    = isset( $_GET['sirala'] ) ? sanitize_key( wp_unslash( $_GET['sirala'] ) ) : 'newest';
	$allowed = array( 'newest', 'oldest', 'popular', 'commented' );

	return in_array( $sort, $allowed, true ) ? $sort : 'newest';
}

/**
 * Return requested archive date range.
 *
 * @return string
 */
function akishaber_archive_period() {
	$period  = isset( $_GET['donem'] ) ? sanitize_key( wp_unslash( $_GET['donem'] ) ) : 'all';
	$allowed = array( 'all', 'today', 'week', 'month' );

	return in_array( $period, $allowed, true ) ? $period : 'all';
}

/**
 * Build a related-post query for the current post.
 *
 * @param int $count Number of posts.
 * @return WP_Query
 */
function akishaber_related_posts( $count = 6 ) {
	$post_id  = get_the_ID();
	$category = wp_list_pluck( get_the_category( $post_id ), 'term_id' );
	$tags     = wp_get_post_tags( $post_id, array( 'fields' => 'ids' ) );
	$args     = array(
		'posts_per_page'      => absint( $count ),
		'post__not_in'        => array( $post_id ),
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
		'post_status'         => 'publish',
	);

	if ( $category ) {
		$args['category__in'] = $category;
	}
	if ( $tags ) {
		$args['tag__in'] = $tags;
	}

	$query = new WP_Query( $args );
	if ( $query->post_count < $count ) {
		$query = akishaber_latest(
			$count,
			array(
				'post__not_in' => array_merge( array( $post_id ), wp_list_pluck( $query->posts, 'ID' ) ),
			)
		);
	}

	return $query;
}

/**
 * Return featured-image credit stored in attachment metadata.
 *
 * @param int|null $post_id Post ID.
 * @return string
 */
function akishaber_image_credit( $post_id = null ) {
	$post_id      = $post_id ? absint( $post_id ) : get_the_ID();
	$attachment_id = get_post_thumbnail_id( $post_id );
	if ( ! $attachment_id ) {
		return '';
	}

	return (string) get_post_meta( $attachment_id, '_akishaber_image_credit', true );
}

/**
 * Collect gallery images attached to a post.
 *
 * Falls back to the featured image (or the category placeholder) so galleries
 * always render something meaningful.
 *
 * @param int|null $post_id Post ID.
 * @param int      $limit   Maximum images.
 * @return array<int,array{src:string,thumb:string,caption:string}>
 */
function akishaber_gallery_images( $post_id = null, $limit = 12 ) {
	$post_id = $post_id ? absint( $post_id ) : get_the_ID();
	$images  = array();

	$attachments = get_attached_media( 'image', $post_id );
	foreach ( $attachments as $attachment ) {
		if ( count( $images ) >= $limit ) {
			break;
		}
		$full  = wp_get_attachment_image_url( $attachment->ID, 'akishaber-hero' );
		$thumb = wp_get_attachment_image_url( $attachment->ID, 'akishaber-thumb' );
		if ( ! $full ) {
			continue;
		}
		$images[] = array(
			'src'     => $full,
			'thumb'   => $thumb ? $thumb : $full,
			'caption' => wp_get_attachment_caption( $attachment->ID ) ? wp_get_attachment_caption( $attachment->ID ) : get_the_title( $post_id ),
		);
	}

	if ( ! $images ) {
		$src      = akishaber_thumb_url( 'akishaber-hero', $post_id );
		$images[] = array(
			'src'     => $src,
			'thumb'   => akishaber_thumb_url( 'akishaber-thumb', $post_id ),
			'caption' => get_the_title( $post_id ),
		);
	}

	return $images;
}

/**
 * JSON payload used by the lightbox for a post gallery.
 *
 * @param int|null $post_id Post ID.
 * @param int      $limit   Maximum images.
 * @return string
 */
function akishaber_gallery_payload( $post_id = null, $limit = 12 ) {
	return wp_json_encode( akishaber_gallery_images( $post_id, $limit ) );
}

/**
 * Obtain category choices for filters.
 *
 * @return WP_Term[]
 */
function akishaber_filter_categories() {
	return get_categories(
		array(
			'hide_empty' => true,
			'orderby'    => 'count',
			'order'      => 'DESC',
		)
	);
}
