<?php
/**
 * Comments template — editorial magazine style.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( post_password_required() ) {
	return;
}

$comment_count = (int) get_comments_number();
$commenter     = wp_get_current_commenter();
$req           = (bool) get_option( 'require_name_email' );
$html_req      = $req ? " required='required' aria-required='true'" : '';
?>

<section id="comments" class="comments-area bv-comments">
	<header class="bv-comments__header">
		<div class="bv-comments__heading">
			<span class="bv-comments__badge" aria-hidden="true">💬</span>
			<div>
				<h2 class="bv-comments__title">
					<?php
					if ( 0 === $comment_count ) {
						esc_html_e( 'İlk yorumu sen yaz', 'balabanviral' );
					} elseif ( 1 === $comment_count ) {
						esc_html_e( '1 yorum', 'balabanviral' );
					} else {
						printf(
							/* translators: %s: comment count */
							esc_html__( '%s yorum', 'balabanviral' ),
							esc_html( number_format_i18n( $comment_count ) )
						);
					}
					?>
				</h2>
				<p class="bv-comments__subtitle">
					<?php esc_html_e( '🔥 ❤️ 🤯 😂 — tepki ver, nazik yaz', 'balabanviral' ); ?>
				</p>
			</div>
		</div>
		<?php if ( $comment_count > 0 ) : ?>
			<span class="bv-comments__count-pill">
				<?php echo esc_html( number_format_i18n( $comment_count ) ); ?>
			</span>
		<?php endif; ?>
	</header>

	<?php if ( have_comments() ) : ?>
		<ol class="bv-comments__list comment-list">
			<?php
			wp_list_comments(
				array(
					'style'       => 'ol',
					'short_ping'  => true,
					'avatar_size' => 52,
					'callback'    => 'my_theme_comment_callback',
				)
			);
			?>
		</ol>

		<?php
		the_comments_navigation(
			array(
				'prev_text' => '← ' . __( 'Önceki yorumlar', 'balabanviral' ),
				'next_text' => __( 'Sonraki yorumlar', 'balabanviral' ) . ' →',
			)
		);
		?>

		<?php if ( ! comments_open() ) : ?>
			<p class="bv-comments__closed"><?php esc_html_e( 'Yorumlar bu yazı için kapatılmıştır.', 'balabanviral' ); ?></p>
		<?php endif; ?>
	<?php endif; ?>

	<?php if ( comments_open() ) : ?>
		<div class="bv-comments__form-wrap">
			<?php
			comment_form(
				array(
					'title_reply'          => __( 'Yorum yaz', 'balabanviral' ),
					'title_reply_to'       => __( '%s kişisine yanıt', 'balabanviral' ),
					'title_reply_before'   => '<h3 id="reply-title" class="bv-comments__form-title">',
					'title_reply_after'    => '</h3>',
					'cancel_reply_before'  => ' <span class="bv-comments__cancel">',
					'cancel_reply_after'   => '</span>',
					'cancel_reply_link'    => __( 'İptal', 'balabanviral' ),
					'class_form'           => 'bv-comment-form comment-form',
					'class_submit'         => 'bv-comment-submit',
					'label_submit'         => __( 'Yorumu gönder', 'balabanviral' ),
					'submit_button'        => '<button name="%1$s" type="submit" id="%2$s" class="%3$s">%4$s ✦</button>',
					'submit_field'         => '<p class="form-submit bv-comments__submit-row">%1$s %2$s</p>',
					'comment_notes_before' => '<p class="bv-comments__note">' . esc_html__( 'E-posta adresiniz yayımlanmaz. Zorunlu alanlar * ile işaretlidir.', 'balabanviral' ) . '</p>',
					'comment_notes_after'  => '',
					'logged_in_as'         => sprintf(
						'<p class="bv-comments__logged">%s</p>',
						sprintf(
							/* translators: 1: profile link, 2: logout link */
							__( 'Giriş yaptınız: %1$s · %2$s', 'balabanviral' ),
							'<a href="' . esc_url( get_edit_user_link() ) . '"><strong>' . esc_html( wp_get_current_user()->display_name ) . '</strong></a>',
							'<a href="' . esc_url( wp_logout_url( get_permalink() ) ) . '">' . esc_html__( 'Çıkış', 'balabanviral' ) . '</a>'
						)
					),
					'fields'               => array(
						'author' => sprintf(
							'<p class="bv-field comment-form-author"><label for="author">%1$s%2$s</label><input id="author" name="author" type="text" value="%3$s" size="30" maxlength="245" placeholder="%4$s"%5$s /></p>',
							esc_html__( 'Adınız', 'balabanviral' ),
							$req ? ' <span class="required">*</span>' : '',
							esc_attr( $commenter['comment_author'] ),
							esc_attr__( 'Adınız', 'balabanviral' ),
							$html_req
						),
						'email'  => sprintf(
							'<p class="bv-field comment-form-email"><label for="email">%1$s%2$s</label><input id="email" name="email" type="email" value="%3$s" size="30" maxlength="100" placeholder="ornek@mail.com"%4$s /></p>',
							esc_html__( 'E-posta', 'balabanviral' ),
							$req ? ' <span class="required">*</span>' : '',
							esc_attr( $commenter['comment_author_email'] ),
							$html_req
						),
						'url'    => sprintf(
							'<p class="bv-field comment-form-url"><label for="url">%1$s <span class="optional">%2$s</span></label><input id="url" name="url" type="url" value="%3$s" size="30" maxlength="200" placeholder="https://" /></p>',
							esc_html__( 'Web sitesi', 'balabanviral' ),
							esc_html__( '(isteğe bağlı)', 'balabanviral' ),
							esc_attr( $commenter['comment_author_url'] )
						),
					),
					'comment_field'        => sprintf(
						'<p class="bv-field bv-field--full comment-form-comment"><label for="comment">%1$s <span class="required">*</span></label><textarea id="comment" name="comment" cols="45" rows="5" maxlength="65525" required="required" placeholder="%2$s"></textarea></p>',
						esc_html_x( 'Yorumunuz', 'noun', 'balabanviral' ),
						esc_attr__( 'Ne düşünüyorsun? Kısa ve nazik yaz…', 'balabanviral' )
					),
				)
			);
			?>
		</div>
	<?php endif; ?>
</section>
