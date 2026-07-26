<?php
/**
 * Public news archive filters.
 *
 * @package AkisHaber
 */

$current_category = isset( $_GET['haber_kategori'] ) ? absint( wp_unslash( $_GET['haber_kategori'] ) ) : 0;
$current_sort     = akishaber_archive_sort();
$current_period   = akishaber_archive_period();
?>
<form class="news-filters" method="get" action="<?php echo esc_url( get_pagenum_link( 1 ) ); ?>">
	<div class="news-filters__group">
		<label for="filter-category"><?php esc_html_e( 'Kategori', 'akishaber' ); ?></label>
		<select id="filter-category" name="haber_kategori">
			<option value="0"><?php esc_html_e( 'Tüm kategoriler', 'akishaber' ); ?></option>
			<?php foreach ( akishaber_filter_categories() as $filter_category ) : ?>
				<option value="<?php echo esc_attr( (string) $filter_category->term_id ); ?>" <?php selected( $current_category, $filter_category->term_id ); ?>>
					<?php echo esc_html( $filter_category->name ); ?>
				</option>
			<?php endforeach; ?>
		</select>
	</div>
	<div class="news-filters__group">
		<label for="filter-period"><?php esc_html_e( 'Dönem', 'akishaber' ); ?></label>
		<select id="filter-period" name="donem">
			<option value="all" <?php selected( $current_period, 'all' ); ?>><?php esc_html_e( 'Tüm zamanlar', 'akishaber' ); ?></option>
			<option value="today" <?php selected( $current_period, 'today' ); ?>><?php esc_html_e( 'Bugün', 'akishaber' ); ?></option>
			<option value="week" <?php selected( $current_period, 'week' ); ?>><?php esc_html_e( 'Bu hafta', 'akishaber' ); ?></option>
			<option value="month" <?php selected( $current_period, 'month' ); ?>><?php esc_html_e( 'Bu ay', 'akishaber' ); ?></option>
		</select>
	</div>
	<div class="news-filters__group">
		<label for="filter-sort"><?php esc_html_e( 'Sıralama', 'akishaber' ); ?></label>
		<select id="filter-sort" name="sirala">
			<option value="newest" <?php selected( $current_sort, 'newest' ); ?>><?php esc_html_e( 'En yeni', 'akishaber' ); ?></option>
			<option value="oldest" <?php selected( $current_sort, 'oldest' ); ?>><?php esc_html_e( 'En eski', 'akishaber' ); ?></option>
			<option value="popular" <?php selected( $current_sort, 'popular' ); ?>><?php esc_html_e( 'En popüler', 'akishaber' ); ?></option>
			<option value="commented" <?php selected( $current_sort, 'commented' ); ?>><?php esc_html_e( 'En çok yorumlanan', 'akishaber' ); ?></option>
		</select>
	</div>
	<?php if ( is_search() ) : ?>
		<input type="hidden" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" />
	<?php endif; ?>
	<button type="submit"><?php esc_html_e( 'Filtrele', 'akishaber' ); ?></button>
	<a class="news-filters__clear" href="<?php echo esc_url( remove_query_arg( array( 'haber_kategori', 'donem', 'sirala', 'paged' ) ) ); ?>">
		<?php esc_html_e( 'Temizle', 'akishaber' ); ?>
	</a>
</form>
