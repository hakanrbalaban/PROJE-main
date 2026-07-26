<?php
/**
 * Template tags and helpers.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Category CSS modifier.
 *
 * @param int|WP_Term|null $term Term.
 * @return string
 */
function akishaber_cat_modifier( $term = null ) {
	if ( ! $term ) {
		$cats = get_the_category();
		$term = $cats ? $cats[0] : null;
	}
	if ( ! $term ) {
		return 'gundem';
	}
	$slug = is_object( $term ) ? $term->slug : (string) $term;
	$map  = array(
		'gundem'      => 'gundem',
		'politika'    => 'politika',
		'ekonomi'     => 'ekonomi',
		'spor'        => 'spor',
		'magazin'     => 'magazin',
		'saglik'      => 'saglik',
		'teknoloji'   => 'tech',
		'foto-galeri' => 'foto',
		'video'       => 'tech',
		'dunya'       => 'gundem',
	);
	return isset( $map[ $slug ] ) ? $map[ $slug ] : 'gundem';
}

/**
 * Reading time estimate.
 *
 * @param int|null $post_id Post ID.
 * @return string
 */
function akishaber_reading_time( $post_id = null ) {
	$post_id = $post_id ? $post_id : get_the_ID();
	$content = get_post_field( 'post_content', $post_id );
	$words   = str_word_count( wp_strip_all_tags( (string) $content ) );
	$mins    = max( 1, (int) ceil( $words / 200 ) );
	return sprintf(
		/* translators: %d: minutes */
		_n( '%d dk okuma', '%d dk okuma', $mins, 'akishaber' ),
		$mins
	);
}

/**
 * Human time diff.
 *
 * @param int|null $post_id Post ID.
 * @return string
 */
function akishaber_time_ago( $post_id = null ) {
	$post_id = $post_id ? $post_id : get_the_ID();
	return human_time_diff( get_the_time( 'U', $post_id ), current_time( 'timestamp' ) ) . ' ' . __( 'önce', 'akishaber' );
}

/**
 * Query posts by category slug.
 *
 * @param string $slug  Category slug.
 * @param int    $count Number of posts.
 * @param array  $args  Extra WP_Query args.
 * @return WP_Query
 */
function akishaber_query_by_cat( $slug, $count = 6, $args = array() ) {
	$defaults = array(
		'posts_per_page'      => $count,
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
		'post_status'         => 'publish',
	);

	$term = get_term_by( 'slug', $slug, 'category' );
	if ( $term && ! is_wp_error( $term ) ) {
		$defaults['cat'] = (int) $term->term_id;
	}

	return new WP_Query( array_merge( $defaults, $args ) );
}

/**
 * Latest posts fallback.
 *
 * @param int   $count Count.
 * @param array $args  Args.
 * @return WP_Query
 */
function akishaber_latest( $count = 6, $args = array() ) {
	return new WP_Query(
		array_merge(
			array(
				'posts_per_page'      => $count,
				'ignore_sticky_posts' => true,
				'no_found_rows'       => true,
				'post_status'         => 'publish',
			),
			$args
		)
	);
}

/**
 * Thumbnail URL with placeholder.
 *
 * @param string   $size    Size.
 * @param int|null $post_id Post ID.
 * @return string
 */
/**
 * Thumbnail URL with placeholder.
 *
 * @param string   $size    Size.
 * @param int|null $post_id Post ID.
 * @return string
 */
function akishaber_thumb_url( $size = 'akishaber-card', $post_id = null ) {
	$post_id = $post_id ? $post_id : get_the_ID();
	if ( has_post_thumbnail( $post_id ) ) {
		$url = get_the_post_thumbnail_url( $post_id, $size );
		if ( $url ) {
			return $url;
		}
	}
	return akishaber_local_placeholder_url( $post_id );
}

/**
 * Theme-bundled placeholder image (always works, no CDN).
 *
 * @param int $post_id Post ID.
 * @return string
 */
function akishaber_local_placeholder_url( $post_id = 0 ) {
	$post_id  = $post_id ? absint( $post_id ) : get_the_ID();
	$category = get_the_category( $post_id );
	$slug     = $category ? $category[0]->slug : '';
	$map      = array(
		'teknoloji'   => 'unsplash-tech.jpg',
		'ekonomi'     => 'unsplash-finance.jpg',
		'spor'        => 'unsplash-sport.jpg',
		'saglik'      => 'unsplash-health.jpg',
		'magazin'     => 'unsplash-people.jpg',
		'yazarlar'    => 'unsplash-people.jpg',
		'foto-galeri' => 'unsplash-nature.jpg',
		'dunya'       => 'unsplash-city.jpg',
		'politika'    => 'unsplash-newsroom.jpg',
		'gundem'      => 'unsplash-city.jpg',
		'son-dakika'  => 'unsplash-newsroom.jpg',
		'video'       => 'unsplash-nature.jpg',
	);
	$filename = isset( $map[ $slug ] ) ? $map[ $slug ] : 'unsplash-newsroom.jpg';
	$file     = trailingslashit( AKISHABER_DIR ) . 'assets/images/' . $filename;
	if ( file_exists( $file ) ) {
		return trailingslashit( AKISHABER_URI ) . 'assets/images/' . $filename;
	}

	$n = ( $post_id % 8 ) + 1;
	return trailingslashit( AKISHABER_URI ) . 'assets/images/ph-' . $n . '.svg';
}

/**
 * Local SVG data URI fallback.
 *
 * @param int $post_id Post ID.
 * @return string
 */
function akishaber_placeholder_data_uri( $post_id = 0 ) {
	return akishaber_local_placeholder_url( $post_id );
}

/**
 * Print thumbnail img.
 *
 * @param string   $size Size.
 * @param int|null $post_id Post ID.
 * @param array    $attr Attr.
 */
function akishaber_the_thumb( $size = 'akishaber-card', $post_id = null, $attr = array() ) {
	$post_id = $post_id ? $post_id : get_the_ID();
	$alt     = the_title_attribute( array( 'echo' => false, 'post' => $post_id ) );
	$class   = isset( $attr['class'] ) ? $attr['class'] : '';

	if ( has_post_thumbnail( $post_id ) ) {
		$thumb_id = get_post_thumbnail_id( $post_id );
		$file     = $thumb_id ? get_attached_file( $thumb_id ) : '';
		// Broken/missing attachment → local placeholder.
		if ( $file && file_exists( $file ) ) {
			echo get_the_post_thumbnail(
				$post_id,
				$size,
				array_merge(
					array(
						'alt'     => $alt,
						'loading' => 'lazy',
						'class'   => $class,
					),
					$attr
				)
			); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			return;
		}
	}

	$url = akishaber_local_placeholder_url( $post_id );
	printf(
		'<img src="%s" alt="%s" class="%s" loading="lazy" width="800" height="500" />',
		esc_url( $url ),
		esc_attr( $alt ),
		esc_attr( $class )
	);
}

/**
 * Ensure enough posts for a query; pad with latest.
 *
 * @param WP_Query $query Query.
 * @param int      $need  Needed count.
 * @return array Post objects.
 */
function akishaber_fill_posts( $query, $need = 5, $skip_ids = array() ) {
	$posts = array();
	if ( $query && $query->have_posts() ) {
		$posts = $query->posts;
	}

	if ( $skip_ids ) {
		$posts = array_values(
			array_filter(
				$posts,
				static function ( $post ) use ( $skip_ids ) {
					return ! in_array( (int) $post->ID, array_map( 'intval', $skip_ids ), true );
				}
			)
		);
	}

	if ( count( $posts ) >= $need ) {
		return array_slice( $posts, 0, $need );
	}
	$exclude = array_merge( wp_list_pluck( $posts, 'ID' ), $skip_ids );
	$more    = akishaber_latest( $need, array( 'post__not_in' => $exclude ) );
	if ( $more->have_posts() ) {
		$posts = array_merge( $posts, $more->posts );
	}
	return array_slice( $posts, 0, $need );
}

/**
 * Category badge HTML.
 *
 * @param int|null $post_id Post ID.
 */
function akishaber_the_category_badge( $post_id = null, $as_link = true ) {
	$post_id = $post_id ? $post_id : get_the_ID();
	$cats    = get_the_category( $post_id );
	if ( ! $cats ) {
		return;
	}
	$cat = $cats[0];

	// Inside an existing link the badge must stay a span, otherwise the
	// browser splits the markup while parsing nested anchors.
	if ( ! $as_link ) {
		printf(
			'<span class="cat cat--%1$s">%2$s</span>',
			esc_attr( akishaber_cat_modifier( $cat ) ),
			esc_html( $cat->name )
		);

		return;
	}

	printf(
		'<a class="cat cat--%1$s" href="%2$s">%3$s</a>',
		esc_attr( akishaber_cat_modifier( $cat ) ),
		esc_url( get_category_link( $cat ) ),
		esc_html( $cat->name )
	);
}

/**
 * Category archive link by slug.
 *
 * @param string $slug Slug.
 * @return string
 */
function akishaber_cat_link( $slug ) {
	$term = get_term_by( 'slug', $slug, 'category' );
	if ( $term && ! is_wp_error( $term ) ) {
		return get_category_link( $term );
	}
	return home_url( '/' );
}

/**
 * Site brand markup.
 *
 * @param string $extra_class Extra class.
 */
function akishaber_the_brand( $extra_class = '' ) {
	if ( has_custom_logo() ) {
		echo '<div class="brand brand--logo' . ( $extra_class ? ' ' . esc_attr( $extra_class ) : '' ) . '">';
		the_custom_logo();
		echo '</div>';
		return;
	}

	$class  = 'brand' . ( $extra_class ? ' ' . $extra_class : '' );
	$name   = get_bloginfo( 'name', 'display' );
	$parts  = preg_split( '/\s+/', $name, 2 );
	$first  = $parts[0] ? $parts[0] : 'Akış';
	$second = isset( $parts[1] ) ? $parts[1] : 'Haber';
	?>
	<a class="<?php echo esc_attr( $class ); ?>" href="<?php echo esc_url( home_url( '/' ) ); ?>">
		<span class="brand__mark" aria-hidden="true">
			<svg viewBox="0 0 40 40" width="40" height="40"><rect width="40" height="40" rx="4" fill="currentColor"/><path d="M8 28V12h6.2c3.4 0 5.4 1.8 5.4 4.5 0 1.8-.9 3.2-2.5 3.9L22 28h-5.2l-4-6.8H13V28H8zm5-10.8h1c1.4 0 2.2-.7 2.2-1.8S15.4 14 14 14h-1v3.2zM24 28l4.8-16H34L29.2 28H24z" fill="#fff"/></svg>
		</span>
		<span class="brand__text">
			<span class="brand__name"><?php echo esc_html( $first ); ?></span>
			<span class="brand__tag"><?php echo esc_html( $second ); ?></span>
		</span>
	</a>
	<?php
}

/**
 * Fallback primary menu.
 */
function akishaber_primary_fallback() {
	$slugs = array( 'gundem', 'politika', 'ekonomi', 'spor', 'magazin', 'saglik', 'teknoloji' );
	echo '<ul>';
	foreach ( $slugs as $slug ) {
		$term = get_term_by( 'slug', $slug, 'category' );
		if ( ! $term || is_wp_error( $term ) ) {
			continue;
		}
		printf(
			'<li><a href="%s">%s</a></li>',
			esc_url( get_category_link( $term ) ),
			esc_html( $term->name )
		);
	}
	echo '</ul>';
}

/**
 * Custom walker for dropdown support.
 */
class AkisHaber_Walker_Nav extends Walker_Nav_Menu {
	/**
	 * Starts the list before elements.
	 *
	 * @param string   $output Output.
	 * @param int      $depth Depth.
	 * @param stdClass $args Args.
	 */
	public function start_lvl( &$output, $depth = 0, $args = null ) {
		$output .= '<ul class="sub">';
	}

	/**
	 * Starts element.
	 *
	 * @param string   $output Output.
	 * @param WP_Post  $item Item.
	 * @param int      $depth Depth.
	 * @param stdClass $args Args.
	 * @param int      $id ID.
	 */
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$classes = empty( $item->classes ) ? array() : (array) $item->classes;
		if ( in_array( 'menu-item-has-children', $classes, true ) ) {
			$classes[] = 'has-sub';
		}
		$class_names = implode( ' ', array_map( 'esc_attr', array_filter( $classes ) ) );
		$output     .= '<li class="' . $class_names . '">';
		$atts        = array(
			'title'  => ! empty( $item->attr_title ) ? $item->attr_title : '',
			'target' => ! empty( $item->target ) ? $item->target : '',
			'rel'    => ! empty( $item->xfn ) ? $item->xfn : '',
			'href'   => ! empty( $item->url ) ? $item->url : '',
		);
		$attributes = '';
		foreach ( $atts as $attr => $value ) {
			if ( ! empty( $value ) ) {
				$value       = ( 'href' === $attr ) ? esc_url( $value ) : esc_attr( $value );
				$attributes .= ' ' . $attr . '="' . $value . '"';
			}
		}
		$title   = apply_filters( 'the_title', $item->title, $item->ID );
		$output .= '<a' . $attributes . '>' . esc_html( $title ) . '</a>';
	}
}
