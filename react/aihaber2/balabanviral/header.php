<?php
/**
 * The Header template file
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?><!DOCTYPE html>
<html <?php language_attributes(); ?> data-theme="light">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<script>
		(function () {
			try {
				var t = localStorage.getItem('bv-theme');
				if (t !== 'dark' && t !== 'light') t = 'light';
				document.documentElement.setAttribute('data-theme', t);
			} catch (e) {
				document.documentElement.setAttribute('data-theme', 'light');
			}
		})();
	</script>
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site min-h-screen">
	<a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'İçeriğe Atla', 'balabanviral' ); ?></a>

	<?php get_template_part( 'template-parts/header/news-ticker' ); ?>

	<!-- Header Area matching original React Header.tsx -->
	<header id="masthead" class="z-40 border-b border-[var(--line)] backdrop-blur-xl" style="background: var(--header-bg)">
		<div class="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 px-4 py-3 md:gap-3 md:px-6">
			<!-- Logo Branding -->
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="group flex shrink-0 items-center gap-2.5">
				<?php if ( has_custom_logo() ) : ?>
					<?php the_custom_logo(); ?>
				<?php else : ?>
					<span class="site-brand-mark grid h-11 w-11 place-items-center bg-gradient-to-br from-[var(--hot)] to-[var(--orange)] shadow-lg shadow-[rgba(225,29,72,0.35)] transition group-hover:scale-105">
						<span class="font-[family-name:var(--font-display)] text-lg font-extrabold text-white">
							<?php echo esc_html( strtoupper( substr( get_bloginfo( 'name' ), 0, 1 ) ) ); ?>
						</span>
					</span>
					<span class="text-left">
						<span class="block font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight text-[var(--ink)]">
							<?php bloginfo( 'name' ); ?>
						</span>
						<span class="block text-[11px] text-[var(--muted)]">
							<?php bloginfo( 'description' ); ?>
						</span>
					</span>
				<?php endif; ?>
			</a>

			<!-- Search & Filters Container -->
			<div class="ml-auto flex min-w-0 flex-1 flex-col gap-2 sm:max-w-2xl">
				<div class="flex items-center gap-1.5 sm:gap-2">
					<!-- Search Form -->
					<form role="search" method="get" class="relative min-w-0 flex-1" action="<?php echo esc_url( home_url( '/' ) ); ?>">
						<input
							type="search"
							name="s"
							value="<?php echo esc_attr( get_search_query() ); ?>"
							placeholder="<?php esc_attr_e( 'Detaylı ara: başlık, etiket…', 'balabanviral' ); ?>"
							class="w-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--hot)]/60"
							style="border-radius: var(--radius)"
						/>
					</form>

					<!-- Quick Viral Filters Bar -->
					<div class="hide-scrollbar flex max-w-[42vw] items-center gap-1 overflow-x-auto sm:max-w-none">
						<?php
						$quick_emojis = array(
							'🔥' => __( 'Trend', 'balabanviral' ),
							'❤️' => __( 'Sevilen', 'balabanviral' ),
							'👁️' => __( 'Popüler', 'balabanviral' ),
							'😍' => __( 'Harika', 'balabanviral' ),
							'😂' => __( 'Komik', 'balabanviral' ),
							'💯' => __( 'Viral', 'balabanviral' ),
						);
						foreach ( $quick_emojis as $emoji => $label ) :
							?>
							<a
								href="<?php echo esc_url( add_query_arg( 'filter', rawurlencode( $label ), home_url( '/' ) ) ); ?>"
								title="<?php echo esc_attr( $label ); ?>"
								class="grid h-9 w-9 shrink-0 place-items-center border border-[var(--line)] bg-[var(--panel)] text-base transition hover:scale-110 hover:border-[var(--hot)]"
								style="border-radius: var(--radius)"
							>
								<?php echo esc_html( $emoji ); ?>
							</a>
						<?php endforeach; ?>
					</div>

					<!-- Filter Toggle Button -->
					<button
						type="button"
						id="filter-drawer-btn"
						class="shrink-0 border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-xs font-bold text-[var(--ink)] transition hover:border-[var(--cyan)]"
						style="border-radius: var(--radius)"
					>
						🎛️ Filtre
					</button>
				</div>
			</div>
		</div>

		<!-- Expandable Detailed Filter Drawer -->
		<div id="filter-drawer-panel" class="hidden border-t border-[var(--line)] bg-[rgba(16,10,28,0.97)]">
			<div class="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-4 md:px-6">
				<div class="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p class="text-xs font-bold uppercase tracking-wider text-[var(--hot)]">
							Detaylı arama
						</p>
						<p class="text-sm text-[var(--muted)]">
							Kategori ve etiket bazlı filtreleme
						</p>
					</div>
				</div>

				<div>
					<p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
						Kategoriler
					</p>
					<div class="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
						<?php
						$categories = get_categories( array( 'hide_empty' => false ) );
						foreach ( $categories as $cat ) :
							$meta = my_theme_category_meta( $cat->name );
							?>
							<a
								href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"
								class="flex shrink-0 flex-col items-center gap-1 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 transition hover:border-[var(--cyan)]"
							>
								<span class="text-xl leading-none"><?php echo esc_html( $meta['emoji'] ); ?></span>
								<span class="text-[10px] font-bold text-[var(--mist)]"><?php echo esc_html( $cat->name ); ?></span>
							</a>
						<?php endforeach; ?>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Emoji Nav Component (Exact React EmojiNav.tsx structure) -->
	<?php if ( is_front_page() || is_home() ) : ?>
		<nav aria-label="Hızlı emoji menü" class="bv-emoji-nav z-30 border-b border-[var(--line)] backdrop-blur-xl" style="background: var(--header-bg)">
			<div class="hide-scrollbar mx-auto flex max-w-[1280px] items-center gap-1.5 overflow-x-auto px-4 py-2 md:px-6">
				<span class="mr-1 shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
					Git
				</span>
				<a href="#one-cikan" class="flex shrink-0 items-center gap-1 border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-sm transition hover:scale-105 hover:border-[var(--hot)]" style="border-radius: var(--radius)">
					<span class="text-base leading-none">📰</span>
					<span class="hidden text-[11px] font-semibold text-[var(--ink)] sm:inline">Öne çıkan</span>
				</a>
				<a href="#kategoriler" class="flex shrink-0 items-center gap-1 border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-sm transition hover:scale-105 hover:border-[var(--hot)]" style="border-radius: var(--radius)">
					<span class="text-base leading-none">🎯</span>
					<span class="hidden text-[11px] font-semibold text-[var(--ink)] sm:inline">Kategoriler</span>
				</a>
				<a href="#trendler" class="flex shrink-0 items-center gap-1 border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-sm transition hover:scale-105 hover:border-[var(--hot)]" style="border-radius: var(--radius)">
					<span class="text-base leading-none">🔥</span>
					<span class="hidden text-[11px] font-semibold text-[var(--ink)] sm:inline">Trendler</span>
				</a>
				<a href="#cok-okunan" class="flex shrink-0 items-center gap-1 border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-sm transition hover:scale-105 hover:border-[var(--hot)]" style="border-radius: var(--radius)">
					<span class="text-base leading-none">👁</span>
					<span class="hidden text-[11px] font-semibold text-[var(--ink)] sm:inline">Çok okunan</span>
				</a>
				<a href="#yazilar" class="flex shrink-0 items-center gap-1 border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-sm transition hover:scale-105 hover:border-[var(--hot)]" style="border-radius: var(--radius)">
					<span class="text-base leading-none">📰</span>
					<span class="hidden text-[11px] font-semibold text-[var(--ink)] sm:inline">Yazılar</span>
				</a>
				<a href="#foto-galeri" class="flex shrink-0 items-center gap-1 border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-sm transition hover:scale-105 hover:border-[var(--hot)]" style="border-radius: var(--radius)">
					<span class="text-base leading-none">📷</span>
					<span class="hidden text-[11px] font-semibold text-[var(--ink)] sm:inline">Foto</span>
				</a>
				<a href="#video-galeri" class="flex shrink-0 items-center gap-1 border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-sm transition hover:scale-105 hover:border-[var(--hot)]" style="border-radius: var(--radius)">
					<span class="text-base leading-none">▶️</span>
					<span class="hidden text-[11px] font-semibold text-[var(--ink)] sm:inline">Video</span>
				</a>

				<span class="mx-1 h-5 w-px shrink-0 bg-[var(--line)]" aria-hidden="true"></span>

				<span class="mr-1 shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
					Kategoriler
				</span>
				<?php
				$nav_cats = get_categories( array( 'number' => 8, 'hide_empty' => false ) );
				foreach ( $nav_cats as $nc ) :
					$meta = my_theme_category_meta( $nc->name );
					?>
					<a href="<?php echo esc_url( get_category_link( $nc->term_id ) ); ?>" class="flex shrink-0 items-center gap-1 border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-sm transition hover:scale-105 hover:border-[var(--cyan)]" style="border-radius: var(--radius)">
						<span class="text-base leading-none"><?php echo esc_html( $meta['emoji'] ); ?></span>
						<span class="hidden text-[11px] font-semibold text-[var(--ink)] sm:inline"><?php echo esc_html( $nc->name ); ?></span>
					</a>
				<?php endforeach; ?>
			</div>
		</nav>
	<?php endif; ?>

	<div id="content" class="site-content">
