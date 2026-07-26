<?php
/**
 * Tabbed post list (latest / popular / commented).
 *
 * @package AkisHaber
 * @var array $args
 */

$count = isset( $args['count'] ) ? absint( $args['count'] ) : 5;
$tabs  = array(
	'latest'    => array( 'label' => __( 'Son', 'akishaber' ), 'icon' => 'clock' ),
	'popular'   => array( 'label' => __( 'Popüler', 'akishaber' ), 'icon' => 'fire' ),
	'commented' => array( 'label' => __( 'Yorumlanan', 'akishaber' ), 'icon' => 'share' ),
);
$first = true;
?>
<div class="w-tabs" data-tabs>
	<div class="w-tabs__nav" role="tablist">
		<?php foreach ( $tabs as $key => $tab ) : ?>
			<button type="button" role="tab" class="w-tabs__btn<?php echo $first ? ' is-active' : ''; ?>" data-tab-target="<?php echo esc_attr( $key ); ?>" aria-selected="<?php echo $first ? 'true' : 'false'; ?>">
				<?php akishaber_icon( $tab['icon'], 14 ); ?>
				<span><?php echo esc_html( $tab['label'] ); ?></span>
			</button>
			<?php $first = false; ?>
		<?php endforeach; ?>
	</div>

	<?php
	$first = true;
	foreach ( $tabs as $key => $tab ) :
		?>
		<div class="w-tabs__panel<?php echo $first ? ' is-active' : ''; ?>" data-tab-panel="<?php echo esc_attr( $key ); ?>" role="tabpanel">
			<?php
			get_template_part(
				'template-parts/sidebar/posts',
				null,
				array(
					'type'   => $key,
					'count'  => $count,
					'thumbs' => true,
				)
			);
			?>
		</div>
		<?php
		$first = false;
	endforeach;
	?>
</div>
