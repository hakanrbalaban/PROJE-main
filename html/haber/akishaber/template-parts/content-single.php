<?php
/**
 * Single content — enriched article layout.
 *
 * @package AkisHaber
 */

$share_url   = rawurlencode( get_permalink() );
$share_title = rawurlencode( get_the_title() );
?>
<article <?php post_class( 'single-article' ); ?>>
	<header class="entry-header">
		<nav class="breadcrumb" aria-label="<?php esc_attr_e( 'İçerik yolu', 'akishaber' ); ?>">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Ana Sayfa', 'akishaber' ); ?></a>
			<span class="sep">/</span>
			<?php
			$cats = get_the_category();
			if ( $cats ) :
				?>
				<a href="<?php echo esc_url( get_category_link( $cats[0] ) ); ?>"><?php echo esc_html( $cats[0]->name ); ?></a>
				<span class="sep">/</span>
			<?php endif; ?>
			<span><?php the_title(); ?></span>
		</nav>

		<?php akishaber_the_category_badge(); ?>
		<h1 class="entry-title"><?php the_title(); ?></h1>
		<div class="meta entry-meta">
			<span><?php the_author_posts_link(); ?></span>
			<span>·</span>
			<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
			<span>·</span>
			<span><?php echo esc_html( akishaber_reading_time() ); ?></span>
			<?php if ( get_comments_number() ) : ?>
				<span>·</span>
				<a href="#comments"><?php comments_number( '0 yorum', '1 yorum', '% yorum' ); ?></a>
			<?php endif; ?>
		</div>
	</header>

	<?php $gallery_images = akishaber_gallery_images( get_the_ID(), 12 ); ?>
	<figure class="entry-thumb entry-thumb--featured">
		<button
			type="button"
			class="entry-thumb__zoom"
			data-gallery="<?php echo esc_attr( wp_json_encode( $gallery_images ) ); ?>"
			data-title="<?php the_title_attribute(); ?>"
			aria-label="<?php esc_attr_e( 'Görseli büyüt', 'akishaber' ); ?>"
		>
			<?php akishaber_the_thumb( 'akishaber-hero', null, array( 'loading' => 'eager' ) ); ?>
			<span class="entry-thumb__icon"><?php akishaber_icon( 'expand', 20 ); ?></span>
		</button>
		<?php
		$caption = get_the_post_thumbnail_caption();
		$credit  = akishaber_image_credit();
		if ( $caption || $credit ) :
			?>
			<figcaption class="wp-caption-text">
				<?php echo esc_html( $caption ); ?>
				<?php if ( $credit ) : ?>
					<span class="image-credit"><?php echo esc_html( $credit ); ?></span>
				<?php endif; ?>
			</figcaption>
		<?php endif; ?>
	</figure>

	<div class="article-body">
		<nav class="share-rail" aria-label="<?php esc_attr_e( 'Haberi paylaş', 'akishaber' ); ?>">
			<a href="<?php echo esc_url( 'https://twitter.com/intent/tweet?url=' . $share_url . '&text=' . $share_title ); ?>" target="_blank" rel="noopener noreferrer" aria-label="X">X</a>
			<a href="<?php echo esc_url( 'https://www.facebook.com/sharer/sharer.php?u=' . $share_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
			<a href="<?php echo esc_url( 'https://api.whatsapp.com/send?text=' . $share_title . '%20' . $share_url ); ?>" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">W</a>
		</nav>
		<div class="entry-content">
			<?php if ( has_excerpt() ) : ?>
				<p class="article-lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
			<?php endif; ?>
			<?php the_content(); ?>
			<?php
			wp_link_pages(
				array(
					'before' => '<div class="page-links">' . esc_html__( 'Sayfalar:', 'akishaber' ),
					'after'  => '</div>',
				)
			);
			?>
		</div>
	</div>

	<div class="entry-share">
		<span><?php esc_html_e( 'Paylaş:', 'akishaber' ); ?></span>
		<a class="share-btn" href="<?php echo esc_url( 'https://twitter.com/intent/tweet?url=' . $share_url . '&text=' . $share_title ); ?>" target="_blank" rel="noopener noreferrer">X</a>
		<a class="share-btn" href="<?php echo esc_url( 'https://www.facebook.com/sharer/sharer.php?u=' . $share_url ); ?>" target="_blank" rel="noopener noreferrer">Facebook</a>
		<a class="share-btn" href="<?php echo esc_url( 'https://api.whatsapp.com/send?text=' . $share_title . '%20' . $share_url ); ?>" target="_blank" rel="noopener noreferrer">WhatsApp</a>
		<a class="share-btn" href="<?php echo esc_url( 'https://www.linkedin.com/shareArticle?mini=true&url=' . $share_url . '&title=' . $share_title ); ?>" target="_blank" rel="noopener noreferrer">LinkedIn</a>
		<button type="button" class="share-btn" id="copyLinkBtn" data-url="<?php echo esc_url( get_permalink() ); ?>"><?php esc_html_e( 'Linki Kopyala', 'akishaber' ); ?></button>
	</div>

	<?php if ( count( $gallery_images ) > 1 ) : ?>
		<section class="entry-gallery">
			<h2 class="entry-gallery__title">
				<?php akishaber_icon( 'foto', 18 ); ?>
				<?php esc_html_e( 'Haberin Fotoğrafları', 'akishaber' ); ?>
			</h2>
			<div class="entry-gallery__grid">
				<?php foreach ( $gallery_images as $position => $image ) : ?>
					<button
						type="button"
						class="entry-gallery__item"
						data-gallery="<?php echo esc_attr( wp_json_encode( $gallery_images ) ); ?>"
						data-title="<?php the_title_attribute(); ?>"
						aria-label="<?php echo esc_attr( sprintf( /* translators: %d: photo number. */ __( '%d. fotoğrafı büyüt', 'akishaber' ), $position + 1 ) ); ?>"
					>
						<img src="<?php echo esc_url( $image['thumb'] ); ?>" alt="<?php echo esc_attr( $image['caption'] ); ?>" loading="lazy" />
					</button>
				<?php endforeach; ?>
			</div>
		</section>
	<?php endif; ?>

	<footer class="entry-footer">
		<?php the_tags( '<div class="post-tags"><strong>' . esc_html__( 'Etiketler:', 'akishaber' ) . '</strong> ', ' ', '</div>' ); ?>
	</footer>

	<aside class="author-box">
		<?php echo get_avatar( get_the_author_meta( 'ID' ), 96 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<div>
			<h3><?php the_author(); ?></h3>
			<p>
				<?php
				$bio = get_the_author_meta( 'description' );
				echo $bio
					? esc_html( $bio )
					: esc_html__( 'Bu yazarın haber ve köşe yazılarını takip edebilirsiniz.', 'akishaber' );
				?>
			</p>
			<a class="author-posts-link" href="<?php echo esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ); ?>">
				<?php esc_html_e( 'Tüm yazıları →', 'akishaber' ); ?>
			</a>
		</div>
	</aside>

	<?php
	$related = akishaber_related_posts( 6 );
	if ( $related->have_posts() ) :
		?>
		<section class="related-block">
			<div class="related-block__heading">
				<h2><?php esc_html_e( 'Benzer Haberler', 'akishaber' ); ?></h2>
				<span><?php esc_html_e( 'Bu konudaki diğer gelişmeler', 'akishaber' ); ?></span>
			</div>
			<div class="related-grid">
				<?php
				while ( $related->have_posts() ) :
					$related->the_post();
					?>
					<article <?php post_class( 'story' ); ?>>
						<a href="<?php the_permalink(); ?>" class="story__media"><?php akishaber_the_thumb( 'akishaber-card' ); ?></a>
						<div class="story__body">
							<?php akishaber_the_category_badge(); ?>
							<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
						</div>
					</article>
					<?php
				endwhile;
				wp_reset_postdata();
				?>
			</div>
		</section>
	<?php endif; ?>

	<nav class="post-navigation" aria-label="<?php esc_attr_e( 'Yazı navigasyonu', 'akishaber' ); ?>">
		<div class="nav-previous"><?php previous_post_link( '%link', '← %title' ); ?></div>
		<div class="nav-next"><?php next_post_link( '%link', '%title →' ); ?></div>
	</nav>

	<?php
	if ( comments_open() || get_comments_number() ) {
		comments_template();
	}
	?>
</article>
