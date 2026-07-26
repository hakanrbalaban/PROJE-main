<?php
/**
 * Social follow widget body.
 *
 * @package AkisHaber
 */

$networks = array(
	'facebook'  => array( 'label' => 'Facebook', 'mod' => 'akishaber_social_facebook', 'count' => '128B' ),
	'x'         => array( 'label' => 'X', 'mod' => 'akishaber_social_x', 'count' => '96B' ),
	'instagram' => array( 'label' => 'Instagram', 'mod' => 'akishaber_social_instagram', 'count' => '212B' ),
	'youtube'   => array( 'label' => 'YouTube', 'mod' => 'akishaber_social_youtube', 'count' => '54B' ),
);
?>
<ul class="w-social">
	<?php
	foreach ( $networks as $key => $network ) :
		$url = get_theme_mod( $network['mod'], '' );
		if ( ! $url ) {
			continue;
		}
		?>
		<li class="w-social__item w-social__item--<?php echo esc_attr( $key ); ?>">
			<a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener noreferrer">
				<?php akishaber_icon( 'share', 18 ); ?>
				<span><?php echo esc_html( $network['label'] ); ?></span>
				<b><?php echo esc_html( $network['count'] ); ?></b>
			</a>
		</li>
	<?php endforeach; ?>
</ul>
<?php
$has_any = false;
foreach ( $networks as $network ) {
	if ( get_theme_mod( $network['mod'], '' ) ) {
		$has_any = true;
		break;
	}
}
if ( ! $has_any ) :
	?>
	<p class="w-social__empty">
		<?php esc_html_e( 'Sosyal medya adreslerini Özelleştirici → Akış Haber Ayarları bölümünden ekleyin.', 'akishaber' ); ?>
	</p>
<?php endif; ?>
