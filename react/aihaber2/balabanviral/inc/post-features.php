<?php
/**
 * Site feature flags for the post editor — all homepage/site placements.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Feature groups shown in the editor.
 *
 * @return array<string, array{title:string,flags:array<string, array{label:string,emoji:string,help:string}>}>
 */
function my_theme_feature_groups() {
	return array(
		'placement'  => array(
			'title' => __( 'Yerleşim & vitrin', 'balabanviral' ),
			'flags' => array(
				'manset'      => array(
					'label' => __( 'Manşet (ana slider)', 'balabanviral' ),
					'emoji' => '📰',
					'help'  => __( 'Sol büyük manşet slaytına aday olur.', 'balabanviral' ),
				),
				'one_cikan'   => array(
					'label' => __( 'Öne çıkanlar (yan panel)', 'balabanviral' ),
					'emoji' => '⭐',
					'help'  => __( 'Manşet sağındaki “Öne çıkanlar” listesine girer.', 'balabanviral' ),
				),
				'ticker'      => array(
					'label' => __( 'Son dakika şeridi', 'balabanviral' ),
					'emoji' => '🚨',
					'help'  => __( 'Üstteki kayan SON DAKİKA ticker’da görünür.', 'balabanviral' ),
				),
				'latest'      => array(
					'label' => __( 'En son rayı', 'balabanviral' ),
					'emoji' => '🆕',
					'help'  => __( '“En son” yatay rayda öncelikli gösterilir.', 'balabanviral' ),
				),
				'editor'      => array(
					'label' => __( 'Editörün seçimi', 'balabanviral' ),
					'emoji' => '✍️',
					'help'  => __( 'Özel editör seçimi rozeti ve vitrin.', 'balabanviral' ),
				),
				'sticky_home' => array(
					'label' => __( 'Ana sayfada sabitle', 'balabanviral' ),
					'emoji' => '📌',
					'help'  => __( 'Ana akışta üstte tutulmaya aday (öne çekilir).', 'balabanviral' ),
				),
			),
		),
		'filters'    => array(
			'title' => __( 'Emoji filtreler (üst bar)', 'balabanviral' ),
			'flags' => array(
				'trending' => array(
					'label' => __( 'Trend', 'balabanviral' ),
					'emoji' => '🔥',
					'help'  => __( '🔥 Trend filtresi ve Viral/Trend rayı.', 'balabanviral' ),
				),
				'loved'    => array(
					'label' => __( 'Sevilen', 'balabanviral' ),
					'emoji' => '❤️',
					'help'  => __( '❤️ Sevilen filtresi.', 'balabanviral' ),
				),
				'popular'  => array(
					'label' => __( 'Popüler / Çok okunan', 'balabanviral' ),
					'emoji' => '👁',
					'help'  => __( '👁 Popüler filtresi ve çok okunan rayı.', 'balabanviral' ),
				),
				'harika'   => array(
					'label' => __( 'Harika', 'balabanviral' ),
					'emoji' => '😍',
					'help'  => __( '😍 Harika filtresi.', 'balabanviral' ),
				),
				'komik'    => array(
					'label' => __( 'Komik', 'balabanviral' ),
					'emoji' => '😂',
					'help'  => __( '😂 Komik filtresi.', 'balabanviral' ),
				),
				'viral'    => array(
					'label' => __( 'Viral', 'balabanviral' ),
					'emoji' => '💯',
					'help'  => __( '💯 Viral filtresi + kartlarda Viral rozeti.', 'balabanviral' ),
				),
			),
		),
		'media'      => array(
			'title' => __( 'Galeri & medya', 'balabanviral' ),
			'flags' => array(
				'photo' => array(
					'label' => __( 'Foto galeri', 'balabanviral' ),
					'emoji' => '📷',
					'help'  => __( 'Foto galeri rayı ve /foto-galeri/ arşivi.', 'balabanviral' ),
				),
				'video' => array(
					'label' => __( 'Video galeri', 'balabanviral' ),
					'emoji' => '▶️',
					'help'  => __( 'Video galeri rayı ve /video-galeri/ arşivi.', 'balabanviral' ),
				),
			),
		),
		'engage'     => array(
			'title' => __( 'Etkileşim & rozetler', 'balabanviral' ),
			'flags' => array(
				'reactions' => array(
					'label' => __( 'Tepki çubuğu vurgula', 'balabanviral' ),
					'emoji' => '👏',
					'help'  => __( 'Yazıda tepki alanını öne çıkarır.', 'balabanviral' ),
				),
				'comments'  => array(
					'label' => __( 'Yorumlara açık vurgula', 'balabanviral' ),
					'emoji' => '💬',
					'help'  => __( 'Yorumlar bölümünü öne alır / teşvik eder.', 'balabanviral' ),
				),
				'sidebar'   => array(
					'label' => __( 'Yan panel “Popüler”', 'balabanviral' ),
					'emoji' => '📋',
					'help'  => __( 'Sağdaki Popüler İçerikler widget’ında görünür.', 'balabanviral' ),
				),
				'nsfw'      => array(
					'label' => __( 'Hassas içerik uyarısı', 'balabanviral' ),
					'emoji' => '⚠️',
					'help'  => __( 'Kartta uyarı rozeti gösterir.', 'balabanviral' ),
				),
			),
		),
	);
}

/**
 * Flat map of all flags.
 *
 * @return array<string, array{label:string,emoji:string,help:string}>
 */
function my_theme_feature_flags() {
	$out = array();
	foreach ( my_theme_feature_groups() as $group ) {
		foreach ( $group['flags'] as $key => $row ) {
			$out[ $key ] = $row;
		}
	}
	return $out;
}

/**
 * Meta key for a feature.
 *
 * @param string $flag Flag slug.
 * @return string
 */
function my_theme_feature_meta_key( $flag ) {
	return '_bv_feat_' . sanitize_key( $flag );
}

/**
 * Whether post has a feature enabled.
 *
 * @param int    $post_id Post ID.
 * @param string $flag    Flag.
 * @return bool
 */
function my_theme_post_has_feature( $post_id, $flag ) {
	return (bool) get_post_meta( (int) $post_id, my_theme_feature_meta_key( $flag ), true );
}

/**
 * Register meta box.
 */
function my_theme_features_meta_box() {
	foreach ( array( 'post', 'headline', 'bv_photo', 'bv_video' ) as $screen ) {
		add_meta_box(
			'bv_site_features',
			__( 'Site özellikleri', 'balabanviral' ),
			'my_theme_features_meta_box_render',
			$screen,
			'side',
			'high'
		);
	}
}
add_action( 'add_meta_boxes', 'my_theme_features_meta_box' );

/**
 * Render grouped feature checkboxes.
 *
 * @param WP_Post $post Post.
 */
function my_theme_features_meta_box_render( $post ) {
	wp_nonce_field( 'bv_save_site_features', 'bv_site_features_nonce' );
	$groups = my_theme_feature_groups();
	$video  = (string) get_post_meta( $post->ID, '_bv_video_url', true );
	$cover  = (string) get_post_meta( $post->ID, 'my_theme_custom_image_url', true );
	?>
	<style>
		.bv-feat-box{margin:0}
		.bv-feat-group{margin:0 0 12px;padding:0 0 10px;border-bottom:1px solid #dcdcde}
		.bv-feat-group:last-of-type{border-bottom:0;margin-bottom:0;padding-bottom:0}
		.bv-feat-group h4{margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#646970}
		.bv-feat-list{margin:0;padding:0;list-style:none}
		.bv-feat-list li{margin:0 0 8px;padding:7px 8px;border:1px solid #dcdcde;border-radius:4px;background:#f6f7f7}
		.bv-feat-list label{display:flex;gap:8px;align-items:flex-start;font-weight:600;cursor:pointer;line-height:1.35}
		.bv-feat-list input{margin-top:2px}
		.bv-feat-list small{display:block;margin:3px 0 0 22px;font-weight:400;color:#646970;line-height:1.35}
		.bv-feat-fields{margin-top:10px}
		.bv-feat-fields label{display:block;font-weight:600;margin:8px 0 4px}
		.bv-feat-fields input{width:100%}
		.bv-feat-hint{margin:8px 0 0;color:#646970;font-size:12px}
	</style>
	<div class="bv-feat-box">
		<p class="bv-feat-hint"><?php esc_html_e( 'Bu yazının sitede nerede ve nasıl görüneceğini seçin.', 'balabanviral' ); ?></p>
		<?php foreach ( $groups as $group ) : ?>
			<div class="bv-feat-group">
				<h4><?php echo esc_html( $group['title'] ); ?></h4>
				<ul class="bv-feat-list">
					<?php foreach ( $group['flags'] as $key => $row ) : ?>
						<?php
						$checked = my_theme_post_has_feature( $post->ID, $key );
						if ( 'bv_photo' === $post->post_type && 'photo' === $key ) {
							$checked = true;
						}
						if ( 'bv_video' === $post->post_type && 'video' === $key ) {
							$checked = true;
						}
						?>
						<li>
							<label>
								<input type="checkbox" name="bv_feat[<?php echo esc_attr( $key ); ?>]" value="1" <?php checked( $checked ); ?> />
								<span><?php echo esc_html( $row['emoji'] . ' ' . $row['label'] ); ?></span>
							</label>
							<small><?php echo esc_html( $row['help'] ); ?></small>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endforeach; ?>

		<div class="bv-feat-fields">
			<label for="bv_feat_video_url"><?php esc_html_e( 'Video URL (YouTube / Vimeo)', 'balabanviral' ); ?></label>
			<input type="url" id="bv_feat_video_url" name="bv_feat_video_url" value="<?php echo esc_attr( $video ); ?>" placeholder="https://www.youtube.com/watch?v=…" />

			<label for="bv_feat_cover_url"><?php esc_html_e( 'Kapak görseli URL (opsiyonel)', 'balabanviral' ); ?></label>
			<input type="url" id="bv_feat_cover_url" name="bv_feat_cover_url" value="<?php echo esc_attr( $cover ); ?>" placeholder="https://…" />
			<p class="description"><?php esc_html_e( 'Öne çıkan görsel yoksa bu URL kullanılır. Video seçiliyse URL alanı önerilir.', 'balabanviral' ); ?></p>
		</div>
	</div>
	<?php
}

/**
 * Save feature flags.
 *
 * @param int $post_id Post ID.
 */
function my_theme_save_site_features( $post_id ) {
	if ( ! isset( $_POST['bv_site_features_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['bv_site_features_nonce'] ) ), 'bv_save_site_features' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	// Bulk trash/delete and quick-edit have no feature form — skip.
	if ( isset( $_REQUEST['action'] ) && in_array( sanitize_key( wp_unslash( $_REQUEST['action'] ) ), array( 'trash', 'delete', 'untrash', 'inline-save' ), true ) ) {
		return;
	}
	if ( wp_is_post_revision( $post_id ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$flags  = my_theme_feature_flags();
	$posted = isset( $_POST['bv_feat'] ) && is_array( $_POST['bv_feat'] ) ? wp_unslash( $_POST['bv_feat'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	$ptype  = get_post_type( $post_id );

	foreach ( array_keys( $flags ) as $key ) {
		$on = ! empty( $posted[ $key ] );
		if ( 'bv_photo' === $ptype && 'photo' === $key ) {
			$on = true;
		}
		if ( 'bv_video' === $ptype && 'video' === $key ) {
			$on = true;
		}
		update_post_meta( $post_id, my_theme_feature_meta_key( $key ), $on ? '1' : '' );
	}

	if ( isset( $_POST['bv_feat_video_url'] ) ) {
		update_post_meta( $post_id, '_bv_video_url', esc_url_raw( wp_unslash( $_POST['bv_feat_video_url'] ) ) );
	}
	if ( isset( $_POST['bv_feat_cover_url'] ) ) {
		update_post_meta( $post_id, 'my_theme_custom_image_url', esc_url_raw( wp_unslash( $_POST['bv_feat_cover_url'] ) ) );
	}

	if ( ! empty( $posted['popular'] ) ) {
		$views = (int) get_post_meta( $post_id, 'my_theme_post_views_count', true );
		if ( $views < 2500 ) {
			update_post_meta( $post_id, 'my_theme_post_views_count', 2500 + wp_rand( 10, 400 ) );
		}
	}
	if ( ! empty( $posted['loved'] ) || ! empty( $posted['viral'] ) || ! empty( $posted['harika'] ) || ! empty( $posted['trending'] ) ) {
		$likes = (int) get_post_meta( $post_id, 'my_theme_post_likes_count', true );
		if ( $likes < 120 ) {
			update_post_meta( $post_id, 'my_theme_post_likes_count', 120 + wp_rand( 5, 80 ) );
		}
	}
	if ( ! empty( $posted['sticky_home'] ) ) {
		stick_post( $post_id );
	}
}
add_action( 'save_post', 'my_theme_save_site_features' );

/**
 * Query posts with a feature flag.
 *
 * @param string $flag  Flag.
 * @param int    $limit Limit.
 * @return WP_Post[]
 */
function my_theme_get_posts_by_feature( $flag, $limit = 12 ) {
	$flag  = sanitize_key( $flag );
	$types = array( 'post', 'headline' );
	if ( 'photo' === $flag ) {
		$types[] = 'bv_photo';
	}
	if ( 'video' === $flag ) {
		$types[] = 'bv_video';
	}

	$q = new WP_Query(
		array(
			'post_type'           => $types,
			'posts_per_page'      => (int) $limit,
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
			'meta_query'          => array(
				array(
					'key'     => my_theme_feature_meta_key( $flag ),
					'value'   => '1',
					'compare' => '=',
				),
			),
			'orderby'             => 'date',
			'order'               => 'DESC',
		)
	);

	return ! empty( $q->posts ) ? array_values( $q->posts ) : array();
}

/**
 * Merge feature-flagged posts into a list (flagged first).
 *
 * @param WP_Post[] $posts Existing posts.
 * @param string    $flag  Feature.
 * @param int       $limit Max total.
 * @return WP_Post[]
 */
function my_theme_merge_feature_posts( $posts, $flag, $limit = 12 ) {
	$posts   = is_array( $posts ) ? $posts : array();
	$flagged = my_theme_get_posts_by_feature( $flag, $limit );
	$seen    = array();
	$out     = array();

	foreach ( array_merge( $flagged, $posts ) as $p ) {
		if ( ! ( $p instanceof WP_Post ) ) {
			continue;
		}
		$id = (int) $p->ID;
		if ( $id < 1 || isset( $seen[ $id ] ) ) {
			continue;
		}
		$seen[ $id ] = true;
		$out[]       = $p;
		if ( count( $out ) >= $limit ) {
			break;
		}
	}

	return $out;
}
