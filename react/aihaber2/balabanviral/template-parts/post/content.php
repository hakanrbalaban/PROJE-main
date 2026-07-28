<?php
/**
 * Template part for displaying posts (magazine card).
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$views    = my_theme_get_post_views( get_the_ID() );
$likes    = (int) get_post_meta( get_the_ID(), 'my_theme_post_likes_count', true );
if ( ! $likes ) {
	$likes = get_comments_number( get_the_ID() ) * 5 + 12;
}
$pid      = get_the_ID();
$is_viral = ( function_exists( 'my_theme_post_has_feature' ) && my_theme_post_has_feature( $pid, 'viral' ) )
	|| $views > 100
	|| $likes > 20;
$is_trend = function_exists( 'my_theme_post_has_feature' ) && my_theme_post_has_feature( $pid, 'trending' );
$is_edit  = function_exists( 'my_theme_post_has_feature' ) && my_theme_post_has_feature( $pid, 'editor' );
$is_nsfw  = function_exists( 'my_theme_post_has_feature' ) && my_theme_post_has_feature( $pid, 'nsfw' );
$is_photo = function_exists( 'my_theme_post_has_feature' ) && my_theme_post_has_feature( $pid, 'photo' );
$is_video = function_exists( 'my_theme_post_has_feature' ) && my_theme_post_has_feature( $pid, 'video' );
$cover    = my_theme_get_cover_url( $pid );
$cats     = get_the_category();
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'bv-card animate-rise group' ); ?>>
	<a href="<?php the_permalink(); ?>" class="bv-card__link">
		<div class="bv-card__media">
			<img
				src="<?php echo esc_url( $cover ); ?>"
				alt="<?php the_title_attribute(); ?>"
				class="bv-card__img"
				loading="lazy"
			/>
			<?php my_theme_react_bar( $pid ); ?>
			<?php if ( ! empty( $cats ) ) : ?>
				<span class="bv-card__cat"><?php echo esc_html( $cats[0]->name ); ?></span>
			<?php endif; ?>
			<?php if ( $is_viral ) : ?>
				<span class="viral-badge bv-card__viral">💯 Viral</span>
			<?php elseif ( $is_trend ) : ?>
				<span class="viral-badge bv-card__viral">🔥 Trend</span>
			<?php elseif ( $is_edit ) : ?>
				<span class="viral-badge bv-card__viral" style="background:#0891b2">✍️ Editör</span>
			<?php elseif ( $is_video ) : ?>
				<span class="viral-badge bv-card__viral">▶️ Video</span>
			<?php elseif ( $is_photo ) : ?>
				<span class="viral-badge bv-card__viral" style="background:#0d9488">📷 Foto</span>
			<?php elseif ( $is_nsfw ) : ?>
				<span class="viral-badge bv-card__viral" style="background:#b45309">⚠️ Hassas</span>
			<?php endif; ?>
			<div class="bv-card__stats">
				<span>👁 <?php echo esc_html( (string) $views ); ?></span>
				<span>❤️ <?php echo esc_html( (string) $likes ); ?></span>
			</div>
		</div>
		<div class="bv-card__body">
			<h3 class="bv-card__title"><?php echo esc_html( wp_trim_words( get_the_title(), 12, '…' ) ); ?></h3>
			<p class="bv-card__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 16, '…' ) ); ?></p>
			<div class="bv-card__meta">
				<span><?php echo esc_html( get_the_date( 'j M' ) ); ?> · ⏱️ <?php echo esc_html( (string) my_theme_estimate_reading_time( get_the_ID() ) ); ?> dk</span>
				<span class="bv-card__cta"><?php esc_html_e( 'Oku →', 'balabanviral' ); ?></span>
			</div>
		</div>
	</a>
</article>
