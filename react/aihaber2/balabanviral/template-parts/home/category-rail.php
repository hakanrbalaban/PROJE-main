<?php
/**
 * Slideable category icon strip (magazine topics).
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$categories = get_categories(
	array(
		'hide_empty' => true,
		'number'     => 24,
		'orderby'    => 'count',
		'order'      => 'DESC',
	)
);

if ( empty( $categories ) ) {
	$categories = get_categories(
		array(
			'hide_empty' => false,
			'number'     => 16,
		)
	);
}

if ( empty( $categories ) ) {
	return;
}
?>

<section id="kategoriler" class="mag-cat-strip mx-auto max-w-[1280px] scroll-mt-40 px-4 pt-10 md:px-6" data-rail>
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 class="mag-section-title">
				🎯 <?php esc_html_e( 'Kategoriler', 'balabanviral' ); ?>
			</h2>
			<p class="mag-section-sub"><?php esc_html_e( 'Kaydır · ikona tıkla · tümünü oku', 'balabanviral' ); ?></p>
		</div>
		<div class="flex items-center gap-2">
			<a href="<?php echo esc_url( home_url( '/#yazilar' ) ); ?>" class="magazine-more-link"><?php esc_html_e( 'Tüm yazılar', 'balabanviral' ); ?> →</a>
			<button type="button" class="rail-scroll-btn" data-rail-scroll="-1" data-rail-target="kategoriler" aria-label="<?php esc_attr_e( 'Sola kaydır', 'balabanviral' ); ?>">←</button>
			<button type="button" class="rail-scroll-btn" data-rail-scroll="1" data-rail-target="kategoriler" aria-label="<?php esc_attr_e( 'Sağa kaydır', 'balabanviral' ); ?>">→</button>
		</div>
	</div>
	<div class="rail-track hide-scrollbar flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
		<?php foreach ( $categories as $i => $cat ) : ?>
			<?php
			$meta  = my_theme_category_meta( $cat->name );
			$count = (int) $cat->count;
			$shape = $i % 3; // visual variety among tiles
			?>
			<a
				href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"
				class="mag-cat-tile snap-start <?php echo esc_attr( 'mag-cat-tile--s' . $shape ); ?>"
				style="--tile-accent: <?php echo esc_attr( $meta['accent'] ); ?>"
			>
				<span class="mag-cat-tile__emoji" aria-hidden="true"><?php echo esc_html( $meta['emoji'] ); ?></span>
				<span class="mag-cat-tile__name"><?php echo esc_html( $cat->name ); ?></span>
				<span class="mag-cat-tile__bar"></span>
				<span class="mag-cat-tile__count">
					<?php
					printf(
						/* translators: %d: post count */
						esc_html( _n( '%d yazı', '%d yazı', $count, 'balabanviral' ) ),
						$count
					);
					?>
				</span>
				<span class="mag-cat-tile__cta"><?php esc_html_e( 'Tümünü oku →', 'balabanviral' ); ?></span>
			</a>
		<?php endforeach; ?>
	</div>
</section>
