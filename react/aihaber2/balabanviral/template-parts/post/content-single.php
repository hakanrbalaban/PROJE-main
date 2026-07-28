<?php
/**
 * Template part for displaying single post content matching ArticleView.tsx
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

my_theme_set_post_views( get_the_ID() );
$post_id   = get_the_ID();
$views     = my_theme_get_post_views( $post_id );
$likes     = (int) get_post_meta( $post_id, 'my_theme_post_likes_count', true );
if ( ! $likes ) {
	$likes = get_comments_number( $post_id ) * 5 + 24;
}

$fire_count      = my_theme_get_reaction_count( $post_id, 'fire' );
$heart_count     = my_theme_get_reaction_count( $post_id, 'heart' );
$mindblown_count = my_theme_get_reaction_count( $post_id, 'mindblown' );
$like_count      = my_theme_get_reaction_count( $post_id, 'like' );
$permalink       = get_permalink( $post_id );
$title           = get_the_title( $post_id );
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( 'single-article-view' ); ?>>
	<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="mb-6 inline-block text-sm text-[var(--muted)] hover:text-[var(--hot)]">
		← Yazılara dön
	</a>

	<?php
	$cover = function_exists( 'my_theme_get_cover_url' ) ? my_theme_get_cover_url( $post_id ) : '';
	if ( $cover ) :
		?>
		<div class="overflow-hidden border border-[var(--line)] shadow-[0_20px_60px_rgba(225,29,72,0.1)]" style="border-radius: var(--radius)">
			<img src="<?php echo esc_url( $cover ); ?>" alt="<?php echo esc_attr( $title ); ?>" class="aspect-[16/9] w-full object-cover" />
		</div>
	<?php endif; ?>

	<div class="mt-6">
		<div class="flex flex-wrap items-center gap-2">
			<?php
			$categories = get_the_category();
			if ( ! empty( $categories ) ) :
				?>
				<a href="<?php echo esc_url( get_category_link( $categories[0]->term_id ) ); ?>" class="rounded-full bg-[rgba(0,229,192,0.18)] px-3 py-1 text-xs font-bold text-[var(--cyan)]">
					<?php echo esc_html( $categories[0]->name ); ?>
				</a>
			<?php endif; ?>
			<span class="viral-badge">🔥 Magazin</span>
			<span class="text-xs text-[var(--muted)]">
				👁 <span id="view-counter-num"><?php echo esc_html( $views ); ?></span> · ❤️ <span id="like-counter-num"><?php echo esc_html( $likes ); ?></span> · ⏱️ <?php echo esc_html( my_theme_estimate_reading_time( $post_id ) ); ?> dk
			</span>
		</div>

		<h1 class="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight text-white sm:text-4xl">
			<?php the_title(); ?>
		</h1>

		<p class="mt-3 text-sm text-[var(--muted)]">
			<?php echo esc_html( get_the_author() ); ?> · <?php echo esc_html( get_the_date( 'j F Y' ) ); ?> · Editöryel
		</p>
	</div>

	<div class="prose-aiora mt-8">
		<?php the_content(); ?>
	</div>

	<!-- Interactive Reaction Bar matching React ReactionBar.tsx -->
	<div class="mt-8 flex flex-wrap items-center gap-2.5 rounded-2xl border border-[var(--line)] bg-[rgba(26,15,46,0.85)] p-4 shadow-lg">
		<span class="mr-2 text-xs font-bold uppercase tracking-wider text-[var(--hot)]">Tepki Ver:</span>

		<button type="button" class="ajax-reaction-btn flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold text-[var(--mist)] transition hover:border-[var(--hot)] hover:text-white" data-post-id="<?php echo esc_attr( $post_id ); ?>" data-reaction="fire">
			<span>🔥</span> <span class="count"><?php echo esc_html( $fire_count ); ?></span>
		</button>

		<button type="button" class="ajax-reaction-btn flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold text-[var(--mist)] transition hover:border-[var(--hot)] hover:text-white" data-post-id="<?php echo esc_attr( $post_id ); ?>" data-reaction="heart">
			<span>❤️</span> <span class="count"><?php echo esc_html( $heart_count ); ?></span>
		</button>

		<button type="button" class="ajax-reaction-btn flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold text-[var(--mist)] transition hover:border-[var(--cyan)] hover:text-white" data-post-id="<?php echo esc_attr( $post_id ); ?>" data-reaction="mindblown">
			<span>🤯</span> <span class="count"><?php echo esc_html( $mindblown_count ); ?></span>
		</button>

		<button type="button" class="ajax-reaction-btn flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold text-[var(--mist)] transition hover:border-[var(--lime)] hover:text-white" data-post-id="<?php echo esc_attr( $post_id ); ?>" data-reaction="like">
			<span>👍</span> <span class="count"><?php echo esc_html( $like_count ); ?></span>
		</button>

		<!-- Share Buttons -->
		<div class="ml-auto flex items-center gap-2">
			<button type="button" class="btn-copy-link rounded-full border border-[var(--line)] bg-[rgba(0,229,192,0.15)] px-3 py-1.5 text-xs font-bold text-[var(--cyan)] transition hover:bg-[var(--cyan)] hover:text-[var(--ink)]" data-url="<?php echo esc_url( $permalink ); ?>">
				🔗 Bağlantıyı Kopyala
			</button>
			<a href="https://twitter.com/intent/tweet?text=<?php echo urlencode( $title ); ?>&url=<?php echo urlencode( $permalink ); ?>" target="_blank" rel="noopener noreferrer" class="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--mist)] hover:border-[var(--cyan)]">
				🐦
			</a>
			<a href="https://api.whatsapp.com/send?text=<?php echo urlencode( $title . ' ' . $permalink ); ?>" target="_blank" rel="noopener noreferrer" class="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--mist)] hover:border-[var(--lime)]">
				💬
			</a>
		</div>
	</div>

	<!-- Author Note Box -->
	<aside class="mt-10 rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[rgba(255,45,106,0.12)] to-[rgba(0,229,192,0.08)] p-5">
		<p class="text-xs font-bold uppercase tracking-wider text-[var(--hot)]">
			Yazar Yorumu
		</p>
		<p class="mt-2 text-sm leading-relaxed text-[var(--mist)]">
			“Bu haber kaleme alınırken tarafsız yayıncılık ve editöryel standartlar ön planda tutulmuştur.”
		</p>
		<p class="mt-3 text-sm font-semibold text-white">— <?php echo esc_html( get_the_author() ); ?></p>
	</aside>

	<div class="mt-8 flex flex-wrap gap-2">
		<?php
		$tags = get_the_tags();
		if ( $tags ) :
			foreach ( $tags as $tag ) :
				?>
				<a href="<?php echo esc_url( get_tag_link( $tag->term_id ) ); ?>" class="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-xs text-[var(--cyan)] hover:border-[var(--hot)]">
					#<?php echo esc_html( $tag->name ); ?>
				</a>
				<?php
			endforeach;
		endif;
		?>
	</div>
</article>
