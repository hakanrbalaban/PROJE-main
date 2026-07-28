<?php
/**
 * Custom Post Types: Headline, Photo Gallery, Video Gallery.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register theme CPTs.
 */
function my_theme_register_cpts() {
	// Manşet (optional featured CPT).
	register_post_type(
		'headline',
		array(
			'labels'              => array(
				'name'          => _x( 'Manşetler', 'Post Type General Name', 'balabanviral' ),
				'singular_name' => _x( 'Manşet', 'Post Type Singular Name', 'balabanviral' ),
				'add_new_item'  => __( 'Yeni Manşet Ekle', 'balabanviral' ),
				'edit_item'     => __( 'Manşeti Düzenle', 'balabanviral' ),
				'menu_name'     => __( 'Manşetler', 'balabanviral' ),
			),
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'menu_position'       => 5,
			'menu_icon'           => 'dashicons-megaphone',
			'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt', 'revisions' ),
			'taxonomies'          => array( 'category', 'post_tag' ),
			'has_archive'         => true,
			'show_in_rest'        => true,
			'rewrite'             => array( 'slug' => 'manset' ),
		)
	);

	// Foto galeri — haber sitelerindeki foto haberleri.
	register_post_type(
		'bv_photo',
		array(
			'labels'              => array(
				'name'               => _x( 'Foto Galeri', 'Post Type General Name', 'balabanviral' ),
				'singular_name'      => _x( 'Foto', 'Post Type Singular Name', 'balabanviral' ),
				'add_new_item'       => __( 'Yeni Foto Ekle', 'balabanviral' ),
				'edit_item'          => __( 'Fotoyu Düzenle', 'balabanviral' ),
				'new_item'           => __( 'Yeni Foto', 'balabanviral' ),
				'view_item'          => __( 'Fotoyu Görüntüle', 'balabanviral' ),
				'search_items'       => __( 'Foto Ara', 'balabanviral' ),
				'not_found'          => __( 'Foto bulunamadı', 'balabanviral' ),
				'not_found_in_trash' => __( 'Çöpte foto yok', 'balabanviral' ),
				'menu_name'          => __( 'Foto Galeri', 'balabanviral' ),
				'all_items'          => __( 'Tüm Fotolar', 'balabanviral' ),
			),
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'menu_position'       => 6,
			'menu_icon'           => 'dashicons-format-gallery',
			'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt', 'comments', 'author', 'revisions' ),
			'has_archive'         => 'foto-galeri',
			'show_in_rest'        => true,
			'rewrite'             => array( 'slug' => 'foto' ),
			'exclude_from_search' => false,
		)
	);

	// Video galeri.
	register_post_type(
		'bv_video',
		array(
			'labels'              => array(
				'name'               => _x( 'Video Galeri', 'Post Type General Name', 'balabanviral' ),
				'singular_name'      => _x( 'Video', 'Post Type Singular Name', 'balabanviral' ),
				'add_new_item'       => __( 'Yeni Video Ekle', 'balabanviral' ),
				'edit_item'          => __( 'Videoyu Düzenle', 'balabanviral' ),
				'new_item'           => __( 'Yeni Video', 'balabanviral' ),
				'view_item'          => __( 'Videoyu Görüntüle', 'balabanviral' ),
				'search_items'       => __( 'Video Ara', 'balabanviral' ),
				'not_found'          => __( 'Video bulunamadı', 'balabanviral' ),
				'not_found_in_trash' => __( 'Çöpte video yok', 'balabanviral' ),
				'menu_name'          => __( 'Video Galeri', 'balabanviral' ),
				'all_items'          => __( 'Tüm Videolar', 'balabanviral' ),
			),
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'menu_position'       => 7,
			'menu_icon'           => 'dashicons-video-alt3',
			'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt', 'comments', 'author', 'revisions' ),
			'has_archive'         => 'video-galeri',
			'show_in_rest'        => true,
			'rewrite'             => array( 'slug' => 'video' ),
			'exclude_from_search' => false,
		)
	);
}
add_action( 'init', 'my_theme_register_cpts', 0 );

/**
 * Video URL meta box.
 */
function my_theme_video_meta_boxes() {
	add_meta_box(
		'bv_video_url',
		__( 'Video URL (YouTube / Vimeo)', 'balabanviral' ),
		'my_theme_video_meta_box_render',
		'bv_video',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes', 'my_theme_video_meta_boxes' );

/**
 * Render video URL field.
 *
 * @param WP_Post $post Post.
 */
function my_theme_video_meta_box_render( $post ) {
	wp_nonce_field( 'bv_save_video_url', 'bv_video_url_nonce' );
	$value = get_post_meta( $post->ID, '_bv_video_url', true );
	?>
	<p>
		<label for="bv_video_url_field" class="screen-reader-text"><?php esc_html_e( 'Video URL', 'balabanviral' ); ?></label>
		<input
			type="url"
			class="widefat"
			id="bv_video_url_field"
			name="bv_video_url"
			value="<?php echo esc_attr( $value ); ?>"
			placeholder="https://www.youtube.com/watch?v=…"
		/>
	</p>
	<p class="description"><?php esc_html_e( 'YouTube veya Vimeo sayfa / izleme bağlantısı. Öne çıkan görsel kapak olarak kullanılır.', 'balabanviral' ); ?></p>
	<?php
}

/**
 * Save video URL.
 *
 * @param int $post_id Post ID.
 */
function my_theme_save_video_meta( $post_id ) {
	if ( ! isset( $_POST['bv_video_url_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['bv_video_url_nonce'] ) ), 'bv_save_video_url' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	if ( isset( $_POST['bv_video_url'] ) ) {
		update_post_meta( $post_id, '_bv_video_url', esc_url_raw( wp_unslash( $_POST['bv_video_url'] ) ) );
	}
}
add_action( 'save_post_bv_video', 'my_theme_save_video_meta' );

/**
 * Convert watch URL to embed URL.
 *
 * @param string $url Video URL.
 * @return string Embed URL or empty.
 */
function my_theme_video_embed_url( $url ) {
	$url = trim( (string) $url );
	if ( '' === $url ) {
		return '';
	}

	if ( preg_match( '#(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{6,})#', $url, $m ) ) {
		return 'https://www.youtube.com/embed/' . rawurlencode( $m[1] ) . '?rel=0';
	}
	if ( preg_match( '#vimeo\.com/(?:video/)?([0-9]+)#', $url, $m ) ) {
		return 'https://player.vimeo.com/video/' . rawurlencode( $m[1] );
	}
	if ( false !== strpos( $url, 'youtube.com/embed/' ) || false !== strpos( $url, 'player.vimeo.com' ) ) {
		return esc_url_raw( $url );
	}
	return '';
}

/**
 * YouTube thumbnail from URL.
 *
 * @param string $url Video URL.
 * @return string
 */
function my_theme_video_poster_url( $url ) {
	if ( preg_match( '#(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{6,})#', $url, $m ) ) {
		return 'https://i.ytimg.com/vi/' . rawurlencode( $m[1] ) . '/hqdefault.jpg';
	}
	return '';
}
