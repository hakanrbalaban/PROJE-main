<?php
/**
 * AJAX Reactions & Liking Backend Handlers
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handle AJAX Reaction Vote
 */
function my_theme_handle_reaction_ajax() {
	check_ajax_referer( 'my_theme_reaction_nonce', 'nonce' );

	$post_id  = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
	$reaction = isset( $_POST['reaction'] ) ? sanitize_text_field( $_POST['reaction'] ) : '';

	if ( ! $post_id || ! $reaction ) {
		wp_send_json_error( array( 'message' => 'Geçersiz parametre' ) );
	}

	$meta_key = 'my_theme_reaction_' . $reaction;
	$current  = (int) get_post_meta( $post_id, $meta_key, true );
	$new_val  = $current + 1;

	update_post_meta( $post_id, $meta_key, $new_val );

	// If it's a general like
	if ( 'like' === $reaction || 'heart' === $reaction ) {
		$total_likes = (int) get_post_meta( $post_id, 'my_theme_post_likes_count', true );
		update_post_meta( $post_id, 'my_theme_post_likes_count', $total_likes + 1 );
	}

	wp_send_json_success(
		array(
			'count'    => $new_val,
			'reaction' => $reaction,
		)
	);
}
add_action( 'wp_ajax_my_theme_reaction', 'my_theme_handle_reaction_ajax' );
add_action( 'wp_ajax_nopriv_my_theme_reaction', 'my_theme_handle_reaction_ajax' );

/**
 * Get Reaction Count for Post
 *
 * @param int    $post_id Post ID.
 * @param string $reaction Reaction type.
 * @return int Count.
 */
function my_theme_get_reaction_count( $post_id, $reaction ) {
	$meta_key = 'my_theme_reaction_' . $reaction;
	$val      = get_post_meta( $post_id, $meta_key, true );
	if ( '' === $val ) {
		// Provide a default baseline count for aesthetics
		$defaults = array(
			'fire'      => 12,
			'heart'     => 28,
			'mindblown' => 9,
			'like'      => 45,
		);
		return isset( $defaults[ $reaction ] ) ? $defaults[ $reaction ] : 0;
	}
	return (int) $val;
}
