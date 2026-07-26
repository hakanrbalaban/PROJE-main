<?php
/**
 * Demo posts seeder with royalty-free placeholder images.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sample article body paragraphs.
 *
 * @param string $lead Lead sentence.
 * @return string
 */
function akishaber_demo_body( $lead ) {
	$extra = array(
		'<p>' . esc_html( $lead ) . '</p>',
		'<p>Konuya ilişkin değerlendirmelerde bulunan uzmanlar, sürecin yakından izlenmesi gerektiğini belirtti. Vatandaşların resmi açıklamaları esas alması öneriliyor.</p>',
		'<p>Gelişmenin ekonomik ve toplumsal etkileri önümüzdeki günlerde daha net görülecek. Yetkililer, gerekli önlemlerin alındığını ifade etti.</p>',
		'<h2>Ne oldu?</h2>',
		'<p>Günün öne çıkan başlıklarından biri haline gelen olay, kısa sürede kamuoyunun gündemine oturdu. Sosyal medyada da geniş yankı buldu.</p>',
		'<h2>Sonraki adımlar</h2>',
		'<ul><li>Resmi kurumların açıklamaları takip edilmeli</li><li>Güncel veriler düzenli kontrol edilmeli</li><li>Güvenilir kaynaklardan bilgi alınmalı</li></ul>',
		'<p><em>Bu içerik tema demosu içindir; telifsiz örnek metin olarak sunulmuştur.</em></p>',
	);
	return implode( "\n", $extra );
}

/**
 * Seed / refresh demo content.
 *
 * @param bool $force Force recreate sample posts.
 * @return int Number of posts created/updated.
 */
function akishaber_seed_demo_posts( $force = false ) {
	// Remove default Hello World.
	$hello = get_page_by_path( 'hello-world', OBJECT, 'post' );
	if ( ! $hello ) {
		$q = new WP_Query(
			array(
				'title'          => 'Merhaba dünya!',
				'post_type'      => 'post',
				'posts_per_page' => 1,
				'post_status'    => 'any',
			)
		);
		if ( $q->have_posts() ) {
			wp_trash_post( $q->posts[0]->ID );
		}
	} else {
		wp_trash_post( $hello->ID );
	}

	$samples = array(
		array(
			'title'   => 'Yapay zeka çağı: Haber odalarında dönüşüm hızlanıyor',
			'cat'     => 'teknoloji',
			'lead'    => 'Editöryel süreçlerde otomasyon artarken okuyucu güveni ve doğrulama standartları yeniden tanımlanıyor.',
			'sticky'  => true,
			'image'   => 'tech',
		),
		array(
			'title'   => 'TBMM’nin bu haftaki mesaisi belli oldu',
			'cat'     => 'politika',
			'lead'    => 'Meclis genel kurulu ve komisyon gündemi yoğun bir haftaya işaret ediyor.',
			'image'   => 'city',
		),
		array(
			'title'   => 'Mayıs enflasyon rakamları açıklandı',
			'cat'     => 'ekonomi',
			'lead'    => 'Piyasalar beklentilerin altında gelen verilere temkinli tepki verdi.',
			'image'   => 'finance',
		),
		array(
			'title'   => 'Devler Ligi finalinde dayanışma kampanyası',
			'cat'     => 'spor',
			'lead'    => 'Kulüpler ve taraftar grupları ortak yardım kampanyası için bir araya geldi.',
			'image'   => 'sport',
		),
		array(
			'title'   => 'Boğaz geçişlerinde yeni düzenleme yürürlüğe girdi',
			'cat'     => 'gundem',
			'lead'    => 'Ulaşım planlamasında yapılan değişiklikler sabah ve akşam saatlerinde trafiği etkileyecek.',
			'image'   => 'city',
		),
		array(
			'title'   => 'Kalp sağlığı araştırmasında yeni bulgular',
			'cat'     => 'saglik',
			'lead'    => 'Uzmanlar erken teşhis ve yaşam tarzı değişikliklerinin önemini vurguluyor.',
			'image'   => 'health',
		),
		array(
			'title'   => 'Dijital içerik üreticilerinin kazançları arttı',
			'cat'     => 'magazin',
			'lead'    => 'Sosyal medya ekonomisi büyümeye devam ederken yeni meslek tanımları ortaya çıkıyor.',
			'image'   => 'people',
		),
		array(
			'title'   => 'Meteoroloji’den 32 il için kritik uyarı',
			'cat'     => 'son-dakika',
			'lead'    => 'Sağanak ve fırtına uyarısı yapıldı; vatandaşların dikkatli olması istendi.',
			'image'   => 'nature',
		),
		array(
			'title'   => 'Kapadokya’ya bu yıl da turist akını oldu',
			'cat'     => 'foto-galeri',
			'lead'    => 'Bölgeye gelen yerli ve yabancı turist sayısı geçen yıla göre arttı.',
			'image'   => 'nature',
		),
		array(
			'title'   => 'Büyük şehir maratonundan renkli kareler',
			'cat'     => 'video',
			'lead'    => 'Maraton boyunca yaşanan heyecan ve dereceler kamera karşısına yansıdı.',
			'image'   => 'sport',
		),
		array(
			'title'   => 'Bahar aylarında nelere dikkat etmeliyiz?',
			'cat'     => 'yazarlar',
			'lead'    => 'Mevsim geçişlerinde bağışıklık, alerji ve uyku düzeni için pratik öneriler.',
			'image'   => 'health',
		),
		array(
			'title'   => 'Belediye hizmet alımı ihalesi duyurusu',
			'cat'     => 'ilanlar',
			'lead'    => 'Resmi ilan: Hizmet alımı ihalesi şartnamesi yayımlandı.',
			'image'   => 'city',
		),
		array(
			'title'   => 'Süper Lig’de takımların yaş ortalaması 27,51',
			'cat'     => 'spor',
			'lead'    => 'Lig genelinde gençleşme trendi sürüyor; altyapı yatırımları artıyor.',
			'image'   => 'sport',
		),
		array(
			'title'   => 'Erken emeklilik mümkün mü? Detaylar netleşiyor',
			'cat'     => 'ekonomi',
			'lead'    => 'Çalışma hayatı ve emeklilik düzenlemeleriyle ilgili merak edilen sorular yanıtlanıyor.',
			'image'   => 'finance',
		),
		array(
			'title'   => 'Milyonlarca hesap silinmeye hazırlanıyor',
			'cat'     => 'teknoloji',
			'lead'    => 'Platformlar aktif olmayan hesaplar için temizlik sürecine başlıyor.',
			'image'   => 'tech',
		),
		array(
			'title'   => 'Dış politikada yeni diplomasi trafiği',
			'cat'     => 'dunya',
			'lead'    => 'Uluslararası görüşmeler ve zirve hazırlıkları hız kazandı.',
			'image'   => 'city',
		),
		array(
			'title'   => 'Şehir hastanelerinde randevu yoğunluğu arttı',
			'cat'     => 'saglik',
			'lead'    => 'Sağlık yetkilileri online randevu sisteminin daha etkin kullanılmasını önerdi.',
			'image'   => 'health',
		),
		array(
			'title'  => 'Kentsel dönüşüm karmaşası bitmek bilmiyor',
			'cat'    => 'yazarlar',
			'lead'   => 'Mahalle ölçeğinde yaşanan belirsizlikler sakinleri ve yatırımcıları zorluyor.',
			'image'  => 'city',
		),
		array(
			'title'  => 'Sanayide üretim endeksi yükseldi',
			'cat'    => 'ekonomi',
			'lead'   => 'İmalat sanayi siparişleri üçüncü ay üst üste artış gösterdi.',
			'image'  => 'finance',
		),
		array(
			'title'  => 'A Milli Takım hazırlık kampına girdi',
			'cat'    => 'spor',
			'lead'   => 'Teknik heyet aday kadro listesini açıkladı; kritik maçlara sayılı günler kaldı.',
			'image'  => 'sport',
		),
		array(
			'title'  => 'Yeni nesil telefonlar piyasaya sürülüyor',
			'cat'    => 'teknoloji',
			'lead'   => 'Kamera ve pil ömrü odaklı modeller satışa çıktı.',
			'image'  => 'tech',
		),
		array(
			'title'  => 'Okullarda bahar dönemi etkinlikleri başladı',
			'cat'    => 'gundem',
			'lead'   => 'İl milli eğitim müdürlükleri kültür ve spor takvimini yayımladı.',
			'image'  => 'people',
		),
		array(
			'title'  => 'Uzmanlardan beslenme uyarısı',
			'cat'    => 'saglik',
			'lead'   => 'İşlenmiş gıdaların azaltılması ve su tüketiminin artırılması önerildi.',
			'image'  => 'health',
		),
		array(
			'title'  => 'Festival takvimi bu yaz dopdolu',
			'cat'    => 'magazin',
			'lead'   => 'Şehirlerde müzik ve sinema festivalleri peş peşe planlandı.',
			'image'  => 'people',
		),
		array(
			'title'  => 'Avrupa’da enerji piyasası hareketli',
			'cat'    => 'dunya',
			'lead'   => 'Doğalgaz stokları ve talep tahminleri fiyatları etkiledi.',
			'image'  => 'finance',
		),
		array(
			'title'  => 'Doğa yürüyüşlerinden seçilmiş kareler',
			'cat'    => 'foto-galeri',
			'lead'   => 'Hafta sonu rotalarından okuyucu fotoğrafları derlendi.',
			'image'  => 'nature',
		),
		array(
			'title'  => 'Kısa video: Trafikte dikkat çeken anlar',
			'cat'    => 'video',
			'lead'   => 'Şehir içi ulaşımda yaşanan ilginç görüntüler derlendi.',
			'image'  => 'city',
		),
	);

	$count = 0;
	foreach ( $samples as $sample ) {
		$existing_id = 0;
		$check       = new WP_Query(
			array(
				'title'          => $sample['title'],
				'post_type'      => 'post',
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'ids',
			)
		);
		if ( $check->have_posts() ) {
			$existing_id = (int) $check->posts[0];
			if ( ! $force ) {
				if ( $existing_id && ! has_post_thumbnail( $existing_id ) ) {
					akishaber_attach_demo_image( $existing_id, $sample['image'], $sample['title'] );
				}
				continue;
			}
		}

		$postarr = array(
			'post_title'   => $sample['title'],
			'post_content' => akishaber_demo_body( $sample['lead'] ),
			'post_excerpt' => $sample['lead'],
			'post_status'  => 'publish',
			'post_type'    => 'post',
			'post_author'  => get_current_user_id() ? get_current_user_id() : 1,
		);

		if ( $existing_id && $force ) {
			$postarr['ID'] = $existing_id;
			$id            = wp_update_post( $postarr, true );
		} else {
			$id = wp_insert_post( $postarr, true );
		}

		if ( is_wp_error( $id ) || ! $id ) {
			continue;
		}

		$term = get_term_by( 'slug', $sample['cat'], 'category' );
		if ( $term && ! is_wp_error( $term ) ) {
			wp_set_post_categories( $id, array( (int) $term->term_id ) );
		}

		if ( ! empty( $sample['sticky'] ) ) {
			stick_post( $id );
		}

		akishaber_attach_demo_image( $id, $sample['image'], $sample['title'] );
		$count++;
	}

	update_option( 'akishaber_demo_seeded', 1 );
	update_option( 'akishaber_demo_version', '1.2.0' );
	return $count;
}

/**
 * Attach a local theme placeholder image to a post.
 *
 * @param int    $post_id Post ID.
 * @param string $mood    Image mood key.
 * @param string $title   Title for alt.
 */
/**
 * Pick a photo mood from the post category.
 *
 * @param int $post_id Post ID.
 * @return string
 */
function akishaber_category_mood( $post_id ) {
	$categories = get_the_category( $post_id );
	$slug       = $categories ? $categories[0]->slug : '';
	$map        = array(
		'teknoloji'   => 'tech',
		'ekonomi'     => 'finance',
		'spor'        => 'sport',
		'saglik'      => 'health',
		'magazin'     => 'people',
		'yazarlar'    => 'people',
		'foto-galeri' => 'nature',
		'video'       => 'nature',
		'dunya'       => 'city',
		'gundem'      => 'city',
	);

	return isset( $map[ $slug ] ) ? $map[ $slug ] : 'news';
}

/**
 * Replace placeholder thumbnails with the bundled photography.
 *
 * @param bool $force Re-attach even when a real photo exists.
 * @return int Number of updated posts.
 */
function akishaber_refresh_post_images( $force = false ) {
	$posts = get_posts(
		array(
			'numberposts' => -1,
			'post_status' => array( 'publish', 'draft' ),
			'post_type'   => 'post',
		)
	);

	$updated = 0;
	foreach ( $posts as $post ) {
		$thumb_id = get_post_thumbnail_id( $post->ID );
		$file     = $thumb_id ? get_attached_file( $thumb_id ) : '';
		$name     = $file ? basename( $file ) : '';
		$is_stub  = ! $file
			|| ! file_exists( $file )
			|| preg_match( '/\.svg$/i', $name )
			|| 0 === strpos( $name, 'akis-ph-' )
			|| 0 === strpos( $name, 'akis-demo-' );

		if ( $thumb_id && ! $is_stub && ! $force ) {
			continue;
		}

		delete_post_thumbnail( $post->ID );
		akishaber_attach_demo_image( $post->ID, akishaber_category_mood( $post->ID ), $post->post_title );

		if ( has_post_thumbnail( $post->ID ) ) {
			$updated++;
		}
	}

	return $updated;
}

function akishaber_attach_demo_image( $post_id, $mood, $title ) {
	if ( has_post_thumbnail( $post_id ) ) {
		return;
	}

	$images = array(
		'tech'    => 'unsplash-tech.jpg',
		'city'    => 'unsplash-city.jpg',
		'finance' => 'unsplash-finance.jpg',
		'sport'   => 'unsplash-sport.jpg',
		'health'  => 'unsplash-health.jpg',
		'people'  => 'unsplash-people.jpg',
		'nature'  => 'unsplash-nature.jpg',
	);
	$n        = ( absint( $post_id ) % 8 ) + 1;
	$filename = isset( $images[ $mood ] ) ? $images[ $mood ] : 'unsplash-newsroom.jpg';
	$src_file = trailingslashit( AKISHABER_DIR ) . 'assets/images/' . $filename;
	if ( ! file_exists( $src_file ) ) {
		$src_file = trailingslashit( AKISHABER_DIR ) . 'assets/images/ph-' . $n . '.svg';
	}
	if ( ! file_exists( $src_file ) ) {
		return;
	}

	$ext  = pathinfo( $src_file, PATHINFO_EXTENSION );
	$mime = ( 'svg' === $ext ) ? 'image/svg+xml' : 'image/jpeg';
	$bits = wp_upload_bits(
		'akis-demo-' . $post_id . '-' . sanitize_file_name( $filename ),
		null,
		file_get_contents( $src_file ) // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	);

	if ( ! empty( $bits['error'] ) ) {
		return;
	}

	$attach_id = wp_insert_attachment(
		array(
			'post_mime_type' => $mime,
			'post_title'     => sanitize_file_name( $title ),
			'post_content'   => '',
			'post_status'    => 'inherit',
		),
		$bits['file'],
		$post_id
	);

	if ( is_wp_error( $attach_id ) || ! $attach_id ) {
		return;
	}

	require_once ABSPATH . 'wp-admin/includes/image.php';
	$meta = wp_generate_attachment_metadata( $attach_id, $bits['file'] );
	if ( $meta ) {
		wp_update_attachment_metadata( $attach_id, $meta );
	}
	update_post_meta( $attach_id, '_wp_attachment_image_alt', sanitize_text_field( $title ) );
	update_post_meta( $attach_id, '_akishaber_image_credit', 'Unsplash' );
	set_post_thumbnail( $post_id, $attach_id );
}

/**
 * Write SVG placeholder — kept for compatibility.
 *
 * @param string $mood Mood.
 * @param int    $post_id Post ID.
 * @return string|false Path.
 */
function akishaber_write_svg_placeholder( $mood, $post_id ) {
	$n   = ( absint( $post_id ) % 8 ) + 1;
	$src = trailingslashit( AKISHABER_DIR ) . 'assets/images/ph-' . $n . '.svg';
	return file_exists( $src ) ? $src : false;
}
