<?php
/**
 * Magazine category blocks — editors / spotlight / feature / pulse / fresh / ranked.
 *
 * Args:
 * - mode: 'all' (default) | 'next' — render remaining or next N visual rows
 * - rows: int — when mode=next, how many rows (1 row = half-pair or one full)
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$args = wp_parse_args(
	isset( $args ) && is_array( $args ) ? $args : array(),
	array(
		'mode' => 'all',
		'rows' => 1,
	)
);

$skip_slugs = array( 'foto-galeri', 'video-galeri', 'uncategorized', 'genel' );

/**
 * Prefer 2-col pairs mixed with occasional full-width layouts.
 */
$plans = array(
	array( 'width' => 'half', 'layout' => 'feature', 'need' => 8 ),
	array( 'width' => 'half', 'layout' => 'ranked', 'need' => 8 ),
	array( 'width' => 'full', 'layout' => 'editors', 'need' => 10 ),
	array( 'width' => 'half', 'layout' => 'pulse', 'need' => 8 ),
	array( 'width' => 'half', 'layout' => 'fresh', 'need' => 8 ),
	array( 'width' => 'full', 'layout' => 'spotlight', 'need' => 12 ),
	array( 'width' => 'half', 'layout' => 'ranked', 'need' => 8 ),
	array( 'width' => 'half', 'layout' => 'feature', 'need' => 8 ),
	array( 'width' => 'full', 'layout' => 'pulse', 'need' => 10 ),
	array( 'width' => 'half', 'layout' => 'fresh', 'need' => 8 ),
	array( 'width' => 'half', 'layout' => 'editors', 'need' => 8 ),
	array( 'width' => 'full', 'layout' => 'spotlight', 'need' => 10 ),
);

static $bv_mag_blocks = null;
static $bv_mag_cursor = 0;

$bv_cover = static function ( $post_id ) {
	if ( function_exists( 'my_theme_get_cover_url' ) ) {
		return my_theme_get_cover_url( $post_id );
	}
	$thumb = get_the_post_thumbnail_url( $post_id, 'large' );
	return $thumb ? $thumb : my_theme_get_fallback_image( $post_id );
};

$bv_meta_line = static function ( $post_id ) {
	$author = get_the_author_meta( 'display_name', (int) get_post_field( 'post_author', $post_id ) );
	$date   = get_the_date( 'j M Y', $post_id );
	$views  = function_exists( 'my_theme_get_post_views' ) ? my_theme_get_post_views( $post_id ) : 0;
	$mins   = function_exists( 'my_theme_estimate_reading_time' ) ? my_theme_estimate_reading_time( $post_id ) : 5;
	return array(
		'author' => $author,
		'date'   => $date,
		'views'  => $views,
		'mins'   => $mins,
	);
};

if ( null === $bv_mag_blocks ) {
	$bv_mag_blocks = array();
	$categories    = get_categories(
		array(
			'hide_empty' => true,
			'number'     => 24,
			'orderby'    => 'count',
			'order'      => 'DESC',
		)
	);
	$shown = 0;
	foreach ( $categories as $cat ) {
		if ( in_array( $cat->slug, $skip_slugs, true ) ) {
			continue;
		}
		if ( $shown >= count( $plans ) ) {
			break;
		}
		$plan = $plans[ $shown ];
		$q    = new WP_Query(
			array(
				'posts_per_page'         => (int) $plan['need'],
				'cat'                    => (int) $cat->term_id,
				'orderby'                => 'date',
				'order'                  => 'DESC',
				'no_found_rows'          => true,
				'ignore_sticky_posts'    => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
			)
		);
		if ( empty( $q->posts ) ) {
			continue;
		}
		$bv_mag_blocks[] = array(
			'cat'    => $cat,
			'items'  => array_values( $q->posts ),
			'meta'   => my_theme_category_meta( $cat->name ),
			'layout' => $plan['layout'],
			'width'  => $plan['width'],
			'arch'   => get_category_link( $cat->term_id ),
		);
		$shown++;
	}
	$bv_mag_cursor = 0;
}

$blocks = $bv_mag_blocks;
if ( empty( $blocks ) || $bv_mag_cursor >= count( $blocks ) ) {
	return;
}

$style_labels = array(
	'editors'   => __( 'Editör seçkisi', 'balabanviral' ),
	'spotlight' => __( 'Sahne', 'balabanviral' ),
	'feature'   => __( 'Öne çıkan', 'balabanviral' ),
	'pulse'     => __( 'Nabız', 'balabanviral' ),
	'fresh'     => __( 'Taze', 'balabanviral' ),
	'ranked'    => __( 'Sıralı', 'balabanviral' ),
);

/**
 * Render one category block.
 *
 * @param array    $block Block data.
 * @param callable $bv_cover Cover helper.
 * @param callable $bv_meta_line Meta helper.
 * @param array    $style_labels Labels.
 */
$render_block = static function ( $block, $bv_cover, $bv_meta_line, $style_labels ) {
	$cat    = $block['cat'];
	$items  = $block['items'];
	$meta   = $block['meta'];
	$layout = $block['layout'];
	$arch   = $block['arch'];
	$label  = isset( $style_labels[ $layout ] ) ? $style_labels[ $layout ] : $layout;
	$bid    = 'kat-' . sanitize_title( $cat->slug );
	?>
	<section
		id="<?php echo esc_attr( $bid ); ?>"
		class="mag-block mag-block--<?php echo esc_attr( $layout ); ?> mag-block--<?php echo esc_attr( $block['width'] ); ?>"
		style="--cat-accent: <?php echo esc_attr( $meta['accent'] ); ?>"
	>
		<header class="mag-block__head">
			<div class="mag-block__brand">
				<div>
					<p class="mag-block__kicker"><?php echo esc_html( $meta['emoji'] . ' ' . $label ); ?></p>
					<h2 class="mag-block__title">
						<a href="<?php echo esc_url( $arch ); ?>"><?php echo esc_html( $cat->name ); ?></a>
					</h2>
					<span class="mag-block__accent" aria-hidden="true"></span>
					<p class="mag-block__sub">
						<?php
						printf(
							/* translators: %d: post count */
							esc_html__( '%d içerik', 'balabanviral' ),
							(int) $cat->count
						);
						?>
					</p>
				</div>
			</div>
			<div class="mag-block__actions">
				<a href="<?php echo esc_url( $arch ); ?>" class="mag-block__more">
					<?php esc_html_e( 'Tümü', 'balabanviral' ); ?> →
				</a>
				<?php if ( 'full' === $block['width'] ) : ?>
					<button type="button" class="rail-scroll-btn" data-rail-scroll="-1" data-rail-target="<?php echo esc_attr( $bid ); ?>" aria-label="<?php esc_attr_e( 'Sola kaydır', 'balabanviral' ); ?>">←</button>
					<button type="button" class="rail-scroll-btn" data-rail-scroll="1" data-rail-target="<?php echo esc_attr( $bid ); ?>" aria-label="<?php esc_attr_e( 'Sağa kaydır', 'balabanviral' ); ?>">→</button>
				<?php endif; ?>
			</div>
		</header>

		<?php if ( 'editors' === $layout ) : ?>
			<?php
			$featured = $items[0];
			$rest     = array_slice( $items, 1, 4 );
			$fid      = (int) $featured->ID;
			$fm       = $bv_meta_line( $fid );
			?>
			<div class="mag-grid mag-grid--editors">
				<article class="mag-ed-hero">
					<a href="<?php echo esc_url( get_permalink( $fid ) ); ?>" class="mag-ed-hero__media">
						<img src="<?php echo esc_url( $bv_cover( $fid ) ); ?>" alt="" loading="lazy" />
						<?php my_theme_react_bar( $fid ); ?>
					</a>
					<div class="mag-ed-hero__panel">
						<span class="mag-tag"><?php echo esc_html( $cat->name ); ?></span>
						<span class="mag-wm" aria-hidden="true">01</span>
						<h3><a href="<?php echo esc_url( get_permalink( $fid ) ); ?>"><?php echo esc_html( get_the_title( $fid ) ); ?></a></h3>
						<p><?php echo esc_html( wp_trim_words( get_the_excerpt( $fid ), 22 ) ); ?></p>
						<div class="mag-meta">
							<span><?php echo esc_html( $fm['author'] ); ?></span>
							<span>⏱ <?php echo esc_html( (string) $fm['mins'] ); ?> <?php esc_html_e( 'dk', 'balabanviral' ); ?></span>
							<span>👁 <?php echo esc_html( (string) $fm['views'] ); ?></span>
						</div>
					</div>
				</article>
				<ol class="mag-ed-list">
					<?php foreach ( $rest as $idx => $p ) : ?>
						<?php $pid = (int) $p->ID; ?>
						<li>
							<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
								<span class="mag-wm mag-wm--sm" aria-hidden="true"><?php echo esc_html( str_pad( (string) ( $idx + 2 ), 2, '0', STR_PAD_LEFT ) ); ?></span>
								<span class="mag-ed-list__txt">
									<strong><?php echo esc_html( get_the_title( $pid ) ); ?></strong>
									<small><?php echo esc_html( get_the_date( 'j M', $pid ) ); ?> · 👁 <?php echo esc_html( (string) my_theme_get_post_views( $pid ) ); ?></small>
								</span>
								<img src="<?php echo esc_url( $bv_cover( $pid ) ); ?>" alt="" loading="lazy" />
							</a>
						</li>
					<?php endforeach; ?>
				</ol>
			</div>

		<?php elseif ( 'spotlight' === $layout ) : ?>
			<?php
			$hot     = $items[0];
			$side    = array_slice( $items, 1, 3 );
			$center  = isset( $items[4] ) ? $items[4] : $items[0];
			$feature = isset( $items[5] ) ? $items[5] : ( isset( $items[1] ) ? $items[1] : $items[0] );
			$grid    = array_slice( $items, 0, 4 );
			$hid     = (int) $hot->ID;
			$cid     = (int) $center->ID;
			$fid2    = (int) $feature->ID;
			?>
			<div class="mag-grid mag-grid--spotlight">
				<div class="mag-spot-hot">
					<span class="mag-pill"><?php esc_html_e( 'Gündem', 'balabanviral' ); ?></span>
					<a class="mag-spot-hot__lead" href="<?php echo esc_url( get_permalink( $hid ) ); ?>">
						<span class="mag-wm mag-wm--sm" aria-hidden="true">01</span>
						<strong><?php echo esc_html( get_the_title( $hid ) ); ?></strong>
					</a>
					<ol class="mag-spot-hot__list">
						<?php foreach ( $side as $idx => $p ) : ?>
							<?php $pid = (int) $p->ID; ?>
							<li>
								<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
									<em><?php echo esc_html( str_pad( (string) ( $idx + 2 ), 2, '0', STR_PAD_LEFT ) ); ?></em>
									<span><?php echo esc_html( get_the_title( $pid ) ); ?></span>
								</a>
							</li>
						<?php endforeach; ?>
					</ol>
				</div>
				<article class="mag-spot-hero">
					<a href="<?php echo esc_url( get_permalink( $cid ) ); ?>">
						<img src="<?php echo esc_url( $bv_cover( $cid ) ); ?>" alt="" loading="lazy" />
						<?php my_theme_react_bar( $cid ); ?>
						<div class="mag-spot-hero__veil"></div>
						<span class="mag-tag mag-tag--overlay"><?php echo esc_html( $cat->name ); ?></span>
					</a>
				</article>
				<article class="mag-spot-feat">
					<span class="mag-tag"><?php echo esc_html( $cat->name ); ?></span>
					<h3><a href="<?php echo esc_url( get_permalink( $fid2 ) ); ?>"><?php echo esc_html( get_the_title( $fid2 ) ); ?></a></h3>
					<p><?php echo esc_html( wp_trim_words( get_the_excerpt( $fid2 ), 18 ) ); ?></p>
					<div class="mag-meta">
						<span><?php echo esc_html( get_the_author_meta( 'display_name', (int) get_post_field( 'post_author', $fid2 ) ) ); ?></span>
						<span>⏱ <?php echo esc_html( (string) my_theme_estimate_reading_time( $fid2 ) ); ?> <?php esc_html_e( 'dk', 'balabanviral' ); ?></span>
					</div>
				</article>
				<div class="mag-spot-circles">
					<?php foreach ( $grid as $p ) : ?>
						<?php $pid = (int) $p->ID; ?>
						<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>" class="mag-circle-row">
							<img src="<?php echo esc_url( $bv_cover( $pid ) ); ?>" alt="" loading="lazy" />
							<span><?php echo esc_html( get_the_title( $pid ) ); ?></span>
						</a>
					<?php endforeach; ?>
				</div>
			</div>

		<?php elseif ( 'feature' === $layout ) : ?>
			<?php
			$featured = $items[0];
			$rest     = array_slice( $items, 1, 2 );
			$fid      = (int) $featured->ID;
			$fm       = $bv_meta_line( $fid );
			?>
			<div class="mag-grid mag-grid--feature">
				<article class="mag-feat-card">
					<a href="<?php echo esc_url( get_permalink( $fid ) ); ?>" class="mag-feat-card__media">
						<img src="<?php echo esc_url( $bv_cover( $fid ) ); ?>" alt="" loading="lazy" />
						<?php my_theme_react_bar( $fid ); ?>
						<span class="mag-bolt" aria-hidden="true">⚡</span>
						<span class="mag-tag mag-tag--corner"><?php echo esc_html( $cat->name ); ?></span>
					</a>
					<div class="mag-meta mag-meta--row">
						<span><?php echo esc_html( $fm['author'] ); ?></span>
						<span><?php echo esc_html( $fm['date'] ); ?></span>
						<span>👁 <?php echo esc_html( (string) $fm['views'] ); ?></span>
					</div>
					<h3><a href="<?php echo esc_url( get_permalink( $fid ) ); ?>"><?php echo esc_html( get_the_title( $fid ) ); ?></a></h3>
					<p><?php echo esc_html( wp_trim_words( get_the_excerpt( $fid ), 16 ) ); ?></p>
					<a class="mag-cta" href="<?php echo esc_url( get_permalink( $fid ) ); ?>"><?php esc_html_e( 'Devamını oku', 'balabanviral' ); ?> »</a>
				</article>
				<?php if ( ! empty( $rest ) ) : ?>
					<div class="mag-feat-minis">
						<?php foreach ( $rest as $p ) : ?>
							<?php $pid = (int) $p->ID; ?>
							<a class="mag-mini-row" href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
								<img src="<?php echo esc_url( $bv_cover( $pid ) ); ?>" alt="" loading="lazy" />
								<span>
									<small><?php echo esc_html( get_the_date( 'j M Y', $pid ) ); ?></small>
									<strong><?php echo esc_html( get_the_title( $pid ) ); ?></strong>
								</span>
							</a>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
			</div>

		<?php elseif ( 'pulse' === $layout ) : ?>
			<?php
			$featured = $items[0];
			$rest     = array_slice( $items, 1, 5 );
			$fid      = (int) $featured->ID;
			$fm       = $bv_meta_line( $fid );
			?>
			<div class="mag-grid mag-grid--pulse">
				<article class="mag-pulse-hero">
					<a href="<?php echo esc_url( get_permalink( $fid ) ); ?>">
						<img src="<?php echo esc_url( $bv_cover( $fid ) ); ?>" alt="" loading="lazy" />
						<?php my_theme_react_bar( $fid ); ?>
						<div class="mag-pulse-hero__veil"></div>
						<div class="mag-pulse-hero__txt">
							<span class="mag-tag mag-tag--overlay"><?php echo esc_html( $cat->name ); ?></span>
							<h3><?php echo esc_html( get_the_title( $fid ) ); ?></h3>
							<div class="mag-meta mag-meta--light">
								<span><?php echo esc_html( $fm['author'] ); ?></span>
								<span><?php echo esc_html( $fm['date'] ); ?></span>
								<span>👁 <?php echo esc_html( (string) $fm['views'] ); ?></span>
							</div>
						</div>
					</a>
				</article>
				<div class="mag-pulse-list">
					<?php foreach ( $rest as $p ) : ?>
						<?php $pid = (int) $p->ID; ?>
						<article class="mag-pulse-item">
							<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
								<img src="<?php echo esc_url( $bv_cover( $pid ) ); ?>" alt="" loading="lazy" />
								<div>
									<small><?php echo esc_html( get_the_date( 'j M Y', $pid ) ); ?></small>
									<strong><?php echo esc_html( get_the_title( $pid ) ); ?></strong>
								</div>
							</a>
						</article>
					<?php endforeach; ?>
				</div>
			</div>

		<?php elseif ( 'fresh' === $layout ) : ?>
			<?php
			$list  = array_slice( $items, 0, 3 );
			$cards = array_slice( $items, 3, 2 );
			if ( count( $cards ) < 2 && count( $items ) >= 2 ) {
				$cards = array_slice( $items, -2 );
			}
			?>
			<div class="mag-grid mag-grid--fresh">
				<aside class="mag-fresh-rail">
					<p class="mag-fresh-rail__hint"><?php esc_html_e( 'Bugün: editörün seçtikleri', 'balabanviral' ); ?></p>
					<ul>
						<?php foreach ( $list as $p ) : ?>
							<?php $pid = (int) $p->ID; ?>
							<li>
								<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
									<span class="mag-tag mag-tag--text"><?php echo esc_html( $cat->name ); ?></span>
									<strong><?php echo esc_html( get_the_title( $pid ) ); ?></strong>
									<small><?php echo esc_html( get_the_date( 'j F Y', $pid ) ); ?></small>
								</a>
							</li>
						<?php endforeach; ?>
					</ul>
				</aside>
				<div class="mag-fresh-cards">
					<?php foreach ( $cards as $idx => $p ) : ?>
						<?php
						$pid = (int) $p->ID;
						$cls = 0 === $idx ? 'mag-fresh-card mag-fresh-card--hero' : 'mag-fresh-card';
						?>
						<article class="<?php echo esc_attr( $cls ); ?>">
							<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
								<img src="<?php echo esc_url( $bv_cover( $pid ) ); ?>" alt="" loading="lazy" />
								<?php if ( 0 === $idx ) : ?>
									<?php my_theme_react_bar( $pid ); ?>
								<?php endif; ?>
								<div class="mag-fresh-card__txt">
									<span class="mag-tag mag-tag--overlay"><?php echo esc_html( $cat->name ); ?></span>
									<h3><?php echo esc_html( get_the_title( $pid ) ); ?></h3>
									<?php if ( 0 === $idx ) : ?>
										<p><?php echo esc_html( wp_trim_words( get_the_excerpt( $pid ), 16 ) ); ?></p>
									<?php endif; ?>
								</div>
							</a>
						</article>
					<?php endforeach; ?>
				</div>
			</div>

		<?php else : /* ranked */ ?>
			<?php
			$fid  = (int) $items[0]->ID;
			$rest = array_slice( $items, 1, 4 );
			$fm   = $bv_meta_line( $fid );
			?>
			<div class="mag-grid mag-grid--ranked">
				<article class="mag-ranked-hero">
					<a href="<?php echo esc_url( get_permalink( $fid ) ); ?>">
						<img src="<?php echo esc_url( $bv_cover( $fid ) ); ?>" alt="" loading="lazy" />
						<?php my_theme_react_bar( $fid ); ?>
						<div class="mag-ranked-hero__body">
							<span class="mag-wm" aria-hidden="true">01</span>
							<span class="mag-tag"><?php echo esc_html( $cat->name ); ?></span>
							<h3><?php echo esc_html( get_the_title( $fid ) ); ?></h3>
							<p><?php echo esc_html( wp_trim_words( get_the_excerpt( $fid ), 14 ) ); ?></p>
							<div class="mag-meta">
								<span><?php echo esc_html( $fm['author'] ); ?></span>
								<span>⏱ <?php echo esc_html( (string) $fm['mins'] ); ?> <?php esc_html_e( 'dk', 'balabanviral' ); ?></span>
							</div>
						</div>
					</a>
				</article>
				<ol class="mag-ranked-list">
					<?php foreach ( $rest as $idx => $p ) : ?>
						<?php $pid = (int) $p->ID; ?>
						<li>
							<a href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
								<span class="mag-wm mag-wm--sm" aria-hidden="true"><?php echo esc_html( str_pad( (string) ( $idx + 2 ), 2, '0', STR_PAD_LEFT ) ); ?></span>
								<span>
									<strong><?php echo esc_html( get_the_title( $pid ) ); ?></strong>
									<small><?php echo esc_html( get_the_date( 'j M', $pid ) ); ?></small>
								</span>
								<img src="<?php echo esc_url( $bv_cover( $pid ) ); ?>" alt="" loading="lazy" />
							</a>
						</li>
					<?php endforeach; ?>
				</ol>
			</div>
		<?php endif; ?>

		<?php if ( 'full' === $block['width'] ) : ?>
			<div class="rail-track mag-block__rail hide-scrollbar">
				<?php foreach ( array_slice( $items, 0, 8 ) as $p ) : ?>
					<?php $pid = (int) $p->ID; ?>
					<a class="mag-block__rail-card" href="<?php echo esc_url( get_permalink( $pid ) ); ?>">
						<img src="<?php echo esc_url( $bv_cover( $pid ) ); ?>" alt="" loading="lazy" />
						<strong><?php echo esc_html( get_the_title( $pid ) ); ?></strong>
						<small><?php echo esc_html( get_the_date( 'j M Y', $pid ) ); ?> · 👁 <?php echo esc_html( (string) my_theme_get_post_views( $pid ) ); ?></small>
					</a>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>
	<?php
};

$max_rows = ( 'next' === $args['mode'] ) ? max( 1, (int) $args['rows'] ) : PHP_INT_MAX;
$rows_out = 0;
$total    = count( $blocks );
$i        = $bv_mag_cursor;

if ( $i >= $total ) {
	return;
}
?>

<div class="mag-blocks mx-auto max-w-[1280px] px-4 py-2 md:px-6">
	<?php
	while ( $i < $total && $rows_out < $max_rows ) :
		$cur = $blocks[ $i ];

		if ( 'half' === $cur['width'] && isset( $blocks[ $i + 1 ] ) && 'half' === $blocks[ $i + 1 ]['width'] ) :
			?>
			<div class="mag-blocks-row">
				<?php
				$render_block( $blocks[ $i ], $bv_cover, $bv_meta_line, $style_labels );
				$render_block( $blocks[ $i + 1 ], $bv_cover, $bv_meta_line, $style_labels );
				?>
			</div>
			<?php
			$i      += 2;
			$rows_out++;
		else :
			?>
			<div class="mag-blocks-solo">
				<?php $render_block( $cur, $bv_cover, $bv_meta_line, $style_labels ); ?>
			</div>
			<?php
			$i++;
			$rows_out++;
		endif;
	endwhile;

	$bv_mag_cursor = $i;
	?>
</div>
