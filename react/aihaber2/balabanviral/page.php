<?php
/**
 * Static page template — clean single column (Hakkımızda, İletişim, DMCA…).
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<main id="primary" class="site-main">
	<div class="bv-page">
		<?php
		while ( have_posts() ) :
			the_post();
			?>
			<article id="post-<?php the_ID(); ?>" <?php post_class( 'bv-page__card' ); ?>>
				<header>
					<h1 class="bv-page__title"><?php the_title(); ?></h1>
				</header>

				<?php if ( has_post_thumbnail() ) : ?>
					<div class="mb-5 overflow-hidden" style="border-radius: var(--radius)">
						<?php the_post_thumbnail( 'large', array( 'class' => 'w-full h-auto' ) ); ?>
					</div>
				<?php endif; ?>

				<div class="bv-page__content entry-content">
					<?php
					the_content();
					wp_link_pages(
						array(
							'before' => '<div class="page-links">' . esc_html__( 'Sayfalar:', 'balabanviral' ),
							'after'  => '</div>',
						)
					);
					?>
				</div>

				<nav class="bv-page-links" aria-label="<?php esc_attr_e( 'Yasal sayfalar', 'balabanviral' ); ?>">
					<a href="<?php echo esc_url( home_url( '/hakkimizda/' ) ); ?>"><?php esc_html_e( 'Hakkımızda', 'balabanviral' ); ?></a>
					<a href="<?php echo esc_url( home_url( '/iletisim/' ) ); ?>"><?php esc_html_e( 'İletişim', 'balabanviral' ); ?></a>
					<a href="<?php echo esc_url( home_url( '/dmca/' ) ); ?>"><?php esc_html_e( 'DMCA', 'balabanviral' ); ?></a>
					<a href="<?php echo esc_url( home_url( '/gizlilik/' ) ); ?>"><?php esc_html_e( 'Gizlilik', 'balabanviral' ); ?></a>
					<a href="<?php echo esc_url( home_url( '/kvkk/' ) ); ?>"><?php esc_html_e( 'KVKK', 'balabanviral' ); ?></a>
					<a href="<?php echo esc_url( home_url( '/telif/' ) ); ?>"><?php esc_html_e( 'Telif', 'balabanviral' ); ?></a>
				</nav>
			</article>
			<?php
		endwhile;
		?>
	</div>
</main>

<?php
get_footer();
