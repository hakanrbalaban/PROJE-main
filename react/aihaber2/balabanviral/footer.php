<?php
/**
 * Footer — legal links + brand.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

	</div><!-- #content -->

	<footer id="colophon" class="mt-16 border-t border-[var(--line)]">
		<div class="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-6">
			<div>
				<p class="font-[family-name:var(--font-display)] text-3xl font-extrabold text-white">
					<?php bloginfo( 'name' ); ?>
				</p>
				<p class="mt-3 max-w-md text-sm leading-relaxed" style="color:#94a3b8">
					<?php bloginfo( 'description' ); ?>. Özgün yazılar, yazar kutusu, emoji tepkiler — editöryel magazin.
				</p>
			</div>

			<div>
				<p class="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--hot)]">
					<?php esc_html_e( 'Menü', 'balabanviral' ); ?>
				</p>
				<ul class="space-y-2 text-sm" style="color:#e2e8f0">
					<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Ana sayfa', 'balabanviral' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/#kategoriler' ) ); ?>"><?php esc_html_e( 'Kategoriler', 'balabanviral' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/#yazilar' ) ); ?>"><?php esc_html_e( 'Son yazılar', 'balabanviral' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/#foto-galeri' ) ); ?>"><?php esc_html_e( 'Foto galeri', 'balabanviral' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/#video-galeri' ) ); ?>"><?php esc_html_e( 'Video galeri', 'balabanviral' ); ?></a></li>
				</ul>
			</div>

			<div>
				<p class="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cyan)]">
					<?php esc_html_e( 'Kurumsal', 'balabanviral' ); ?>
				</p>
				<ul class="space-y-2 text-sm" style="color:#e2e8f0">
					<li><a href="<?php echo esc_url( home_url( '/hakkimizda/' ) ); ?>"><?php esc_html_e( 'Hakkımızda', 'balabanviral' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/iletisim/' ) ); ?>"><?php esc_html_e( 'İletişim', 'balabanviral' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/dmca/' ) ); ?>"><?php esc_html_e( 'DMCA', 'balabanviral' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/gizlilik/' ) ); ?>"><?php esc_html_e( 'Gizlilik', 'balabanviral' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/kvkk/' ) ); ?>"><?php esc_html_e( 'KVKK', 'balabanviral' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/telif/' ) ); ?>"><?php esc_html_e( 'Telif', 'balabanviral' ); ?></a></li>
				</ul>
			</div>
		</div>

		<div class="border-t border-white/10 py-4 text-center text-xs" style="color:#94a3b8">
			<?php
			echo wp_kses_post(
				get_theme_mod(
					'my_theme_copyright_text',
					sprintf(
						/* translators: 1: year, 2: site name */
						__( '© %1$s %2$s · Editöryel magazin', 'balabanviral' ),
						gmdate( 'Y' ),
						get_bloginfo( 'name' )
					)
				)
			);
			?>
		</div>
	</footer>
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>
