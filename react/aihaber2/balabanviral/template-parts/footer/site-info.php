<?php
/**
 * Template part for displaying footer copyright and social links
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$copyright = get_theme_mod( 'my_theme_copyright_text', sprintf( __( '© %s Tüm Hakları Saklıdır.', 'balabanviral' ), date( 'Y' ) ) );
$socials   = array(
	'twitter'   => get_theme_mod( 'my_theme_social_twitter' ),
	'instagram' => get_theme_mod( 'my_theme_social_instagram' ),
	'youtube'   => get_theme_mod( 'my_theme_social_youtube' ),
	'telegram'  => get_theme_mod( 'my_theme_social_telegram' ),
	'linkedin'  => get_theme_mod( 'my_theme_social_linkedin' ),
);
?>

<div class="site-info">
	<div class="copyright-text">
		<?php echo wp_kses_post( $copyright ); ?>
	</div>

	<?php if ( array_filter( $socials ) ) : ?>
		<div class="social-links">
			<?php foreach ( $socials as $network => $url ) : ?>
				<?php if ( ! empty( $url ) ) : ?>
					<a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( ucfirst( $network ) ); ?>">
						<span><?php echo esc_html( strtoupper( substr( $network, 0, 2 ) ) ); ?></span>
					</a>
				<?php endif; ?>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</div>
