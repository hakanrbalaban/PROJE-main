<?php
/**
 * Sport + standings.
 *
 * @package AkisHaber
 */

$q = akishaber_query_by_cat( 'spor', 8 );
if ( ! $q->have_posts() ) {
	$q = akishaber_latest( 8 );
}
$posts = array();
if ( $q->have_posts() ) {
	while ( $q->have_posts() ) {
		$q->the_post();
		$posts[] = get_post();
	}
	wp_reset_postdata();
}
?>
<section class="section section--alt" id="spor">
	<div class="container spor-layout">
		<div>
			<div class="section__head">
				<h2><?php esc_html_e( 'Spor', 'akishaber' ); ?></h2>
				<a class="all-link" href="<?php echo esc_url( akishaber_cat_link( 'spor' ) ); ?>"><?php esc_html_e( 'Tümü', 'akishaber' ); ?></a>
			</div>
			<?php if ( ! empty( $posts[0] ) ) : ?>
				<?php
				$post = $posts[0];
				setup_postdata( $post );
				?>
				<div class="spor-hero">
					<article <?php post_class( 'story story--overlay', $post ); ?>>
						<a href="<?php the_permalink(); ?>" class="story__media"><?php akishaber_the_thumb( 'akishaber-hero' ); ?></a>
						<div class="story__body">
							<?php akishaber_the_category_badge(); ?>
							<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
						</div>
					</article>
				</div>
				<?php wp_reset_postdata(); ?>
			<?php endif; ?>
			<div class="grid-2 mt">
				<?php
				for ( $i = 1; $i < count( $posts ) && $i < 7; $i++ ) :
					$post = $posts[ $i ];
					setup_postdata( $post );
					?>
					<article <?php post_class( 'story story--row', $post ); ?>>
						<a href="<?php the_permalink(); ?>" class="story__media"><?php akishaber_the_thumb( 'akishaber-thumb' ); ?></a>
						<div class="story__body"><h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3></div>
					</article>
					<?php
					wp_reset_postdata();
				endfor;
				?>
			</div>
		</div>
		<aside class="standings" id="puan">
			<div class="standings__head">
				<h3><?php esc_html_e( 'Puan Durumu', 'akishaber' ); ?></h3>
				<select id="leagueSelect" aria-label="<?php esc_attr_e( 'Lig seçin', 'akishaber' ); ?>">
					<option>TFF Süper Lig</option>
					<option>TFF 1. Lig</option>
					<option>Basketbol Süper Lig</option>
					<option>Kadınlar Basketbol Süper Lig</option>
				</select>
			</div>
			<table>
				<thead>
					<tr><th>#</th><th><?php esc_html_e( 'Takım', 'akishaber' ); ?></th><th>O</th><th>Av</th><th>P</th></tr>
				</thead>
				<tbody id="standingsBody">
					<tr><td>1</td><td>Galatasaray</td><td>34</td><td>+48</td><td>95</td></tr>
					<tr><td>2</td><td>Fenerbahçe</td><td>34</td><td>+52</td><td>93</td></tr>
					<tr><td>3</td><td>Beşiktaş</td><td>34</td><td>+28</td><td>72</td></tr>
					<tr><td>4</td><td>Trabzonspor</td><td>34</td><td>+18</td><td>61</td></tr>
					<tr><td>5</td><td>Başakşehir</td><td>34</td><td>+12</td><td>55</td></tr>
					<tr><td>6</td><td>Eyüpspor</td><td>34</td><td>+6</td><td>50</td></tr>
					<tr><td>7</td><td>Göztepe</td><td>34</td><td>+4</td><td>48</td></tr>
					<tr><td>8</td><td>Kasımpaşa</td><td>34</td><td>+2</td><td>46</td></tr>
					<tr><td>9</td><td>Samsunspor</td><td>34</td><td>0</td><td>44</td></tr>
					<tr><td>10</td><td>Alanyaspor</td><td>34</td><td>−2</td><td>42</td></tr>
				</tbody>
			</table>
			<ul class="mini-news">
				<?php
				for ( $i = 7; $i < count( $posts ); $i++ ) :
					$post = $posts[ $i ];
					setup_postdata( $post );
					?>
					<li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
					<?php
					wp_reset_postdata();
				endfor;
				?>
			</ul>
		</aside>
	</div>
</section>
