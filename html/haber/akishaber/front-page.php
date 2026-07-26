<?php
/**
 * Front page template — with sidebar.
 *
 * @package AkisHaber
 */

get_header();
?>

<?php get_template_part( 'template-parts/home/breaking' ); ?>
<?php get_template_part( 'template-parts/home/markets' ); ?>
<?php get_template_part( 'template-parts/home/hero' ); ?>
<?php get_template_part( 'template-parts/home/flash' ); ?>

<div class="container home-layout">
	<main id="primary" class="site-main home-main">
		<?php
		get_template_part(
			'template-parts/home/rail',
			null,
			array(
				'slug'     => 'son-dakika',
				'title'    => __( 'Son Dakika Akışı', 'akishaber' ),
				'subtitle' => __( 'Kaydırarak tüm gelişmeleri görün', 'akishaber' ),
				'icon'     => 'flash',
				'id'       => 'son-dakika-akisi',
				'count'    => 10,
			)
		);

		get_template_part(
			'template-parts/home/section-featured',
			null,
			array(
				'slug'  => 'politika',
				'title' => __( 'Politika', 'akishaber' ),
				'id'    => 'politika',
			)
		);

		get_template_part(
			'template-parts/home/section-grid',
			null,
			array(
				'slug'      => 'ekonomi',
				'title'     => __( 'Ekonomi', 'akishaber' ),
				'id'        => 'ekonomi',
				'with_list' => true,
			)
		);

		get_template_part( 'template-parts/home/authors' );
		get_template_part( 'template-parts/home/sport' );

		get_template_part(
			'template-parts/home/section-video',
			null,
			array(
				'slug'  => 'video',
				'title' => __( 'Video Galeri', 'akishaber' ),
				'id'    => 'video',
			)
		);

		get_template_part(
			'template-parts/home/rail',
			null,
			array(
				'slug'  => 'dunya',
				'title' => __( 'Dünya Gündemi', 'akishaber' ),
				'icon'  => 'dunya',
				'id'    => 'dunya-rayi',
				'count' => 10,
			)
		);

		get_template_part( 'template-parts/home/gundem' );

		get_template_part(
			'template-parts/home/section-health',
			null,
			array(
				'slug'  => 'saglik',
				'title' => __( 'Sağlık', 'akishaber' ),
				'id'    => 'saglik',
			)
		);

		get_template_part( 'template-parts/home/magazin' );

		get_template_part(
			'template-parts/home/section-grid',
			null,
			array(
				'slug'  => 'teknoloji',
				'title' => __( 'Teknoloji', 'akishaber' ),
				'id'    => 'teknoloji',
				'count' => 3,
			)
		);

		get_template_part( 'template-parts/home/photos' );
		get_template_part( 'template-parts/home/popular' );
		get_template_part( 'template-parts/home/highlights' );
		get_template_part( 'template-parts/home/services' );
		get_template_part( 'template-parts/home/ilanlar' );
		?>
	</main>

	<?php get_sidebar( 'home' ); ?>
</div>

<?php get_template_part( 'template-parts/home/newsletter' ); ?>

<?php
get_footer();
