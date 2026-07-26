<?php
/**
 * Search form.
 *
 * @package AkisHaber
 */
?>
<form role="search" method="get" class="search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label class="sr-only" for="akis-search-field"><?php esc_html_e( 'Ara', 'akishaber' ); ?></label>
	<input type="search" id="akis-search-field" class="search-field" placeholder="<?php esc_attr_e( 'Ara…', 'akishaber' ); ?>" value="<?php echo esc_attr( get_search_query() ); ?>" name="s" />
	<input type="submit" class="search-submit" value="<?php esc_attr_e( 'Ara', 'akishaber' ); ?>" />
</form>
