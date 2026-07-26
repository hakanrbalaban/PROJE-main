<?php
/**
 * Comments template.
 *
 * @package AkisHaber
 */

if ( post_password_required() ) {
	return;
}
?>
<div id="comments" class="comments-area">
	<?php if ( have_comments() ) : ?>
		<h2 class="comments-title">
			<?php
			$akishaber_count = get_comments_number();
			printf(
				/* translators: 1: count, 2: title */
				esc_html( _n( '%1$s yorum — %2$s', '%1$s yorum — %2$s', $akishaber_count, 'akishaber' ) ),
				esc_html( number_format_i18n( $akishaber_count ) ),
				'<span>' . esc_html( get_the_title() ) . '</span>'
			);
			?>
		</h2>
		<ol class="comment-list">
			<?php
			wp_list_comments(
				array(
					'style'      => 'ol',
					'short_ping' => true,
				)
			);
			?>
		</ol>
		<?php the_comments_navigation(); ?>
	<?php endif; ?>

	<?php
	if ( ! comments_open() && get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) :
		?>
		<p class="no-comments"><?php esc_html_e( 'Yorumlar kapatıldı.', 'akishaber' ); ?></p>
		<?php
	endif;

	comment_form();
	?>
</div>
