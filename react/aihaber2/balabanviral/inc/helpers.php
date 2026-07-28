<?php
/**
 * Helper PHP Functions
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Calculate Estimated Reading Time in Minutes
 *
 * @param int $post_id Post ID.
 * @return int Reading time in minutes.
 */
function my_theme_estimate_reading_time( $post_id = null ) {
	$content    = get_post_field( 'post_content', $post_id );
	$word_count = str_word_count( wp_strip_all_tags( $content ) );
	$wpm        = 200;
	$minutes    = ceil( $word_count / $wpm );

	return max( 1, $minutes );
}

/**
 * Echo a viral-style reaction bar (overlay on large media).
 *
 * @param int $post_id Post ID.
 */
function my_theme_react_bar( $post_id ) {
	$post_id = (int) $post_id;
	if ( $post_id < 1 ) {
		return;
	}

	$fire      = function_exists( 'my_theme_get_reaction_count' ) ? my_theme_get_reaction_count( $post_id, 'fire' ) : 12;
	$heart     = function_exists( 'my_theme_get_reaction_count' ) ? my_theme_get_reaction_count( $post_id, 'heart' ) : 28;
	$mindblown = function_exists( 'my_theme_get_reaction_count' ) ? my_theme_get_reaction_count( $post_id, 'mindblown' ) : 9;
	$like      = function_exists( 'my_theme_get_reaction_count' ) ? my_theme_get_reaction_count( $post_id, 'like' ) : 45;

	$is_viral = ( function_exists( 'my_theme_post_has_feature' ) && my_theme_post_has_feature( $post_id, 'viral' ) )
		|| my_theme_get_post_views( $post_id ) > 100;
	$is_trend = function_exists( 'my_theme_post_has_feature' ) && my_theme_post_has_feature( $post_id, 'trending' );
	?>
	<div class="bv-react-bar" aria-hidden="true">
		<?php if ( $is_viral ) : ?>
			<span class="bv-react-bar__chip bv-react-bar__chip--viral">💯</span>
		<?php elseif ( $is_trend ) : ?>
			<span class="bv-react-bar__chip bv-react-bar__chip--hot">🔥</span>
		<?php endif; ?>
		<span class="bv-react-bar__item">🔥 <em><?php echo esc_html( (string) $fire ); ?></em></span>
		<span class="bv-react-bar__item">❤️ <em><?php echo esc_html( (string) $heart ); ?></em></span>
		<span class="bv-react-bar__item">🤯 <em><?php echo esc_html( (string) $mindblown ); ?></em></span>
		<span class="bv-react-bar__item">👍 <em><?php echo esc_html( (string) $like ); ?></em></span>
	</div>
	<?php
}

/**
 * Track and Increment Post Views
 *
 * @param int $post_id Post ID.
 */
function my_theme_set_post_views( $post_id ) {
	$count_key = 'my_theme_post_views_count';
	$count     = get_post_meta( $post_id, $count_key, true );

	if ( '' === $count ) {
		$count = 0;
		delete_post_meta( $post_id, $count_key );
		add_post_meta( $post_id, $count_key, '1' );
	} else {
		$count++;
		update_post_meta( $post_id, $count_key, $count );
	}
}

/**
 * Get Post Views Count
 *
 * @param int $post_id Post ID.
 * @return int View count.
 */
function my_theme_get_post_views( $post_id ) {
	$count_key = 'my_theme_post_views_count';
	$count     = get_post_meta( $post_id, $count_key, true );

	if ( '' === $count ) {
		return 0;
	}

	return (int) $count;
}

/**
 * Curated Unsplash photo IDs (same set as React unsplash.ts).
 *
 * @return string[]
 */
function my_theme_unsplash_photo_ids() {
	return array(
		'1500530855697-b586d89ba3ee',
		'1497366216548-37526070297c',
		'1469474968028-56623f02e42e',
		'1506905925346-21bda4d32df4',
		'1519681393784-d120267933ba',
		'1470071459604-3b5ec3a7fe05',
		'1441974231531-c6227db76b6e',
		'1504674900247-0877df9cc836',
		'1517248135467-4c7eded6e7c0',
		'1528164344705-ba810fc98ed4',
		'1488646953014-85cb44e25828',
		'1518770660439-4636190af475',
		'1517694712202-14dd9538aa97',
		'1451187580459-43490279c0fa',
		'1532094349884-543bc11b234d',
		'1571019613454-1cb2f99b2d8b',
		'1516321318423-f06f85e504b3',
		'1499750310107-5fef28a66643',
		'1432821596592-e2c18b78144f',
		'1522202176988-66273c2fd55f',
		'1511988617331-a931d97d5b5a',
		'1475724017909-c28c8ac76bcb',
		'1492691527719-9d1e07e534b4',
		'1470225620780-dba8ba36b745',
		'1485846234645-a62644f84728',
		'1511632765486-a01980e58a9d',
		'1544367567-0f2fcb009e0b',
		'1507003211169-0a1dd7228f2d',
		'1551836022-d5d88e9218df',
		'1529626455594-4ff0802cfb7e',
	);
}

/**
 * Deterministic hash for Unsplash seed.
 *
 * @param string|int $seed Seed.
 * @return int
 */
function my_theme_hash_seed( $seed ) {
	$s = (string) ( $seed ? $seed : 'aiora' );
	$h = 0;
	$len = strlen( $s );
	for ( $i = 0; $i < $len; $i++ ) {
		$h = ( ( $h * 31 ) + ord( $s[ $i ] ) ) & 0xffffffff;
	}
	return $h;
}

/**
 * Unsplash cover URL (no API key).
 *
 * @param string|int $seed Seed.
 * @param int        $w    Width.
 * @param int        $h    Height.
 * @return string
 */
function my_theme_unsplash_url( $seed = 'aiora', $w = 1280, $h = 720 ) {
	$photos = my_theme_unsplash_photo_ids();
	$id     = $photos[ my_theme_hash_seed( $seed ) % count( $photos ) ];
	return sprintf(
		'https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=%d&h=%d&q=80',
		$id,
		(int) $w,
		(int) $h
	);
}

/**
 * Replace known-dead remote demo image URLs with a working cover.
 *
 * @param string   $url     Candidate URL.
 * @param int|null $post_id Post ID for deterministic rematch.
 * @return string
 */
function my_theme_repair_cover_url( $url, $post_id = null ) {
	if ( ! is_string( $url ) || '' === $url ) {
		return '';
	}

	// Removed / 404 Unsplash source IDs seen in older demo seeds.
	$dead_ids = array(
		'1499209974431-9dac3cea0047',
	);
	foreach ( $dead_ids as $dead_id ) {
		if ( false !== strpos( $url, $dead_id ) ) {
			return my_theme_get_fallback_image( $post_id ? $post_id : 'banner' );
		}
	}

	return esc_url_raw( $url );
}

/**
 * Cover image URL: featured image → custom meta → theme placeholder (or optional remote demo).
 *
 * @param int|null $post_id Post ID.
 * @return string
 */
function my_theme_get_cover_url( $post_id = null ) {
	if ( null === $post_id ) {
		$post_id = get_the_ID();
	}
	$post_id = (int) $post_id;
	if ( $post_id && has_post_thumbnail( $post_id ) ) {
		$thumb_id = (int) get_post_thumbnail_id( $post_id );
		$file     = $thumb_id ? get_attached_file( $thumb_id ) : '';
		$url      = get_the_post_thumbnail_url( $post_id, 'large' );
		if ( $url && ( ! $file || file_exists( $file ) ) ) {
			$fixed = my_theme_repair_cover_url( $url, $post_id );
			if ( $fixed ) {
				return $fixed;
			}
		}
	}
	if ( $post_id ) {
		$custom = get_post_meta( $post_id, 'my_theme_custom_image_url', true );
		if ( is_string( $custom ) && $custom ) {
			$fixed = my_theme_repair_cover_url( $custom, $post_id );
			if ( $fixed ) {
				return $fixed;
			}
		}
	}
	return my_theme_get_fallback_image( $post_id ? $post_id : 'banner' );
}

/**
 * Fallback image — local placeholder by default (marketplace safe).
 * Optional remote Unsplash only when Customizer toggle is enabled.
 *
 * @param int|null $post_id Optional post ID for deterministic cover.
 * @return string Image URL.
 */
function my_theme_get_fallback_image( $post_id = null ) {
	if ( get_theme_mod( 'my_theme_allow_remote_demo_images', false ) ) {
		if ( null === $post_id ) {
			$post_id = get_the_ID();
		}
		$seed = $post_id ? $post_id : 'banner';
		return my_theme_unsplash_url( $seed, 1280, 720 );
	}
	return get_template_directory_uri() . '/assets/images/placeholder.svg';
}

/**
 * Photo gallery items.
 *
 * @param int    $count  Count.
 * @param string $prefix Seed prefix.
 * @return array<int, array{id:string,src:string,title:string}>
 */
function my_theme_unsplash_gallery( $count = 10, $prefix = 'foto' ) {
	$items = array();
	for ( $i = 0; $i < $count; $i++ ) {
		$items[] = array(
			'id'    => $prefix . '-' . $i,
			'src'   => my_theme_unsplash_url( $prefix . '-' . $i, 800, 600 ),
			'title' => sprintf( /* translators: %d gallery index */ __( 'Galeri %d', 'balabanviral' ), $i + 1 ),
		);
	}
	return $items;
}

/**
 * Category emoji map (React CATEGORY_META).
 *
 * @param string $name Category name.
 * @return array{emoji:string,accent:string}
 */
function my_theme_category_meta( $name ) {
	$map = array(
		'teknoloji' => array( 'emoji' => '💻', 'accent' => '#00e5c0' ),
		'bilim'     => array( 'emoji' => '🔬', 'accent' => '#4dabff' ),
		'yaşam'     => array( 'emoji' => '🌟', 'accent' => '#ffd23f' ),
		'yasam'     => array( 'emoji' => '🌟', 'accent' => '#ffd23f' ),
		'kültür'    => array( 'emoji' => '🎬', 'accent' => '#ff6b9d' ),
		'kultur'    => array( 'emoji' => '🎬', 'accent' => '#ff6b9d' ),
		'sağlık'    => array( 'emoji' => '💪', 'accent' => '#7dffb3' ),
		'saglik'    => array( 'emoji' => '💪', 'accent' => '#7dffb3' ),
		'seyahat'   => array( 'emoji' => '✈️', 'accent' => '#5ce1ff' ),
		'yemek'     => array( 'emoji' => '🍜', 'accent' => '#ff9f1c' ),
		'astroloji' => array( 'emoji' => '🔮', 'accent' => '#c77dff' ),
		'din'       => array( 'emoji' => '🕌', 'accent' => '#f4c95f' ),
		'eğitim'    => array( 'emoji' => '📚', 'accent' => '#6ea8fe' ),
		'egitim'    => array( 'emoji' => '📚', 'accent' => '#6ea8fe' ),
		'doğa'      => array( 'emoji' => '🌿', 'accent' => '#52d681' ),
		'doga'      => array( 'emoji' => '🌿', 'accent' => '#52d681' ),
		'tasarım'   => array( 'emoji' => '🎨', 'accent' => '#ff7a59' ),
		'tasarim'   => array( 'emoji' => '🎨', 'accent' => '#ff7a59' ),
		'psikoloji' => array( 'emoji' => '🧠', 'accent' => '#ff8fab' ),
	);
	$key = strtolower( remove_accents( $name ) );
	$key = preg_replace( '/\s+/', '', $key );
	if ( isset( $map[ $key ] ) ) {
		return $map[ $key ];
	}
	return array( 'emoji' => '✨', 'accent' => '#ff2d6a' );
}

/**
 * Day-of-year index for rotating sidebar content.
 *
 * @param int $len Length.
 * @return int
 */
function my_theme_day_index( $len ) {
	$d   = new DateTime( 'now', wp_timezone() );
	$key = ( (int) $d->format( 'Y' ) * 1000 ) + ( (int) $d->format( 'n' ) * 50 ) + (int) $d->format( 'j' );
	return $len > 0 ? $key % $len : 0;
}

/**
 * Static/demo widgets — sample data only, not live APIs.
 *
 * @return array
 */
function my_theme_get_widgets_data() {
	$quotes = array(
		array( 'text' => 'Bilgi, paylaşıldıkça çoğalır.', 'author' => 'Anonim' ),
		array( 'text' => 'Yavaşlamak bazen en hızlı yoldur.', 'author' => 'BalabanViral' ),
		array( 'text' => 'Küçük alışkanlıklar, büyük karakterler örer.', 'author' => 'BalabanViral' ),
		array( 'text' => 'Merak, öğrenmenin yakıtıdır.', 'author' => 'Anonim' ),
		array( 'text' => 'Sadeleşmek, cesaret ister.', 'author' => 'BalabanViral' ),
	);
	$hadiths = array(
		array(
			'text'   => 'Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.',
			'source' => 'Örnek metin — doğrulama alıcıya aittir',
		),
		array(
			'text'   => 'Mümin, insanların kendisinden emin olduğu kimsedir.',
			'source' => 'Örnek metin — doğrulama alıcıya aittir',
		),
		array(
			'text'   => 'Temizlik imandandır.',
			'source' => 'Örnek metin — doğrulama alıcıya aittir',
		),
	);
	$verses = array(
		array( 'text' => 'Şüphesiz zorlukla beraber bir kolaylık vardır.', 'ref' => 'Örnek meal özeti' ),
		array( 'text' => 'Rabbinizin nimetini anlat.', 'ref' => 'Örnek meal özeti' ),
		array( 'text' => 'Allah, sabredenlerle beraberdir.', 'ref' => 'Örnek meal özeti' ),
	);
	$facts = array(
		'Balinaların şarkıları okyanusta yüzlerce kilometre yol alabilir.',
		'Bir ağaç, ömrü boyunca tonlarca karbon dioksiti bünyesinde tutabilir.',
		'Balın “son kullanma tarihi” pratikte yoktur; uygun saklanırsa çok uzun süre kalır.',
		'Gökkuşağı aslında tam bir dairedir; yerden yarım görünür.',
	);
	$words = array(
		array( 'word' => 'Meraki', 'meaning' => 'Bir işi gönülden, özenle yapmak.' ),
		array( 'word' => 'Hygge', 'meaning' => 'Sıcak, rahat, güvenli bir atmosfer yaratma hali.' ),
		array( 'word' => 'Ikigai', 'meaning' => 'Yaşam nedeni; tutku ve misyon kesişimi.' ),
		array( 'word' => 'Sabr', 'meaning' => 'Zorluk karşısında dengeyi koruma erdemi.' ),
	);
	$horoscope_lines = array(
		'Küçük bir düzenleme günü: masanı toparla, zihin de netleşsin.',
		'İletişimde netlik kazandırır. Kısa ve nazik mesajlar yeğlenir.',
		'Enerjin dalgalı olabilir; kısa yürüyüş denge getirir.',
		'Öğrenme isteğin yüksek. 20 dakikalık odak bloğu yeterli.',
		'İlişkilerde dinlemek, konuşmaktan daha değerli.',
		'Planlarını sadeleştir; acele karar yerine kısa bir mola ver.',
	);
	$zodiac = array(
		array( 'id' => 'koc', 'label' => 'Koç', 'range' => '21 Mar – 19 Nis' ),
		array( 'id' => 'boga', 'label' => 'Boğa', 'range' => '20 Nis – 20 May' ),
		array( 'id' => 'ikizler', 'label' => 'İkizler', 'range' => '21 May – 20 Haz' ),
		array( 'id' => 'yengec', 'label' => 'Yengeç', 'range' => '21 Haz – 22 Tem' ),
		array( 'id' => 'aslan', 'label' => 'Aslan', 'range' => '23 Tem – 22 Ağu' ),
		array( 'id' => 'basak', 'label' => 'Başak', 'range' => '23 Ağu – 22 Eyl' ),
		array( 'id' => 'terazi', 'label' => 'Terazi', 'range' => '23 Eyl – 22 Eki' ),
		array( 'id' => 'akrep', 'label' => 'Akrep', 'range' => '23 Eki – 21 Kas' ),
		array( 'id' => 'yay', 'label' => 'Yay', 'range' => '22 Kas – 21 Ara' ),
		array( 'id' => 'oglak', 'label' => 'Oğlak', 'range' => '22 Ara – 19 Oca' ),
		array( 'id' => 'kova', 'label' => 'Kova', 'range' => '20 Oca – 18 Şub' ),
		array( 'id' => 'balik', 'label' => 'Balık', 'range' => '19 Şub – 20 Mar' ),
	);

	$qi = my_theme_day_index( count( $quotes ) );
	$hi = my_theme_day_index( count( $hadiths ) );
	$vi = my_theme_day_index( count( $verses ) );
	$fi = my_theme_day_index( count( $facts ) );
	$wi = my_theme_day_index( count( $words ) );

	$horoscopes = array();
	foreach ( $zodiac as $i => $z ) {
		$horoscopes[] = array(
			'id'    => $z['id'],
			'label' => $z['label'],
			'range' => $z['range'],
			'text'  => $horoscope_lines[ ( $i + my_theme_day_index( count( $horoscope_lines ) ) ) % count( $horoscope_lines ) ],
		);
	}

	return array(
		'weather'       => array(
			'city'        => 'İstanbul',
			'temperature' => 24,
			'unit'        => '°C',
			'code'        => 2,
			'humidity'    => 55,
			'wind'        => 12,
			'label'       => 'Parçalı bulutlu',
		),
		'currency'      => array(
			'source' => 'Örnek gösterge — canlı kur değil',
			'pairs'  => array(
				array( 'code' => 'USD', 'label' => 'USD/TRY', 'value' => 34.12 ),
				array( 'code' => 'EUR', 'label' => 'EUR/TRY', 'value' => 36.85 ),
				array( 'code' => 'GBP', 'label' => 'GBP/TRY', 'value' => 43.20 ),
			),
		),
		'markets'       => array(
			'note'  => 'Gösterge değerler — gerçek zamanlı değil',
			'items' => array(
				array( 'symbol' => 'XU100', 'name' => 'BIST 100', 'value' => 9842, 'change' => 0.8 ),
				array( 'symbol' => 'XAU', 'name' => 'Altın', 'value' => 2650, 'change' => -0.3 ),
				array( 'symbol' => 'BTC', 'name' => 'Bitcoin', 'value' => 67500, 'change' => 1.4 ),
			),
		),
		'quote'         => $quotes[ $qi ],
		'horoscopes'    => $horoscopes,
		'hadith'        => $hadiths[ $hi ],
		'verse'         => $verses[ $vi ],
		'religiousTip'  => array(
			'title' => 'Günün notu',
			'text'  => 'Kısa bir teşekkür ve sakin bir nefes — günü yumuşatır.',
		),
		'prayer'        => array(
			'city'  => 'İstanbul',
			'date'  => wp_date( 'j F Y' ),
			'note'  => 'Yaklaşık vakitler — yerel takvimi doğrulayın',
			'times' => array(
				'imsak'  => '04:12',
				'güneş'  => '05:48',
				'öğle'   => '13:15',
				'ikindi' => '17:02',
				'akşam'  => '20:32',
				'yatsı'  => '22:05',
			),
		),
		'word'          => $words[ $wi ],
		'funFact'       => $facts[ $fi ],
	);
}
