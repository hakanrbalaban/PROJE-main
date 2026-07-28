<?php
/**
 * Custom Template Tags
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'my_theme_posted_on' ) ) :
	/**
	 * Output HTML with meta information for the current post date.
	 */
	function my_theme_posted_on() {
		$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
		if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
			$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time>';
		}

		$time_string = sprintf(
			$time_string,
			esc_attr( get_the_date( DATE_W3C ) ),
			esc_html( get_the_date() )
		);

		echo '<span class="posted-on">📅 ' . $time_string . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
endif;

if ( ! function_exists( 'my_theme_posted_by' ) ) :
	/**
	 * Output HTML with meta information for the current author.
	 */
	function my_theme_posted_by() {
		$byline = sprintf(
			/* translators: %s: post author. */
			esc_html_x( 'Yazar: %s', 'post author', 'balabanviral' ),
			'<span class="author vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ) . '">' . esc_html( get_the_author() ) . '</a></span>'
		);

		echo '<span class="byline">👤 ' . $byline . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
endif;

if ( ! function_exists( 'my_theme_category_badge' ) ) :
	/**
	 * Render First Category Badge
	 */
	function my_theme_category_badge() {
		$categories = get_the_category();
		if ( ! empty( $categories ) ) {
			$cat = $categories[0];
			echo '<a href="' . esc_url( get_category_link( $cat->term_id ) ) . '" class="category-badge">' . esc_html( $cat->name ) . '</a>';
		}
	}
endif;

if ( ! function_exists( 'my_theme_post_thumbnail' ) ) :
	/**
	 * Display Post Thumbnail with Fallback
	 *
	 * @param string $size Image size.
	 */
	function my_theme_post_thumbnail( $size = 'my-theme-grid' ) {
		if ( post_password_required() || is_attachment() ) {
			return;
		}

		if ( has_post_thumbnail() ) {
			the_post_thumbnail( $size, array( 'loading' => 'lazy' ) );
		} else {
			echo '<img src="' . esc_url( my_theme_get_fallback_image() ) . '" alt="' . esc_attr( get_the_title() ) . '" loading="lazy" />';
		}
	}
endif;

if ( ! function_exists( 'my_theme_comment_callback' ) ) :
	/**
	 * Custom comment markup for magazine-style list.
	 *
	 * @param WP_Comment $comment Comment object.
	 * @param array      $args    Args.
	 * @param int        $depth   Depth.
	 */
	function my_theme_comment_callback( $comment, $args, $depth ) {
		$tag   = ( 'div' === $args['style'] ) ? 'div' : 'li';
		$cid   = (int) $comment->comment_ID;
		$reacts = array(
			array( 'emoji' => '🔥', 'label' => 'Ateş' ),
			array( 'emoji' => '❤️', 'label' => 'Kalp' ),
			array( 'emoji' => '🤯', 'label' => 'Şok' ),
			array( 'emoji' => '😂', 'label' => 'Gül' ),
			array( 'emoji' => '👏', 'label' => 'Alkış' ),
			array( 'emoji' => '💯', 'label' => 'Tam' ),
		);
		$seed = $reacts[ $cid % count( $reacts ) ];
		$pick = array( $seed, $reacts[ ( $cid + 2 ) % count( $reacts ) ], $reacts[ ( $cid + 4 ) % count( $reacts ) ] );
		?>
		<<?php echo esc_html( $tag ); ?> id="comment-<?php comment_ID(); ?>" <?php comment_class( 'bv-comment', $comment ); ?>>
			<article id="div-comment-<?php comment_ID(); ?>" class="bv-comment__card">
				<div class="bv-comment__avatar">
					<?php
					echo get_avatar(
						$comment,
						$args['avatar_size'],
						'',
						'',
						array( 'class' => 'bv-comment__avatar-img' )
					);
					?>
					<span class="bv-comment__mood" aria-hidden="true"><?php echo esc_html( $seed['emoji'] ); ?></span>
				</div>
				<div class="bv-comment__body">
					<header class="bv-comment__meta">
						<div class="bv-comment__author-row">
							<span class="bv-comment__author"><?php echo get_comment_author_link( $comment ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
							<?php if ( user_can( (int) $comment->user_id, 'manage_options' ) ) : ?>
								<span class="bv-comment__role"><?php esc_html_e( 'Editör', 'balabanviral' ); ?></span>
							<?php endif; ?>
						</div>
						<div class="bv-comment__time-row">
							<a class="bv-comment__time" href="<?php echo esc_url( get_comment_link( $comment ) ); ?>">
								<time datetime="<?php comment_time( 'c' ); ?>">
									<?php
									printf(
										/* translators: 1: date, 2: time */
										esc_html__( '%1$s · %2$s', 'balabanviral' ),
										esc_html( get_comment_date( '', $comment ) ),
										esc_html( get_comment_time() )
									);
									?>
								</time>
							</a>
							<?php
							edit_comment_link(
								__( 'Düzenle', 'balabanviral' ),
								'<span class="bv-comment__edit">',
								'</span>'
							);
							?>
						</div>
					</header>

					<?php if ( '0' === $comment->comment_approved ) : ?>
						<p class="bv-comment__awaiting"><?php esc_html_e( 'Yorumunuz onay bekliyor.', 'balabanviral' ); ?></p>
					<?php endif; ?>

					<div class="bv-comment__content">
						<?php comment_text(); ?>
					</div>

					<div class="bv-comment__reacts" aria-label="<?php esc_attr_e( 'Tepkiler', 'balabanviral' ); ?>">
						<?php foreach ( $pick as $i => $r ) : ?>
							<span class="bv-comment__react" title="<?php echo esc_attr( $r['label'] ); ?>">
								<?php echo esc_html( $r['emoji'] ); ?>
								<em><?php echo esc_html( (string) ( ( $cid % 7 ) + 2 + $i ) ); ?></em>
							</span>
						<?php endforeach; ?>
					</div>

					<footer class="bv-comment__actions">
						<?php
						comment_reply_link(
							array_merge(
								$args,
								array(
									'add_below'  => 'div-comment',
									'depth'      => $depth,
									'max_depth'  => $args['max_depth'],
									'before'     => '<span class="bv-comment__reply">',
									'after'      => '</span>',
									'reply_text' => '💬 ' . __( 'Yanıtla', 'balabanviral' ),
								)
							)
						);
						?>
					</footer>
				</div>
			</article>
		<?php
	}
endif;
