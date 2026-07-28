<?php
/**
 * Search Form Component (searchform.php)
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<form role="search" method="get" class="search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label for="search-field-input" class="screen-reader-text"><?php esc_html_e( 'Sitede ara:', 'balabanviral' ); ?></label>
	<div style="display: flex; gap: 0.5rem; width: 100%;">
		<input type="search" id="search-field-input" class="search-field" placeholder="<?php echo esc_attr_x( 'Haber, kelime veya konu ara...', 'placeholder', 'balabanviral' ); ?>" value="<?php echo get_search_query(); ?>" name="s" required style="flex:1;" />
		<button type="submit" class="search-submit" style="background: linear-gradient(90deg, var(--hot), var(--orange)); border: none; color: white; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer;">
			<?php esc_html_e( 'Ara', 'balabanviral' ); ?>
		</button>
	</div>
</form>
