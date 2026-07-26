<footer class="site-footer">
	<div class="container footer__grid">
		<div class="footer__brand">
			<?php akishaber_the_brand( 'brand--light' ); ?>
			<p><?php echo esc_html( get_bloginfo( 'description', 'display' ) ); ?></p>
			<div class="socials">
				<a href="<?php echo esc_url( akishaber_mod( 'akishaber_whatsapp', 'https://wa.me/' ) ); ?>" aria-label="WhatsApp">Wa</a>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Ana Sayfa">Web</a>
			</div>
			<?php if ( is_active_sidebar( 'footer-extra' ) ) : ?>
				<?php dynamic_sidebar( 'footer-extra' ); ?>
			<?php endif; ?>
		</div>

		<div>
			<h3><?php esc_html_e( 'Kategoriler', 'akishaber' ); ?></h3>
			<?php
			if ( has_nav_menu( 'footer-1' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'footer-1',
						'container'      => false,
						'depth'          => 1,
						'fallback_cb'    => false,
					)
				);
			} else {
				akishaber_primary_fallback();
			}
			?>
		</div>

		<div>
			<h3><?php esc_html_e( 'Servisler', 'akishaber' ); ?></h3>
			<?php
			if ( has_nav_menu( 'footer-2' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'footer-2',
						'container'      => false,
						'depth'          => 1,
						'fallback_cb'    => false,
					)
				);
			} else {
				echo '<ul>';
				printf( '<li><a href="%s">%s</a></li>', esc_url( home_url( '/#eczane' ) ), esc_html__( 'Nöbetçi Eczaneler', 'akishaber' ) );
				printf( '<li><a href="%s">%s</a></li>', esc_url( home_url( '/#namaz' ) ), esc_html__( 'Namaz Vakitleri', 'akishaber' ) );
				printf( '<li><a href="%s">%s</a></li>', esc_url( home_url( '/#puan' ) ), esc_html__( 'Puan Durumu', 'akishaber' ) );
				echo '</ul>';
			}
			?>
		</div>

		<div>
			<h3><?php esc_html_e( 'Hakkımızda', 'akishaber' ); ?></h3>
			<?php
			if ( has_nav_menu( 'footer-3' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'footer-3',
						'container'      => false,
						'depth'          => 1,
						'fallback_cb'    => false,
					)
				);
			} else {
				echo '<ul>';
				printf( '<li><a href="%s">%s</a></li>', esc_url( home_url( '/' ) ), esc_html__( 'Ana Sayfa', 'akishaber' ) );
				printf( '<li><a href="%s">%s</a></li>', esc_url( akishaber_cat_link( 'yazarlar' ) ), esc_html__( 'Yazarlar', 'akishaber' ) );
				if ( get_option( 'page_for_posts' ) ) {
					printf( '<li><a href="%s">%s</a></li>', esc_url( get_permalink( get_option( 'page_for_posts' ) ) ), esc_html__( 'Blog', 'akishaber' ) );
				}
				echo '</ul>';
			}
			?>
		</div>
	</div>
	<?php get_template_part( 'template-parts/footer/site-info' ); ?>
</footer>

<nav class="mobile-dock" aria-label="<?php esc_attr_e( 'Hızlı erişim', 'akishaber' ); ?>">
	<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="<?php echo is_front_page() ? 'is-active' : ''; ?>"><span><?php esc_html_e( 'Ana', 'akishaber' ); ?></span></a>
	<a href="<?php echo esc_url( akishaber_cat_link( 'video' ) ); ?>"><span><?php esc_html_e( 'Video', 'akishaber' ); ?></span></a>
	<button type="button" id="dockSearch"><span><?php esc_html_e( 'Ara', 'akishaber' ); ?></span></button>
	<a href="<?php echo esc_url( akishaber_cat_link( 'yazarlar' ) ); ?>"><span><?php esc_html_e( 'Yazar', 'akishaber' ); ?></span></a>
	<a href="<?php echo esc_url( home_url( '/#servisler' ) ); ?>"><span><?php esc_html_e( 'Servis', 'akishaber' ); ?></span></a>
</nav>

<div class="search-modal" id="searchModal" hidden>
	<div class="search-modal__panel" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Site içi arama', 'akishaber' ); ?>">
		<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" id="searchForm">
			<label class="sr-only" for="searchInput"><?php esc_html_e( 'Ara', 'akishaber' ); ?></label>
			<input type="search" id="searchInput" name="s" placeholder="<?php esc_attr_e( 'Haber, yazar veya kategori ara…', 'akishaber' ); ?>" value="<?php echo esc_attr( get_search_query() ); ?>" autocomplete="off" />
			<button type="submit"><?php esc_html_e( 'Ara', 'akishaber' ); ?></button>
		</form>
		<button type="button" class="search-modal__close" id="searchClose" aria-label="<?php esc_attr_e( 'Kapat', 'akishaber' ); ?>">×</button>
		<p class="search-hint"><?php esc_html_e( 'Örnek: enflasyon, spor, burç, namaz', 'akishaber' ); ?></p>
	</div>
</div>

<div class="lightbox" id="akisLightbox" hidden>
	<div class="lightbox__inner" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Foto galeri', 'akishaber' ); ?>">
		<header class="lightbox__bar">
			<span class="lightbox__title" data-lightbox-title></span>
			<span class="lightbox__counter" data-lightbox-counter></span>
			<button type="button" class="lightbox__close" data-lightbox-close aria-label="<?php esc_attr_e( 'Kapat', 'akishaber' ); ?>">
				<?php akishaber_icon( 'close', 22 ); ?>
			</button>
		</header>
		<div class="lightbox__stage">
			<button type="button" class="lightbox__arrow lightbox__arrow--prev" data-lightbox-prev aria-label="<?php esc_attr_e( 'Önceki fotoğraf', 'akishaber' ); ?>">
				<?php akishaber_icon( 'left', 26 ); ?>
			</button>
			<figure class="lightbox__figure">
				<img src="" alt="" data-lightbox-image />
				<figcaption data-lightbox-caption></figcaption>
			</figure>
			<button type="button" class="lightbox__arrow lightbox__arrow--next" data-lightbox-next aria-label="<?php esc_attr_e( 'Sonraki fotoğraf', 'akishaber' ); ?>">
				<?php akishaber_icon( 'right', 26 ); ?>
			</button>
		</div>
		<footer class="lightbox__foot">
			<div class="lightbox__thumbs" data-lightbox-thumbs></div>
			<a class="lightbox__link" href="#" data-lightbox-link><?php esc_html_e( 'Haberin tamamını oku', 'akishaber' ); ?></a>
		</footer>
	</div>
</div>

<button type="button" class="back-top" id="backTop" aria-label="<?php esc_attr_e( 'Yukarı çık', 'akishaber' ); ?>">↑</button>

<?php wp_footer(); ?>
</body>
</html>
