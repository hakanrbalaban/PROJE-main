<?php
/**
 * Theme widgets (Appearance → Widgets).
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Viral / mood badge for a post.
 *
 * @param int $post_id Post ID.
 * @return string
 */
function my_theme_widget_viral_badge( $post_id ) {
	$post_id = (int) $post_id;
	$views   = function_exists( 'my_theme_get_post_views' ) ? my_theme_get_post_views( $post_id ) : 0;

	if ( function_exists( 'my_theme_post_has_feature' ) && my_theme_post_has_feature( $post_id, 'viral' ) ) {
		return '💯';
	}
	if ( function_exists( 'my_theme_post_has_feature' ) && my_theme_post_has_feature( $post_id, 'trending' ) ) {
		return '🔥';
	}
	if ( $views > 100 ) {
		return '💯';
	}

	$moods = array( '🔥', '❤️', '🤯', '👍' );
	return $moods[ $post_id % count( $moods ) ];
}

/**
 * Cover URL helper for widgets.
 *
 * @param int $post_id Post ID.
 * @return string
 */
function my_theme_widget_cover( $post_id ) {
	$post_id = (int) $post_id;
	if ( function_exists( 'my_theme_get_cover_url' ) ) {
		return my_theme_get_cover_url( $post_id );
	}
	$url = get_the_post_thumbnail_url( $post_id, 'thumbnail' );
	return $url ? $url : '';
}

/**
 * Popular posts by view count (falls back to comment count).
 */
class My_Theme_Popular_Posts_Widget extends WP_Widget {

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct(
			'my_theme_popular_posts',
			__( 'BalabanViral: Popular Posts', 'balabanviral' ),
			array(
				'description'                 => __( 'Lists popular posts by views (or comments).', 'balabanviral' ),
				'classname'                   => 'widget_my_theme_popular_posts animate-rise',
				'customize_selective_refresh' => true,
			)
		);
	}

	/**
	 * Front-end output.
	 *
	 * @param array $args     Widget args.
	 * @param array $instance Settings.
	 */
	public function widget( $args, $instance ) {
		$title  = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Popular Posts', 'balabanviral' );
		$title  = apply_filters( 'widget_title', $title, $instance, $this->id_base );
		$number = isset( $instance['number'] ) ? absint( $instance['number'] ) : 5;
		if ( $number < 1 ) {
			$number = 5;
		}

		$query = new WP_Query(
			array(
				'posts_per_page'      => $number,
				'meta_key'            => 'my_theme_post_views_count', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'orderby'             => 'meta_value_num',
				'order'               => 'DESC',
				'ignore_sticky_posts' => true,
				'no_found_rows'       => true,
			)
		);

		if ( empty( $query->posts ) ) {
			$query = new WP_Query(
				array(
					'posts_per_page'      => $number,
					'orderby'             => 'comment_count',
					'ignore_sticky_posts' => true,
					'no_found_rows'       => true,
				)
			);
		}

		if ( function_exists( 'my_theme_merge_feature_posts' ) ) {
			$query->posts      = my_theme_merge_feature_posts( $query->posts, 'sidebar', $number );
			$query->posts      = my_theme_merge_feature_posts( $query->posts, 'popular', $number );
			$query->post_count = count( $query->posts );
		}

		echo $args['before_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		if ( $title ) {
			echo $args['before_title'] . esc_html( $title ) . $args['after_title']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}

		echo '<div class="bv-side-list">';
		if ( ! empty( $query->posts ) ) {
			foreach ( $query->posts as $pop_post ) {
				$pid    = (int) $pop_post->ID;
				$thumb  = my_theme_widget_cover( $pid );
				$ptitle = wp_trim_words( get_the_title( $pid ), 10, '…' );
				$badge  = my_theme_widget_viral_badge( $pid );
				$author = (int) get_post_field( 'post_author', $pid );
				?>
				<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>" class="bv-side-row">
					<span class="bv-side-row__media">
						<span class="bv-side-row__avatar">
							<?php
							echo get_avatar(
								$author,
								36,
								'mystery',
								'',
								array( 'class' => 'bv-side-row__avatar-img' )
							); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							?>
						</span>
						<span class="bv-side-row__thumb">
							<?php if ( $thumb ) : ?>
								<img src="<?php echo esc_url( $thumb ); ?>" alt="" loading="lazy" width="48" height="48" />
							<?php else : ?>
								<span class="bv-side-row__thumb-empty" aria-hidden="true">📰</span>
							<?php endif; ?>
							<em class="bv-side-row__emoji" aria-hidden="true"><?php echo esc_html( $badge ); ?></em>
						</span>
					</span>
					<span class="bv-side-row__txt">
						<strong><?php echo esc_html( $ptitle ); ?></strong>
						<small>
							<?php echo esc_html( get_the_author_meta( 'display_name', $author ) ); ?>
							· 👁 <?php echo esc_html( (string) my_theme_get_post_views( $pid ) ); ?>
						</small>
					</span>
				</a>
				<?php
			}
		} else {
			echo '<p class="text-sm text-[var(--muted)]">' . esc_html__( 'No popular posts yet.', 'balabanviral' ) . '</p>';
		}
		echo '</div>';

		echo $args['after_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		wp_reset_postdata();
	}

	/**
	 * Admin form.
	 *
	 * @param array $instance Settings.
	 */
	public function form( $instance ) {
		$title  = isset( $instance['title'] ) ? $instance['title'] : __( 'Popular Posts', 'balabanviral' );
		$number = isset( $instance['number'] ) ? absint( $instance['number'] ) : 5;
		?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'balabanviral' ); ?></label>
			<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
		</p>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'number' ) ); ?>"><?php esc_html_e( 'Number of posts:', 'balabanviral' ); ?></label>
			<input class="tiny-text" id="<?php echo esc_attr( $this->get_field_id( 'number' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'number' ) ); ?>" type="number" min="1" max="20" value="<?php echo esc_attr( (string) $number ); ?>">
		</p>
		<?php
	}

	/**
	 * Save settings.
	 *
	 * @param array $new_instance New settings.
	 * @param array $old_instance Old settings.
	 * @return array
	 */
	public function update( $new_instance, $old_instance ) {
		$instance           = array();
		$instance['title']  = sanitize_text_field( $new_instance['title'] ?? '' );
		$instance['number'] = absint( $new_instance['number'] ?? 5 );
		if ( $instance['number'] < 1 ) {
			$instance['number'] = 5;
		}
		return $instance;
	}
}

/**
 * Recent approved comments.
 */
class My_Theme_Recent_Comments_Widget extends WP_Widget {

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct(
			'my_theme_recent_comments',
			__( 'BalabanViral: Recent Comments', 'balabanviral' ),
			array(
				'description'                 => __( 'Shows the latest approved comments.', 'balabanviral' ),
				'classname'                   => 'widget_my_theme_recent_comments animate-rise',
				'customize_selective_refresh' => true,
			)
		);
	}

	/**
	 * Front-end output.
	 *
	 * @param array $args     Widget args.
	 * @param array $instance Settings.
	 */
	public function widget( $args, $instance ) {
		$title  = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Recent Comments', 'balabanviral' );
		$title  = apply_filters( 'widget_title', $title, $instance, $this->id_base );
		$number = isset( $instance['number'] ) ? absint( $instance['number'] ) : 5;
		if ( $number < 1 ) {
			$number = 5;
		}

		$comments = get_comments(
			array(
				'number'  => $number,
				'status'  => 'approve',
				'orderby' => 'comment_date_gmt',
				'order'   => 'DESC',
			)
		);

		echo $args['before_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		if ( $title ) {
			echo $args['before_title'] . esc_html( $title ) . $args['after_title']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}

		echo '<ul class="bv-recent-comments">';
		if ( $comments ) {
			foreach ( $comments as $rc ) {
				$pid   = (int) $rc->comment_post_ID;
				$thumb = my_theme_widget_cover( $pid );
				$badge = my_theme_widget_viral_badge( $pid );
				$ptitle = wp_trim_words( get_the_title( $pid ), 8, '…' );
				$snippet = wp_trim_words( wp_strip_all_tags( $rc->comment_content ), 10, '…' );
				?>
				<li class="bv-rc-item">
					<a href="<?php echo esc_url( get_comment_link( $rc ) ); ?>" class="bv-rc-item__link">
						<span class="bv-rc-item__faces">
							<span class="bv-rc-item__avatar-wrap">
								<?php
								echo get_avatar(
									$rc,
									40,
									'mystery',
									'',
									array( 'class' => 'bv-rc-item__avatar' )
								); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
								?>
							</span>
							<span class="bv-rc-item__thumb">
								<?php if ( $thumb ) : ?>
									<img src="<?php echo esc_url( $thumb ); ?>" alt="" loading="lazy" width="40" height="40" />
								<?php else : ?>
									<span class="bv-rc-item__thumb-empty" aria-hidden="true">📰</span>
								<?php endif; ?>
								<em class="bv-rc-item__mood" aria-hidden="true"><?php echo esc_html( $badge ); ?></em>
							</span>
						</span>
						<span class="bv-rc-item__body">
							<small class="bv-rc-item__author"><?php echo esc_html( $rc->comment_author ); ?></small>
							<strong><?php echo esc_html( $snippet ? $snippet : $ptitle ); ?></strong>
							<em class="bv-rc-item__post"><?php echo esc_html( $ptitle ); ?></em>
						</span>
					</a>
				</li>
				<?php
			}
		} else {
			echo '<li><span class="bv-rc-empty">' . esc_html__( 'No comments yet.', 'balabanviral' ) . '</span></li>';
		}
		echo '</ul>';

		echo $args['after_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Admin form.
	 *
	 * @param array $instance Settings.
	 */
	public function form( $instance ) {
		$title  = isset( $instance['title'] ) ? $instance['title'] : __( 'Recent Comments', 'balabanviral' );
		$number = isset( $instance['number'] ) ? absint( $instance['number'] ) : 5;
		?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'balabanviral' ); ?></label>
			<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
		</p>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'number' ) ); ?>"><?php esc_html_e( 'Number of comments:', 'balabanviral' ); ?></label>
			<input class="tiny-text" id="<?php echo esc_attr( $this->get_field_id( 'number' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'number' ) ); ?>" type="number" min="1" max="20" value="<?php echo esc_attr( (string) $number ); ?>">
		</p>
		<?php
	}

	/**
	 * Save settings.
	 *
	 * @param array $new_instance New settings.
	 * @param array $old_instance Old settings.
	 * @return array
	 */
	public function update( $new_instance, $old_instance ) {
		$instance           = array();
		$instance['title']  = sanitize_text_field( $new_instance['title'] ?? '' );
		$instance['number'] = absint( $new_instance['number'] ?? 5 );
		if ( $instance['number'] < 1 ) {
			$instance['number'] = 5;
		}
		return $instance;
	}
}

/**
 * Register theme widgets.
 */
function my_theme_register_widgets() {
	register_widget( 'My_Theme_Popular_Posts_Widget' );
	register_widget( 'My_Theme_Recent_Comments_Widget' );
}
add_action( 'widgets_init', 'my_theme_register_widgets' );

/**
 * Replace plain WP recent-comments / recent-posts widgets with themed ones.
 *
 * @param array     $instance Settings.
 * @param WP_Widget $widget   Widget instance.
 * @param array     $args     Sidebar args.
 * @return array|false
 */
function my_theme_replace_plain_list_widgets( $instance, $widget, $args ) {
	// Never run in wp-admin / REST / AJAX — prevents white screens on theme switch & media delete.
	if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return $instance;
	}
	if ( false === $instance || ! is_object( $widget ) ) {
		return $instance;
	}

	if ( $widget instanceof WP_Widget_Recent_Comments ) {
		the_widget(
			'My_Theme_Recent_Comments_Widget',
			array(
				'title'  => ! empty( $instance['title'] ) ? $instance['title'] : __( 'Recent Comments', 'balabanviral' ),
				'number' => isset( $instance['number'] ) ? absint( $instance['number'] ) : 5,
			),
			$args
		);
		return false;
	}

	if ( $widget instanceof WP_Widget_Recent_Posts ) {
		the_widget(
			'My_Theme_Popular_Posts_Widget',
			array(
				'title'  => ! empty( $instance['title'] ) ? $instance['title'] : __( 'Popular Posts', 'balabanviral' ),
				'number' => isset( $instance['number'] ) ? absint( $instance['number'] ) : 5,
			),
			$args
		);
		return false;
	}

	return $instance;
}
add_filter( 'widget_display_callback', 'my_theme_replace_plain_list_widgets', 10, 3 );

/**
 * Replace core latest-comments / latest-posts blocks in the sidebar.
 *
 * @param string $content Block HTML.
 * @param array  $block   Parsed block.
 * @return string
 */
function my_theme_replace_plain_list_blocks( $content, $block ) {
	if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || wp_is_json_request() ) {
		return $content;
	}
	if ( empty( $block['blockName'] ) ) {
		return $content;
	}

	$widget_args = array(
		'before_widget' => '<section class="widget animate-rise">',
		'after_widget'  => '</section>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	);

	if ( 'core/latest-comments' === $block['blockName'] ) {
		$number = isset( $block['attrs']['commentsToShow'] ) ? absint( $block['attrs']['commentsToShow'] ) : 5;
		ob_start();
		the_widget(
			'My_Theme_Recent_Comments_Widget',
			array(
				'title'  => __( 'Recent Comments', 'balabanviral' ),
				'number' => $number ? $number : 5,
			),
			$widget_args
		);
		return (string) ob_get_clean();
	}

	if ( 'core/latest-posts' === $block['blockName'] ) {
		$number = isset( $block['attrs']['postsToShow'] ) ? absint( $block['attrs']['postsToShow'] ) : 5;
		ob_start();
		the_widget(
			'My_Theme_Popular_Posts_Widget',
			array(
				'title'  => __( 'Popular Posts', 'balabanviral' ),
				'number' => $number ? $number : 5,
			),
			$widget_args
		);
		return (string) ob_get_clean();
	}

	return $content;
}
add_filter( 'render_block', 'my_theme_replace_plain_list_blocks', 10, 2 );
