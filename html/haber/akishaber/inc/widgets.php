<?php
/**
 * Theme widgets available in every widget area.
 *
 * @package AkisHaber
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared widget behaviour.
 */
abstract class AkisHaber_Widget extends WP_Widget {

	/**
	 * Default title shown in the widget form.
	 *
	 * @var string
	 */
	protected $default_title = '';

	/**
	 * Render widget body.
	 *
	 * @param array $instance Saved values.
	 */
	abstract protected function render_body( $instance );

	/**
	 * Output the widget.
	 *
	 * @param array $args     Sidebar arguments.
	 * @param array $instance Saved values.
	 */
	public function widget( $args, $instance ) {
		$title = isset( $instance['title'] ) ? $instance['title'] : $this->default_title;
		$title = apply_filters( 'widget_title', $title, $instance, $this->id_base );

		echo $args['before_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		if ( $title ) {
			echo $args['before_title'] . esc_html( $title ) . $args['after_title']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
		$this->render_body( $instance );
		echo $args['after_widget']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Print a text field.
	 *
	 * @param array  $instance Saved values.
	 * @param string $key      Field key.
	 * @param string $label    Field label.
	 * @param string $default  Default value.
	 */
	protected function text_field( $instance, $key, $label, $default = '' ) {
		$value = isset( $instance[ $key ] ) ? $instance[ $key ] : $default;
		printf(
			'<p><label for="%1$s">%2$s</label><input class="widefat" id="%1$s" name="%3$s" type="text" value="%4$s" /></p>',
			esc_attr( $this->get_field_id( $key ) ),
			esc_html( $label ),
			esc_attr( $this->get_field_name( $key ) ),
			esc_attr( $value )
		);
	}

	/**
	 * Print a number field.
	 *
	 * @param array  $instance Saved values.
	 * @param string $key      Field key.
	 * @param string $label    Field label.
	 * @param int    $default  Default value.
	 */
	protected function number_field( $instance, $key, $label, $default = 5 ) {
		$value = isset( $instance[ $key ] ) ? absint( $instance[ $key ] ) : $default;
		printf(
			'<p><label for="%1$s">%2$s</label><input class="tiny-text" id="%1$s" name="%3$s" type="number" min="1" max="20" value="%4$d" /></p>',
			esc_attr( $this->get_field_id( $key ) ),
			esc_html( $label ),
			esc_attr( $this->get_field_name( $key ) ),
			$value
		);
	}

	/**
	 * Print a select field.
	 *
	 * @param array  $instance Saved values.
	 * @param string $key      Field key.
	 * @param string $label    Field label.
	 * @param array  $choices  Options.
	 * @param string $default  Default value.
	 */
	protected function select_field( $instance, $key, $label, $choices, $default = '' ) {
		$value = isset( $instance[ $key ] ) ? $instance[ $key ] : $default;
		printf(
			'<p><label for="%1$s">%2$s</label><select class="widefat" id="%1$s" name="%3$s">',
			esc_attr( $this->get_field_id( $key ) ),
			esc_html( $label ),
			esc_attr( $this->get_field_name( $key ) )
		);
		foreach ( $choices as $choice_value => $choice_label ) {
			printf(
				'<option value="%s" %s>%s</option>',
				esc_attr( $choice_value ),
				selected( $value, $choice_value, false ),
				esc_html( $choice_label )
			);
		}
		echo '</select></p>';
	}

	/**
	 * Print a checkbox field.
	 *
	 * @param array  $instance Saved values.
	 * @param string $key      Field key.
	 * @param string $label    Field label.
	 * @param bool   $default  Default value.
	 */
	protected function checkbox_field( $instance, $key, $label, $default = true ) {
		$value = isset( $instance[ $key ] ) ? (bool) $instance[ $key ] : $default;
		printf(
			'<p><input type="checkbox" id="%1$s" name="%2$s" value="1" %3$s /> <label for="%1$s">%4$s</label></p>',
			esc_attr( $this->get_field_id( $key ) ),
			esc_attr( $this->get_field_name( $key ) ),
			checked( $value, true, false ),
			esc_html( $label )
		);
	}

	/**
	 * Sanitize submitted values.
	 *
	 * @param array $new_instance New values.
	 * @param array $old_instance Old values.
	 * @return array
	 */
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		foreach ( $new_instance as $key => $value ) {
			if ( 'code' === $key ) {
				$instance[ $key ] = wp_kses_post( $value );
			} elseif ( is_numeric( $value ) ) {
				$instance[ $key ] = absint( $value );
			} else {
				$instance[ $key ] = sanitize_text_field( $value );
			}
		}

		return $instance;
	}
}

/**
 * Post list widget.
 */
class AkisHaber_Widget_Posts extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Son Haberler', 'akishaber' );
		parent::__construct(
			'akishaber_posts',
			__( 'Akış: Haber Listesi', 'akishaber' ),
			array( 'description' => __( 'Son, popüler veya rastgele haberleri görsel ile listeler.', 'akishaber' ) )
		);
	}

	/**
	 * Render list.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		get_template_part(
			'template-parts/sidebar/posts',
			null,
			array(
				'type'     => isset( $instance['type'] ) ? $instance['type'] : 'latest',
				'count'    => isset( $instance['count'] ) ? absint( $instance['count'] ) : 5,
				'thumbs'   => ! empty( $instance['thumbs'] ),
				'numbered' => ! empty( $instance['numbered'] ),
				'category' => isset( $instance['category'] ) ? $instance['category'] : '',
			)
		);
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$categories = array( '' => __( 'Tüm kategoriler', 'akishaber' ) );
		foreach ( get_categories( array( 'hide_empty' => false ) ) as $category ) {
			$categories[ $category->slug ] = $category->name;
		}

		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), $this->default_title );
		$this->select_field(
			$instance,
			'type',
			__( 'Sıralama:', 'akishaber' ),
			array(
				'latest'    => __( 'En yeni', 'akishaber' ),
				'popular'   => __( 'Popüler', 'akishaber' ),
				'commented' => __( 'En çok yorumlanan', 'akishaber' ),
				'random'    => __( 'Rastgele', 'akishaber' ),
			),
			'latest'
		);
		$this->select_field( $instance, 'category', __( 'Kategori:', 'akishaber' ), $categories, '' );
		$this->number_field( $instance, 'count', __( 'Haber sayısı:', 'akishaber' ), 5 );
		$this->checkbox_field( $instance, 'thumbs', __( 'Görselleri göster', 'akishaber' ), true );
		$this->checkbox_field( $instance, 'numbered', __( 'Numaralı liste', 'akishaber' ), false );
	}
}

/**
 * Tabbed posts widget.
 */
class AkisHaber_Widget_Tabs extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Haber Akışı', 'akishaber' );
		parent::__construct(
			'akishaber_tabs',
			__( 'Akış: Sekmeli Haberler', 'akishaber' ),
			array( 'description' => __( 'Son / Popüler / Yorumlanan sekmeleri.', 'akishaber' ) )
		);
	}

	/**
	 * Render tabs.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		get_template_part(
			'template-parts/sidebar/posts-tabs',
			null,
			array( 'count' => isset( $instance['count'] ) ? absint( $instance['count'] ) : 5 )
		);
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), $this->default_title );
		$this->number_field( $instance, 'count', __( 'Sekme başına haber:', 'akishaber' ), 5 );
	}
}

/**
 * Weather widget.
 */
class AkisHaber_Widget_Weather extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Hava Durumu', 'akishaber' );
		parent::__construct(
			'akishaber_weather',
			__( 'Akış: Hava Durumu', 'akishaber' ),
			array( 'description' => __( 'Şehir seçmeli hava durumu ve 4 günlük tahmin.', 'akishaber' ) )
		);
	}

	/**
	 * Render weather.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		get_template_part(
			'template-parts/sidebar/weather',
			null,
			array( 'city' => isset( $instance['city'] ) ? $instance['city'] : '' )
		);
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$cities = array();
		foreach ( akishaber_cities() as $city ) {
			$cities[ $city ] = $city;
		}

		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), $this->default_title );
		$this->select_field( $instance, 'city', __( 'Varsayılan şehir:', 'akishaber' ), $cities, 'İstanbul' );
	}
}

/**
 * Horoscope widget.
 */
class AkisHaber_Widget_Horoscope extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Günlük Burç', 'akishaber' );
		parent::__construct(
			'akishaber_horoscope',
			__( 'Akış: Günlük Burç', 'akishaber' ),
			array( 'description' => __( '12 burç için günlük yorum.', 'akishaber' ) )
		);
	}

	/**
	 * Render horoscope.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		get_template_part( 'template-parts/sidebar/horoscope' );
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), $this->default_title );
	}
}

/**
 * Quote of the day widget.
 */
class AkisHaber_Widget_Quote extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Günün Sözü', 'akishaber' );
		parent::__construct(
			'akishaber_quote',
			__( 'Akış: Günün Sözü', 'akishaber' ),
			array( 'description' => __( 'Her gün değişen özlü söz.', 'akishaber' ) )
		);
	}

	/**
	 * Render quote.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		get_template_part( 'template-parts/sidebar/quote' );
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), $this->default_title );
		echo '<p class="description">' . esc_html__( 'İçeriği Özelleştirici → Akış Haber Ayarları bölümünden değiştirebilirsiniz.', 'akishaber' ) . '</p>';
	}
}

/**
 * Verse of the day widget.
 */
class AkisHaber_Widget_Verse extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Günün Ayeti', 'akishaber' );
		parent::__construct(
			'akishaber_verse',
			__( 'Akış: Günün Ayeti', 'akishaber' ),
			array( 'description' => __( 'Her gün değişen ayet meali.', 'akishaber' ) )
		);
	}

	/**
	 * Render verse.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		get_template_part( 'template-parts/sidebar/verse' );
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), $this->default_title );
		echo '<p class="description">' . esc_html__( 'İçeriği Özelleştirici → Akış Haber Ayarları bölümünden değiştirebilirsiniz.', 'akishaber' ) . '</p>';
	}
}

/**
 * Markets widget.
 */
class AkisHaber_Widget_Markets extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Piyasalar', 'akishaber' );
		parent::__construct(
			'akishaber_markets',
			__( 'Akış: Piyasalar', 'akishaber' ),
			array( 'description' => __( 'Döviz, altın ve borsa özeti.', 'akishaber' ) )
		);
	}

	/**
	 * Render markets.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		get_template_part( 'template-parts/sidebar/markets' );
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), $this->default_title );
	}
}

/**
 * Prayer times widget.
 */
class AkisHaber_Widget_Prayer extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Namaz Vakitleri', 'akishaber' );
		parent::__construct(
			'akishaber_prayer',
			__( 'Akış: Namaz Vakitleri', 'akishaber' ),
			array( 'description' => __( 'Seçili şehir için günlük vakitler.', 'akishaber' ) )
		);
	}

	/**
	 * Render prayer times.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		get_template_part(
			'template-parts/sidebar/prayer',
			null,
			array( 'city' => isset( $instance['city'] ) ? $instance['city'] : '' )
		);
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$cities = array();
		foreach ( akishaber_cities() as $city ) {
			$cities[ $city ] = $city;
		}

		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), $this->default_title );
		$this->select_field( $instance, 'city', __( 'Şehir:', 'akishaber' ), $cities, 'İstanbul' );
	}
}

/**
 * Mini gallery widget.
 */
class AkisHaber_Widget_Gallery extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Foto Galeri', 'akishaber' );
		parent::__construct(
			'akishaber_gallery',
			__( 'Akış: Foto Galeri', 'akishaber' ),
			array( 'description' => __( 'Büyütülebilir küçük görsel ızgarası.', 'akishaber' ) )
		);
	}

	/**
	 * Render gallery.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		get_template_part(
			'template-parts/sidebar/gallery',
			null,
			array( 'count' => isset( $instance['count'] ) ? absint( $instance['count'] ) : 6 )
		);
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), $this->default_title );
		$this->number_field( $instance, 'count', __( 'Görsel sayısı:', 'akishaber' ), 6 );
	}
}

/**
 * Social follow widget.
 */
class AkisHaber_Widget_Social extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Bizi Takip Edin', 'akishaber' );
		parent::__construct(
			'akishaber_social',
			__( 'Akış: Sosyal Medya', 'akishaber' ),
			array( 'description' => __( 'Özelleştirici’de tanımlı sosyal hesaplar.', 'akishaber' ) )
		);
	}

	/**
	 * Render social links.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		get_template_part( 'template-parts/sidebar/social' );
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), $this->default_title );
	}
}

/**
 * Advertisement widget.
 */
class AkisHaber_Widget_Ad extends AkisHaber_Widget {

	/**
	 * Register widget.
	 */
	public function __construct() {
		$this->default_title = __( 'Reklam', 'akishaber' );
		parent::__construct(
			'akishaber_ad',
			__( 'Akış: Reklam Alanı', 'akishaber' ),
			array( 'description' => __( 'Reklam kodu veya yer tutucu.', 'akishaber' ) )
		);
	}

	/**
	 * Render advertisement.
	 *
	 * @param array $instance Saved values.
	 */
	protected function render_body( $instance ) {
		$code = isset( $instance['code'] ) ? $instance['code'] : '';
		if ( $code ) {
			echo '<div class="w-ad">' . wp_kses_post( $code ) . '</div>';

			return;
		}
		?>
		<div class="w-ad w-ad--placeholder">
			<span><?php esc_html_e( 'Reklam Alanı', 'akishaber' ); ?></span>
			<b>300 × 250</b>
		</div>
		<?php
	}

	/**
	 * Widget form.
	 *
	 * @param array $instance Saved values.
	 */
	public function form( $instance ) {
		$this->text_field( $instance, 'title', __( 'Başlık:', 'akishaber' ), '' );
		$code = isset( $instance['code'] ) ? $instance['code'] : '';
		printf(
			'<p><label for="%1$s">%2$s</label><textarea class="widefat" rows="4" id="%1$s" name="%3$s">%4$s</textarea></p>',
			esc_attr( $this->get_field_id( 'code' ) ),
			esc_html__( 'Reklam kodu:', 'akishaber' ),
			esc_attr( $this->get_field_name( 'code' ) ),
			esc_textarea( $code )
		);
	}
}

/**
 * Register all theme widgets.
 */
function akishaber_register_widgets() {
	$widgets = array(
		'AkisHaber_Widget_Posts',
		'AkisHaber_Widget_Tabs',
		'AkisHaber_Widget_Weather',
		'AkisHaber_Widget_Horoscope',
		'AkisHaber_Widget_Quote',
		'AkisHaber_Widget_Verse',
		'AkisHaber_Widget_Markets',
		'AkisHaber_Widget_Prayer',
		'AkisHaber_Widget_Gallery',
		'AkisHaber_Widget_Social',
		'AkisHaber_Widget_Ad',
	);

	foreach ( $widgets as $widget ) {
		register_widget( $widget );
	}
}
add_action( 'widgets_init', 'akishaber_register_widgets' );
