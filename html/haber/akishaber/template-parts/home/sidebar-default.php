<?php
/**
 * Default sidebar content shown when no widgets are configured.
 *
 * @package AkisHaber
 */

$cards = array(
	array(
		'title' => __( 'Hava Durumu', 'akishaber' ),
		'icon'  => 'sun',
		'part'  => 'template-parts/sidebar/weather',
		'args'  => array(),
	),
	array(
		'title' => __( 'Son Dakika', 'akishaber' ),
		'icon'  => 'flash',
		'part'  => 'template-parts/sidebar/posts',
		'args'  => array(
			'type'     => 'latest',
			'count'    => 5,
			'category' => 'son-dakika',
			'thumbs'   => false,
			'numbered' => true,
		),
	),
	array(
		'title' => __( 'Haber Akışı', 'akishaber' ),
		'icon'  => 'fire',
		'part'  => 'template-parts/sidebar/posts-tabs',
		'args'  => array( 'count' => 5 ),
	),
	array(
		'title' => __( 'Günün Sözü', 'akishaber' ),
		'icon'  => 'quote',
		'part'  => 'template-parts/sidebar/quote',
		'args'  => array(),
	),
	array(
		'title' => __( 'Günün Ayeti', 'akishaber' ),
		'icon'  => 'book',
		'part'  => 'template-parts/sidebar/verse',
		'args'  => array(),
	),
	array(
		'title' => __( 'Günlük Burç', 'akishaber' ),
		'icon'  => 'star',
		'part'  => 'template-parts/sidebar/horoscope',
		'args'  => array(),
	),
	array(
		'title' => __( 'Piyasalar', 'akishaber' ),
		'icon'  => 'chart',
		'part'  => 'template-parts/sidebar/markets',
		'args'  => array(),
	),
	array(
		'title' => __( 'Foto Galeri', 'akishaber' ),
		'icon'  => 'foto',
		'part'  => 'template-parts/sidebar/gallery',
		'args'  => array( 'count' => 6 ),
	),
	array(
		'title' => __( 'Namaz Vakitleri', 'akishaber' ),
		'icon'  => 'mosque',
		'part'  => 'template-parts/sidebar/prayer',
		'args'  => array(),
	),
);

foreach ( $cards as $card ) :
	?>
	<section class="widget sidebar-card">
		<h2 class="widget-title">
			<span class="widget-title__icon"><?php akishaber_icon( $card['icon'], 18 ); ?></span>
			<?php echo esc_html( $card['title'] ); ?>
		</h2>
		<?php get_template_part( $card['part'], null, $card['args'] ); ?>
	</section>
	<?php
endforeach;
?>

<section class="widget sidebar-card">
	<h2 class="widget-title">
		<span class="widget-title__icon"><?php akishaber_icon( 'tag', 18 ); ?></span>
		<?php esc_html_e( 'Kategoriler', 'akishaber' ); ?>
	</h2>
	<ul class="sidebar-cats">
		<?php foreach ( get_categories( array( 'number' => 10, 'hide_empty' => false ) ) as $category ) : ?>
			<li>
				<a href="<?php echo esc_url( get_category_link( $category ) ); ?>">
					<span class="sidebar-cats__icon"><?php akishaber_icon( akishaber_icon_for_slug( $category->slug ), 16 ); ?></span>
					<span><?php echo esc_html( $category->name ); ?></span>
					<em><?php echo esc_html( (string) $category->count ); ?></em>
				</a>
			</li>
		<?php endforeach; ?>
	</ul>
</section>

<section class="widget sidebar-card sidebar-card--ad">
	<p class="ad-label"><?php esc_html_e( 'Reklam Alanı', 'akishaber' ); ?></p>
	<div class="ad-box">300 × 250</div>
</section>
