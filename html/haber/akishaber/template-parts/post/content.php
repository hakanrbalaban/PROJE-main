<?php
/**
 * Standard post card.
 *
 * @package AkisHaber
 */
?>
<article <?php post_class( 'story archive-card' ); ?>>
	<a href="<?php the_permalink(); ?>" class="story__media">
		<?php akishaber_the_thumb( 'akishaber-card' ); ?>
	</a>
	<div class="story__body">
		<?php akishaber_the_category_badge(); ?>
		<h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
		<p><?php echo esc_html( wp_trim_words( get_the_excerpt(), 22 ) ); ?></p>
		<div class="meta">
			<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
			<span>·</span>
			<span><?php echo esc_html( akishaber_reading_time() ); ?></span>
		</div>
	</div>
</article>
