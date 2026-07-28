<?php
/**
 * Auto-Seeder and Dummy Data Importer with Unsplash Images & Gallery Content
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Auto-seed Categories, Static Pages, Articles, Photo Galleries, and Video Galleries with Unsplash Images.
 */
function my_theme_seed_dummy_data_v3() {
	if ( get_option( 'my_theme_dummy_data_seeded_v3' ) ) {
		return;
	}

	// Unsplash Image Library Mapping by Category
	$unsplash_library = array(
		'teknoloji' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
		'bilim'     => 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
		'yasam'     => 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
		'kultur'    => 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
		'saglik'    => 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
		'seyahat'   => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
		'yemek'     => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
		'astroloji' => 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=1200&q=80',
		'din'       => 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
		'egitim'    => 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
		'doga'      => 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
		'tasarim'   => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
		'psikoloji' => 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
	);

	// Categories Definition
	$categories_meta = array(
		'teknoloji' => array( 'Teknoloji', '💻' ),
		'bilim'     => array( 'Bilim', '🔬' ),
		'yasam'     => array( 'Yaşam', '🌟' ),
		'kultur'    => array( 'Kültür', '🎬' ),
		'saglik'    => array( 'Sağlık', '💪' ),
		'seyahat'   => array( 'Seyahat', '✈️' ),
		'yemek'     => array( 'Yemek', '🍜' ),
		'astroloji' => array( 'Astroloji', '🔮' ),
		'din'       => array( 'Din', '🕌' ),
		'egitim'    => array( 'Eğitim', '📚' ),
		'doga'      => array( 'Doğa', '🌿' ),
		'tasarim'   => array( 'Tasarım', '🎨' ),
		'psikoloji' => array( 'Psikoloji', '🧠' ),
		'foto-galeri'  => array( 'Foto Galeri', '📸' ),
		'video-galeri' => array( 'Video Galeri', '🎥' ),
	);

	$cat_ids = array();
	foreach ( $categories_meta as $slug => $data ) {
		$term = get_term_by( 'slug', $slug, 'category' );
		if ( ! $term ) {
			$inserted = wp_insert_term( $data[0], 'category', array( 'slug' => $slug ) );
			if ( ! is_wp_error( $inserted ) ) {
				$cat_ids[ $slug ] = $inserted['term_id'];
			}
		} else {
			$cat_ids[ $slug ] = $term->term_id;
		}
	}

	// Sample Rich Articles
	$articles = array(
		array(
			'title'     => 'Güzel Günlere Yolculuk: “Bir Gün” Değil, “Bugün” Başlayan Bir Hikâye',
			'excerpt'   => 'Güzel günler bir anda gelmez. Küçük adımlar, nazik bir iç ses ve sistemle başlayan bir yolculuğun haritası.',
			'category'  => 'psikoloji',
			'author'    => 'Hakan Rüştü Balaban',
			'views'     => 4520,
			'likes'     => 340,
			'image'     => 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
			'tags'      => array( 'güzelgünler', 'psikoloji', 'umut', 'yaşam' ),
			'content'   => '<h2>1) Güzel Günler Nedir? Herkesin Tanımı Başkadır</h2><p>Güzel günler kimi için huzurlu bir evdir. Kimi için sağlıklı bir beden. Kimi için sevildiğini hissetmek. İnsanın ilk adımı şudur: Güzel günlerin tanımını başkasından ödünç alma.</p><h2>2) Yolculuk Bir Düzen Kurma Meselesi</h2><p>Güzel günlerin sırrı çoğu zaman motivasyon değil, sistemdir. Motivasyon dalgalanır, sistem kalır. Uyanınca 5 dakika telefona bakmamak, günde 10 dakika yürümek, 1 bardak fazla su içmek gibi küçük adımlar kimliğinizi değiştirir.</p><h2>3) 7 Günlük Mini Plan</h2><ul><li>1. Gün: 15 dakika yürüyüş</li><li>2. Gün: Sabah 20 dk telefonsuz zaman</li><li>3. Gün: Evde 10 dk toparlama</li><li>4. Gün: Bir arkadaşa nasılsın mesajı</li><li>5. Gün: 30 dk öğrenme</li></ul>',
		),
		array(
			'title'     => 'Yerel Modeller: Bilgisayarınızda Çalışan Yapay Zekâ Devrimi',
			'excerpt'   => 'Bulut şart değil. Açık kaynak modeller, gizlilik ve hız isteyenler için masaüstüne indi.',
			'category'  => 'teknoloji',
			'author'    => 'BalabanViral',
			'views'     => 5120,
			'likes'     => 410,
			'image'     => 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
			'tags'      => array( 'teknoloji', 'AI', 'donanım', 'yazılım' ),
			'content'   => '<h2>Neden Yerel Yapay Zekâ?</h2><p>Şirket notları ve kişisel günlükler buluta çıkmadan işlenebilir. Ağ gecikmesi ortadan kalkar; yanıtlar milisaniyeler mertebesinde gelebilir.</p><h2>Başlarken Gerekli Sistem Gereksinimleri</h2><p>Önce bilgisayarınızın RAM kapasitesini kontrol edin. 16 GB ile küçük modeller, 32 GB ve üzeri sistemlerde devasa açık kaynak modeller akıcı şekilde çalışır.</p>',
		),
		array(
			'title'     => 'Dünyanın En Büyüleyici 10 Fotoğrafik Yürüyüş Rotası',
			'excerpt'   => 'Kamera çantanızı hazırlayın. Doğa ve mimari fotoğrafçılığı için unutulmaz yürüyüş rotalarını derledik.',
			'category'  => 'seyahat',
			'author'    => 'Gezgin Editör',
			'views'     => 3890,
			'likes'     => 290,
			'image'     => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
			'tags'      => array( 'seyahat', 'fotoğraf', 'doğa', 'gezi' ),
			'content'   => '<h2>1. İsviçre Alpleri ve Vadiler</h2><p>Yüksek dağ manzaraları ve eşsiz yeşil vadiler fotoğraf tutkunları için eşsiz kareler sunuyor.</p><h2>2. Kapadokya Peri Bacaları ve Balon Rotası</h2><p>Gün doğumunda gökyüzünü kaplayan balonlar ve mistik vadi manzaraları.</p>',
		),
		array(
			'title'     => 'Odak Sürenizi 3 Katına Çıkaran 7 Mikro Alışkanlık',
			'excerpt'   => 'Bildirimler çağında dikkati korumak bir lüks değil, bilinçli bir tasarım. Küçük ritüeller büyük fark yaratır.',
			'category'  => 'yasam',
			'author'    => 'BalabanViral',
			'views'     => 3120,
			'likes'     => 235,
			'image'     => 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
			'tags'      => array( 'üretkenlik', 'odak', 'yaşam', 'disiplin' ),
			'content'   => '<h2>Tek Sekme Kuralı</h2><p>Bir işi bitirene kadar yalnızca o işe ait sekme açık kalsın. Zihinsel odağı korumanın en pratik yolu budur.</p>',
		),
		array(
			'title'     => '📸 [Foto Galeri] Doğan Günün Büyüleyici Doğa Manzaraları',
			'excerpt'   => 'Dünyanın dört bir yanından çekilmiş en etkileyici doğa ve manzara fotoğraflarından oluşan yüksek çözünürlüklü galeri.',
			'category'  => 'foto-galeri',
			'author'    => 'Foto Galeri Editörü',
			'views'     => 6200,
			'likes'     => 520,
			'image'     => 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
			'tags'      => array( 'galeri', 'fotogaleri', 'doğa', 'manzara' ),
			'content'   => '<p>En yüksek çözünürlüklü doğa fotoğraflarından derlenen bu özel albümde yeşilin ve mavinin büyüleyici uyumuna tanıklık edin.</p><div class="grid grid-cols-2 gap-3 my-6"><img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80" class="rounded-xl shadow"/><img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" class="rounded-xl shadow"/></div>',
		),
		array(
			'title'     => '🎥 [Video Galeri] Geleceğin Teknolojileri ve Yapay Zekâ İncelemesi',
			'excerpt'   => 'Önümüzdeki 10 yıla damga vuracak en yeni teknolojik buluşlar ve yapay zekâ gösterim videosu.',
			'category'  => 'video-galeri',
			'author'    => 'Video Editörü',
			'views'     => 7890,
			'likes'     => 680,
			'image'     => 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
			'tags'      => array( 'videogaleri', 'teknoloji', 'video', 'izle' ),
			'content'   => '<p>Teknoloji dünyasındaki son gelişmeleri canlı olarak incelediğimiz özel video serimiz yayında.</p><div class="my-6 aspect-video rounded-2xl overflow-hidden shadow-2xl border border-[var(--line)]"><iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" title="Video" allowfullscreen></iframe></div>',
		),
	);

	foreach ( $articles as $art ) {
		$post_exists = get_page_by_title( $art['title'], OBJECT, 'post' );
		if ( ! $post_exists ) {
			$post_cat_id = isset( $cat_ids[ $art['category'] ] ) ? $cat_ids[ $art['category'] ] : 1;

			$post_id = wp_insert_post(
				array(
					'post_title'   => $art['title'],
					'post_excerpt' => $art['excerpt'],
					'post_content' => $art['content'],
					'post_status'  => 'publish',
					'post_type'    => 'post',
					'post_category'=> array( $post_cat_id ),
					'tags_input'   => $art['tags'],
				)
			);

			if ( ! is_wp_error( $post_id ) ) {
				update_post_meta( $post_id, 'my_theme_post_views_count', $art['views'] );
				update_post_meta( $post_id, 'my_theme_post_likes_count', $art['likes'] );
				update_post_meta( $post_id, 'my_theme_custom_image_url', $art['image'] );

				// Add a sample comment
				wp_insert_comment(
					array(
						'comment_post_ID'      => $post_id,
						'comment_author'       => 'Ahmet Yılmaz',
						'comment_author_email' => 'ahmet@example.com',
						'comment_content'      => 'Harika bir haber ve harika görseller, emeğinize sağlık!',
						'comment_approved'     => 1,
					)
				);
			}
		}
	}

	update_option( 'my_theme_dummy_data_seeded_v3', true );
}

/**
 * Seed Foto / Video CPT gallery items (manual / optional import only).
 */
function my_theme_seed_media_galleries_v4() {
	if ( get_option( 'my_theme_media_galleries_seeded_v4' ) ) {
		return;
	}

	$photos = array(
		array(
			'title'   => __( 'Sabah ışığında sahil', 'balabanviral' ),
			'excerpt' => __( 'Sakin bir liman ve altın tonlarında gün doğumu.', 'balabanviral' ),
			'image'   => '',
		),
		array(
			'title'   => __( 'Şehir silüeti', 'balabanviral' ),
			'excerpt' => __( 'Gece ışıkları ve modern mimari kareleri.', 'balabanviral' ),
			'image'   => '',
		),
		array(
			'title'   => __( 'Orman yolu', 'balabanviral' ),
			'excerpt' => __( 'Sisle kaplı yeşil bir patika.', 'balabanviral' ),
			'image'   => '',
		),
		array(
			'title'   => __( 'Dağ zirvesi', 'balabanviral' ),
			'excerpt' => __( 'Yüksek irtifadan geniş manzara.', 'balabanviral' ),
			'image'   => '',
		),
		array(
			'title'   => __( 'Cafe detayları', 'balabanviral' ),
			'excerpt' => __( 'Sıcak tonlarda yaşam stili kareleri.', 'balabanviral' ),
			'image'   => '',
		),
		array(
			'title'   => __( 'Renkli pazar', 'balabanviral' ),
			'excerpt' => __( 'Sokak lezzetleri ve canlı tezgâhlar.', 'balabanviral' ),
			'image'   => '',
		),
	);

	$videos = array(
		array(
			'title' => __( 'Şehirde sabah yürüyüşü', 'balabanviral' ),
			'url'   => 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
			'image' => '',
		),
		array(
			'title' => __( 'Doğa ve sessizlik', 'balabanviral' ),
			'url'   => 'https://www.youtube.com/watch?v=5qap5aO4i9A',
			'image' => '',
		),
		array(
			'title' => __( 'Mutfak ritüeli', 'balabanviral' ),
			'url'   => 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
			'image' => '',
		),
		array(
			'title' => __( 'Odak müziği', 'balabanviral' ),
			'url'   => 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
			'image' => '',
		),
		array(
			'title' => __( 'Teknoloji vitrini', 'balabanviral' ),
			'url'   => 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
			'image' => '',
		),
		array(
			'title' => __( 'Gece şehir turu', 'balabanviral' ),
			'url'   => 'https://www.youtube.com/watch?v=sNPnbI1arSE',
			'image' => '',
		),
	);

	foreach ( $photos as $photo ) {
		$exists = get_page_by_title( $photo['title'], OBJECT, 'bv_photo' );
		if ( $exists ) {
			continue;
		}
		$pid = wp_insert_post(
			array(
				'post_title'   => $photo['title'],
				'post_excerpt' => $photo['excerpt'],
				'post_content' => '<p>' . esc_html( $photo['excerpt'] ) . '</p>',
				'post_status'  => 'publish',
				'post_type'    => 'bv_photo',
			)
		);
		if ( ! is_wp_error( $pid ) && ! empty( $photo['image'] ) ) {
			update_post_meta( $pid, 'my_theme_custom_image_url', $photo['image'] );
		}
	}

	foreach ( $videos as $video ) {
		$exists = get_page_by_title( $video['title'], OBJECT, 'bv_video' );
		if ( $exists ) {
			continue;
		}
		$pid = wp_insert_post(
			array(
				'post_title'   => $video['title'],
				'post_excerpt' => __( 'Video galeri içeriği', 'balabanviral' ),
				'post_content' => '<p>' . esc_html__( 'Video galeri içeriği — kapaktan izleyebilirsiniz.', 'balabanviral' ) . '</p>',
				'post_status'  => 'publish',
				'post_type'    => 'bv_video',
			)
		);
		if ( ! is_wp_error( $pid ) ) {
			update_post_meta( $pid, '_bv_video_url', $video['url'] );
			if ( ! empty( $video['image'] ) ) {
				update_post_meta( $pid, 'my_theme_custom_image_url', $video['image'] );
			}
		}
	}

	update_option( 'my_theme_media_galleries_seeded_v4', true );
	flush_rewrite_rules( false );
}

/**
 * Admin: optional one-click demo content (never auto-runs).
 */
function my_theme_demo_import_menu() {
	add_theme_page(
		__( 'Demo İçerik', 'balabanviral' ),
		__( 'Demo İçerik', 'balabanviral' ),
		'manage_options',
		'balabanviral-demo',
		'my_theme_demo_import_page'
	);
}
add_action( 'admin_menu', 'my_theme_demo_import_menu' );

/**
 * Render demo import page.
 */
function my_theme_demo_import_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$notice = '';
	if ( isset( $_POST['bv_import_demo'] ) && check_admin_referer( 'bv_import_demo_action', 'bv_import_demo_nonce' ) ) {
		delete_option( 'my_theme_dummy_data_seeded_v3' );
		delete_option( 'my_theme_media_galleries_seeded_v4' );
		my_theme_seed_dummy_data_v3();
		my_theme_seed_media_galleries_v4();
		$notice = __( 'Demo içerik içe aktarıldı.', 'balabanviral' );
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'BalabanViral — Demo İçerik', 'balabanviral' ); ?></h1>
		<?php if ( $notice ) : ?>
			<div class="notice notice-success"><p><?php echo esc_html( $notice ); ?></p></div>
		<?php endif; ?>
		<p><?php esc_html_e( 'Tema otomatik içerik eklemez. İsterseniz örnek yazılar, foto ve video galeri kayıtlarını tek tıkla ekleyebilirsiniz.', 'balabanviral' ); ?></p>
		<form method="post">
			<?php wp_nonce_field( 'bv_import_demo_action', 'bv_import_demo_nonce' ); ?>
			<?php submit_button( __( 'Demo içeriği içe aktar', 'balabanviral' ), 'primary', 'bv_import_demo' ); ?>
		</form>
	</div>
	<?php
}
