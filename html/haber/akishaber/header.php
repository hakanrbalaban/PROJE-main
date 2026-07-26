<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>

<div class="topbar">
	<div class="container topbar__inner">
		<div class="topbar__left">
			<time class="topbar__date" id="todayDate"><?php echo esc_html( date_i18n( 'l, j F Y' ) ); ?></time>
			<span class="topbar__sep"></span>
			<button type="button" class="weather-chip" id="weatherBtn" aria-expanded="false" aria-controls="weatherPanel">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
				<strong id="weatherTemp">21°</strong>
				<span id="weatherCity"><?php echo esc_html( akishaber_mod( 'akishaber_default_city', 'Bursa' ) ); ?></span>
				<svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
			</button>
			<div class="weather-panel" id="weatherPanel" hidden>
				<label class="sr-only" for="citySelect"><?php esc_html_e( 'Şehir seçin', 'akishaber' ); ?></label>
				<select id="citySelect"></select>
			</div>
		</div>
		<div class="topbar__right">
			<?php
			if ( has_nav_menu( 'topbar' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'topbar',
						'container'      => false,
						'menu_class'     => 'topbar-menu',
						'depth'          => 1,
						'fallback_cb'    => false,
					)
				);
			} else {
				?>
				<a href="<?php echo esc_url( wp_login_url() ); ?>"><?php esc_html_e( 'Üye Girişi', 'akishaber' ); ?></a>
				<a href="<?php echo esc_url( home_url( '/#servisler' ) ); ?>"><?php esc_html_e( 'Servisler', 'akishaber' ); ?></a>
				<?php
			}
			?>
			<a class="wa-link" href="<?php echo esc_url( akishaber_mod( 'akishaber_whatsapp', 'https://wa.me/' ) ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'WhatsApp İhbar', 'akishaber' ); ?></a>
			<div class="topbar__tools">
				<button type="button" class="icon-btn" id="fontDec" title="<?php esc_attr_e( 'Yazı küçült', 'akishaber' ); ?>" aria-label="<?php esc_attr_e( 'Yazı küçült', 'akishaber' ); ?>">A−</button>
				<button type="button" class="icon-btn" id="fontInc" title="<?php esc_attr_e( 'Yazı büyüt', 'akishaber' ); ?>" aria-label="<?php esc_attr_e( 'Yazı büyüt', 'akishaber' ); ?>">A+</button>
				<button type="button" class="icon-btn" id="themeToggle" title="<?php esc_attr_e( 'Tema', 'akishaber' ); ?>" aria-label="<?php esc_attr_e( 'Karanlık/aydınlık tema', 'akishaber' ); ?>">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
				</button>
				<button type="button" class="icon-btn" id="searchOpen" title="<?php esc_attr_e( 'Ara', 'akishaber' ); ?>" aria-label="<?php esc_attr_e( 'Ara', 'akishaber' ); ?>">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
				</button>
			</div>
		</div>
	</div>
</div>

<header class="site-header">
	<div class="container header__row">
		<button type="button" class="nav-toggle" id="navToggle" aria-label="<?php esc_attr_e( 'Menüyü aç', 'akishaber' ); ?>" aria-expanded="false">
			<span></span><span></span><span></span>
		</button>

		<?php get_template_part( 'template-parts/header/site-branding' ); ?>

		<nav class="main-nav" id="mainNav" aria-label="<?php esc_attr_e( 'Ana menü', 'akishaber' ); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => '',
					'fallback_cb'    => 'akishaber_primary_fallback',
					'walker'         => new AkisHaber_Walker_Nav(),
					'depth'          => 2,
					'items_wrap'     => '<ul>%3$s</ul>',
				)
			);
			?>
		</nav>

		<div class="header__quick">
			<?php
			if ( has_nav_menu( 'quick' ) ) {
				wp_nav_menu(
					array(
						'theme_location' => 'quick',
						'container'      => false,
						'depth'          => 1,
						'items_wrap'     => '%3$s',
						'fallback_cb'    => false,
					)
				);
			} else {
				?>
				<a href="<?php echo esc_url( akishaber_cat_link( 'foto-galeri' ) ); ?>"><?php esc_html_e( 'Foto', 'akishaber' ); ?></a>
				<a href="<?php echo esc_url( akishaber_cat_link( 'video' ) ); ?>"><?php esc_html_e( 'Video', 'akishaber' ); ?></a>
				<a href="<?php echo esc_url( akishaber_cat_link( 'yazarlar' ) ); ?>"><?php esc_html_e( 'Yazarlar', 'akishaber' ); ?></a>
				<?php
			}
			?>
		</div>
	</div>
</header>
