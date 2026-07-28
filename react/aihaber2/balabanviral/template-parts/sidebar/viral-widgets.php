<?php
/**
 * Demo sidebar boxes (sample data only — not live APIs).
 * Shown when Customizer > Show demo sidebar widgets is enabled.
 *
 * @package BalabanViral
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! get_theme_mod( 'my_theme_show_demo_widgets', false ) ) {
	return;
}

$w = my_theme_get_widgets_data();
?>

<p class="bv-demo-note text-[10px] text-[var(--muted)] mb-2"><?php esc_html_e( 'The boxes below are sample (demo) data — not a live API.', 'balabanviral' ); ?></p>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php esc_html_e( 'Weather', 'balabanviral' ); ?> <span class="text-[10px] font-normal text-[var(--muted)]">(<?php esc_html_e( 'demo', 'balabanviral' ); ?>)</span></h3>
	<p class="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--ink)]">
		<?php echo esc_html( (string) $w['weather']['temperature'] . $w['weather']['unit'] ); ?>
	</p>
	<p class="mt-1 text-sm text-[var(--mist)]">
		<?php echo esc_html( $w['weather']['city'] . ' · ' . $w['weather']['label'] ); ?>
	</p>
	<p class="mt-2 text-xs text-[var(--muted)]">
		<?php
		printf(
			/* translators: 1: humidity percent, 2: wind speed km/h */
			esc_html__( 'Humidity %1$s%% · Wind %2$s km/h', 'balabanviral' ),
			esc_html( (string) $w['weather']['humidity'] ),
			esc_html( (string) $w['weather']['wind'] )
		);
		?>
	</p>
</section>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php esc_html_e( 'Currency', 'balabanviral' ); ?></h3>
	<p class="mb-2 text-[10px] text-[var(--muted)]"><?php echo esc_html( $w['currency']['source'] ); ?></p>
	<ul class="space-y-1.5">
		<?php foreach ( $w['currency']['pairs'] as $pair ) : ?>
			<li class="flex items-center justify-between text-sm">
				<span class="text-[var(--mist)]"><?php echo esc_html( $pair['label'] ); ?></span>
				<span class="font-bold text-[var(--ink)]"><?php echo esc_html( number_format_i18n( (float) $pair['value'], 2 ) ); ?></span>
			</li>
		<?php endforeach; ?>
	</ul>
</section>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php esc_html_e( 'Markets', 'balabanviral' ); ?></h3>
	<p class="mb-2 text-[10px] text-[var(--muted)]"><?php echo esc_html( $w['markets']['note'] ); ?></p>
	<ul class="space-y-1.5">
		<?php foreach ( $w['markets']['items'] as $item ) : ?>
			<li class="flex items-center justify-between gap-2 text-sm">
				<span class="text-[var(--mist)]"><?php echo esc_html( $item['name'] ); ?></span>
				<span class="text-right">
					<span class="font-bold text-[var(--ink)]"><?php echo esc_html( number_format_i18n( (float) $item['value'] ) ); ?></span>
					<span class="<?php echo esc_attr( ( (float) $item['change'] >= 0 ) ? 'text-[var(--cyan)]' : 'text-[var(--hot)]' ); ?> ml-1 text-xs">
						<?php
						echo esc_html(
							( (float) $item['change'] >= 0 ? '+' : '' ) . number_format_i18n( (float) $item['change'], 1 ) . '%'
						);
						?>
					</span>
				</span>
			</li>
		<?php endforeach; ?>
	</ul>
</section>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php esc_html_e( 'Quote of the Day', 'balabanviral' ); ?></h3>
	<blockquote class="font-[family-name:var(--font-serif)] text-[15px] italic leading-relaxed text-[var(--ink-soft)]">
		“<?php echo esc_html( $w['quote']['text'] ); ?>”
	</blockquote>
	<p class="mt-2 text-xs text-[var(--sand)]">— <?php echo esc_html( $w['quote']['author'] ); ?></p>
</section>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php esc_html_e( 'Horoscopes', 'balabanviral' ); ?></h3>
	<div class="max-h-48 space-y-2 overflow-y-auto pr-1">
		<?php foreach ( array_slice( $w['horoscopes'], 0, 6 ) as $h ) : ?>
			<div class="border-b border-[var(--line)] pb-2 last:border-0">
				<p class="text-xs font-bold text-[var(--ink)]"><?php echo esc_html( $h['label'] ); ?> <span class="font-normal text-[var(--muted)]"><?php echo esc_html( $h['range'] ); ?></span></p>
				<p class="mt-0.5 text-[11px] leading-snug text-[var(--mist)]"><?php echo esc_html( $h['text'] ); ?></p>
			</div>
		<?php endforeach; ?>
	</div>
</section>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php esc_html_e( 'Hadith', 'balabanviral' ); ?></h3>
	<p class="font-[family-name:var(--font-serif)] text-sm leading-relaxed text-[var(--mist)]">
		<?php echo esc_html( $w['hadith']['text'] ); ?>
	</p>
	<p class="mt-2 text-[10px] text-[var(--muted)]"><?php echo esc_html( $w['hadith']['source'] ); ?></p>
</section>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php esc_html_e( 'Verse', 'balabanviral' ); ?></h3>
	<p class="font-[family-name:var(--font-serif)] text-sm leading-relaxed text-[var(--mist)]">
		<?php echo esc_html( $w['verse']['text'] ); ?>
	</p>
	<p class="mt-2 text-[10px] text-[var(--sand)]"><?php echo esc_html( $w['verse']['ref'] ); ?></p>
</section>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php echo esc_html( $w['religiousTip']['title'] ); ?></h3>
	<p class="text-sm text-[var(--mist)]"><?php echo esc_html( $w['religiousTip']['text'] ); ?></p>
</section>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php esc_html_e( 'Prayer Times', 'balabanviral' ); ?></h3>
	<p class="mb-2 text-xs text-[var(--muted)]">
		<?php echo esc_html( $w['prayer']['city'] . ' · ' . $w['prayer']['date'] ); ?>
	</p>
	<ul class="grid grid-cols-2 gap-1.5 text-sm">
		<?php foreach ( $w['prayer']['times'] as $label => $time ) : ?>
			<li class="flex justify-between rounded-lg bg-[var(--panel-2)] px-2 py-1">
				<span class="capitalize text-[var(--muted)]"><?php echo esc_html( $label ); ?></span>
				<span class="font-semibold text-[var(--ink)]"><?php echo esc_html( $time ); ?></span>
			</li>
		<?php endforeach; ?>
	</ul>
	<p class="mt-2 text-[10px] text-[var(--muted)]"><?php echo esc_html( $w['prayer']['note'] ); ?></p>
</section>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php esc_html_e( 'Word of the Day', 'balabanviral' ); ?></h3>
	<p class="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)]"><?php echo esc_html( $w['word']['word'] ); ?></p>
	<p class="mt-1 text-sm text-[var(--mist)]"><?php echo esc_html( $w['word']['meaning'] ); ?></p>
</section>

<section class="widget animate-rise">
	<h3 class="widget-title"><?php esc_html_e( 'Fun Fact', 'balabanviral' ); ?></h3>
	<p class="text-sm leading-relaxed text-[var(--mist)]"><?php echo esc_html( $w['funFact'] ); ?></p>
</section>
