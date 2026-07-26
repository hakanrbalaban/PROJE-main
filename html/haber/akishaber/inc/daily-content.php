<?php
/**
 * Daily rotating content: quote, verse, horoscope and demo weather data.
 *
 * All data sets are filterable so site owners can replace them with live
 * services without editing the theme.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Day index used to rotate daily content.
 *
 * @param int $modulo Set size.
 * @return int
 */
function akishaber_day_index( $modulo ) {
	$modulo = max( 1, absint( $modulo ) );

	return (int) date_i18n( 'z' ) % $modulo;
}

/**
 * Quote of the day.
 *
 * @return array{text:string,author:string}
 */
function akishaber_daily_quote() {
	$custom = get_theme_mod( 'akishaber_quote_custom', '' );
	if ( $custom ) {
		$parts = explode( '|', $custom, 2 );

		return array(
			'text'   => trim( $parts[0] ),
			'author' => isset( $parts[1] ) ? trim( $parts[1] ) : '',
		);
	}

	$quotes = apply_filters(
		'akishaber_daily_quotes',
		array(
			array( 'Ya olduğun gibi görün ya göründüğün gibi ol.', 'Mevlânâ' ),
			array( 'Hayatta en hakiki mürşit ilimdir.', 'Mustafa Kemal Atatürk' ),
			array( 'Gelin tanış olalım, işi kolay kılalım.', 'Yunus Emre' ),
			array( 'Bilmediğini bilen öğrenir.', 'Konfüçyüs' ),
			array( 'Adalet mülkün temelidir.', 'Türk Atasözü' ),
			array( 'Zaman, en doğru sözü söyleyen tanıktır.', 'Sokrates' ),
			array( 'Akıl yaşta değil baştadır.', 'Türk Atasözü' ),
			array( 'İnsan, ancak emeğinin karşılığını görür.', 'Halk Sözü' ),
			array( 'Bir milletin kaderi eğitimiyle çizilir.', 'Mustafa Kemal Atatürk' ),
			array( 'Doğruluk, en güvenli yoldur.', 'Halk Sözü' ),
			array( 'Sabır acıdır ama meyvesi tatlıdır.', 'Türk Atasözü' ),
			array( 'İyi bir soru, iyi bir cevaptan değerlidir.', 'Halk Sözü' ),
		)
	);

	$item = $quotes[ akishaber_day_index( count( $quotes ) ) ];

	return array(
		'text'   => $item[0],
		'author' => $item[1],
	);
}

/**
 * Verse / wisdom of the day.
 *
 * @return array{text:string,source:string}
 */
function akishaber_daily_verse() {
	$custom = get_theme_mod( 'akishaber_verse_custom', '' );
	if ( $custom ) {
		$parts = explode( '|', $custom, 2 );

		return array(
			'text'   => trim( $parts[0] ),
			'source' => isset( $parts[1] ) ? trim( $parts[1] ) : '',
		);
	}

	$verses = apply_filters(
		'akishaber_daily_verses',
		array(
			array( 'Şüphesiz zorlukla beraber bir kolaylık vardır.', 'İnşirah, 6' ),
			array( 'Allah hiçbir kimseye gücünün üstünde bir şey yüklemez.', 'Bakara, 286' ),
			array( 'İyilikle kötülük bir olmaz. Sen kötülüğü en güzel şekilde sav.', 'Fussilet, 34' ),
			array( 'Sabredenlere mükâfatları hesapsız ödenecektir.', 'Zümer, 10' ),
			array( 'Kim zerre kadar iyilik yaparsa onun karşılığını görür.', 'Zilzâl, 7' ),
			array( 'Sözün en güzelini söyleyin.', 'İsrâ, 53' ),
			array( 'Rabbim, ilmimi artır.', 'Tâhâ, 114' ),
			array( 'Ölçüyü ve tartıyı adaletle yerine getirin.', 'En’âm, 152' ),
		)
	);

	$item = $verses[ akishaber_day_index( count( $verses ) ) ];

	return array(
		'text'   => $item[0],
		'source' => $item[1],
	);
}

/**
 * Zodiac signs with date ranges.
 *
 * @return array<string,array{name:string,range:string}>
 */
function akishaber_zodiac_signs() {
	return apply_filters(
		'akishaber_zodiac_signs',
		array(
			'koc'     => array( 'name' => __( 'Koç', 'akishaber' ), 'range' => '21 Mar - 20 Nis' ),
			'boga'    => array( 'name' => __( 'Boğa', 'akishaber' ), 'range' => '21 Nis - 21 May' ),
			'ikizler' => array( 'name' => __( 'İkizler', 'akishaber' ), 'range' => '22 May - 22 Haz' ),
			'yengec'  => array( 'name' => __( 'Yengeç', 'akishaber' ), 'range' => '23 Haz - 22 Tem' ),
			'aslan'   => array( 'name' => __( 'Aslan', 'akishaber' ), 'range' => '23 Tem - 22 Ağu' ),
			'basak'   => array( 'name' => __( 'Başak', 'akishaber' ), 'range' => '23 Ağu - 22 Eyl' ),
			'terazi'  => array( 'name' => __( 'Terazi', 'akishaber' ), 'range' => '23 Eyl - 22 Eki' ),
			'akrep'   => array( 'name' => __( 'Akrep', 'akishaber' ), 'range' => '23 Eki - 21 Kas' ),
			'yay'     => array( 'name' => __( 'Yay', 'akishaber' ), 'range' => '22 Kas - 21 Ara' ),
			'oglak'   => array( 'name' => __( 'Oğlak', 'akishaber' ), 'range' => '22 Ara - 20 Oca' ),
			'kova'    => array( 'name' => __( 'Kova', 'akishaber' ), 'range' => '21 Oca - 18 Şub' ),
			'balik'   => array( 'name' => __( 'Balık', 'akishaber' ), 'range' => '19 Şub - 20 Mar' ),
		)
	);
}

/**
 * Daily comment for a zodiac sign.
 *
 * @param string $slug Sign slug.
 * @return string
 */
function akishaber_zodiac_text( $slug ) {
	$texts = apply_filters(
		'akishaber_zodiac_texts',
		array(
			'koc'     => 'Cesaretin ve kararlılığın ön planda. Yeni bir işe başlamak için enerjin yüksek, ancak acele kararlardan kaçın.',
			'boga'    => 'Maddi konularda dengeli adımlar atmanın tam zamanı. Sabrın bugün en güçlü kozun olacak.',
			'ikizler' => 'İletişim gücün yüksek. Fikirlerini paylaşmak yeni fırsatların kapısını aralayabilir.',
			'yengec'  => 'Aile ve ev konuları öne çıkıyor. Sevdiklerinle geçireceğin zaman moralini yükseltecek.',
			'aslan'   => 'Yaratıcılığın parlıyor. Sahne senin; ancak çevrendekilere de alan açmayı unutma.',
			'basak'   => 'Detaylara gösterdiğin özen bugün fark yaratacak. Planlı ilerlemek işini kolaylaştırır.',
			'terazi'  => 'İlişkilerde denge arayışındasın. Uzlaşmacı tavrın uzun süredir beklediğin çözümü getirebilir.',
			'akrep'   => 'Sezgilerin çok güçlü. Önemli bir konuda perde arkasını görme şansın var.',
			'yay'     => 'Keşif isteğin artıyor. Kısa bir yolculuk ya da yeni bir öğrenme alanı seni canlandıracak.',
			'oglak'   => 'Disiplinin meyvelerini toplamaya başlıyorsun. Kariyer adımların için verimli bir gün.',
			'kova'    => 'Sıra dışı fikirlerin ilgi görecek. Ekip çalışmaları beklenmedik bir başarı getirebilir.',
			'balik'   => 'Duygusal derinliğin artıyor. Sanat ve doğayla kuracağın bağ seni rahatlatacak.',
		)
	);

	return isset( $texts[ $slug ] ) ? $texts[ $slug ] : reset( $texts );
}

/**
 * Turkish cities used by weather and prayer components.
 *
 * @return string[]
 */
function akishaber_cities() {
	return apply_filters(
		'akishaber_cities',
		array(
			'Adana', 'Ankara', 'Antalya', 'Aydın', 'Balıkesir', 'Bursa', 'Çanakkale', 'Denizli',
			'Diyarbakır', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Hatay', 'Isparta', 'İstanbul',
			'İzmir', 'Kayseri', 'Kocaeli', 'Konya', 'Malatya', 'Manisa', 'Mersin', 'Muğla',
			'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Sivas', 'Şanlıurfa', 'Tekirdağ', 'Trabzon', 'Van',
		)
	);
}

/**
 * Deterministic demo forecast for a city.
 *
 * Replace with a live API through the `akishaber_weather_data` filter.
 *
 * @param string $city City name.
 * @return array
 */
function akishaber_weather_data( $city = '' ) {
	$city = $city ? $city : get_theme_mod( 'akishaber_default_city', 'İstanbul' );
	$seed = 0;
	foreach ( str_split( $city ) as $index => $char ) {
		$seed += ord( $char ) * ( $index + 3 );
	}
	$seed += (int) date_i18n( 'z' );

	$states = array(
		array( 'label' => __( 'Güneşli', 'akishaber' ), 'icon' => 'sun' ),
		array( 'label' => __( 'Parçalı Bulutlu', 'akishaber' ), 'icon' => 'sun' ),
		array( 'label' => __( 'Yağmurlu', 'akishaber' ), 'icon' => 'saglik' ),
		array( 'label' => __( 'Rüzgârlı', 'akishaber' ), 'icon' => 'flash' ),
	);

	$state = $states[ $seed % count( $states ) ];
	$temp  = 12 + ( $seed % 20 );
	$days  = array();
	for ( $i = 1; $i <= 4; $i++ ) {
		$days[] = array(
			'label' => date_i18n( 'D', strtotime( "+{$i} day", current_time( 'timestamp' ) ) ),
			'high'  => $temp + ( ( $seed + $i * 5 ) % 5 ) - 1,
			'low'   => $temp - 6 + ( ( $seed + $i * 3 ) % 4 ),
			'icon'  => $states[ ( $seed + $i ) % count( $states ) ]['icon'],
		);
	}

	return apply_filters(
		'akishaber_weather_data',
		array(
			'city'     => $city,
			'temp'     => $temp,
			'state'    => $state['label'],
			'icon'     => $state['icon'],
			'humidity' => 40 + ( $seed % 45 ),
			'wind'     => 5 + ( $seed % 25 ),
			'days'     => $days,
		),
		$city
	);
}

/**
 * Demo prayer times for a city.
 *
 * @param string $city City name.
 * @return array<string,string>
 */
function akishaber_prayer_times( $city = '' ) {
	$city  = $city ? $city : get_theme_mod( 'akishaber_default_city', 'İstanbul' );
	$shift = ( ord( substr( $city, 0, 1 ) ) % 7 ) - 3;
	$base  = array(
		__( 'İmsak', 'akishaber' )  => '04:12',
		__( 'Güneş', 'akishaber' )  => '05:48',
		__( 'Öğle', 'akishaber' )   => '13:12',
		__( 'İkindi', 'akishaber' ) => '16:58',
		__( 'Akşam', 'akishaber' )  => '20:24',
		__( 'Yatsı', 'akishaber' )  => '21:52',
	);

	$times = array();
	foreach ( $base as $label => $time ) {
		list( $hour, $minute ) = array_map( 'intval', explode( ':', $time ) );
		$total                 = ( ( $hour * 60 + $minute + $shift ) + 1440 ) % 1440;
		$times[ $label ]       = sprintf( '%02d:%02d', floor( $total / 60 ), $total % 60 );
	}

	return apply_filters( 'akishaber_prayer_times', $times, $city );
}
