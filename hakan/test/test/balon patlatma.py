import pygame
import random

pygame.init()
clock = pygame.time.Clock()
genislik = 800
yukseklik = 600
pencere = pygame.display.set_mode((genislik,yukseklik))
pygame.display.set_caption("Balon Patlatma :)")

# RENKLER
siyah = (0,0,0)
beyaz = (255,255,255)

# BALON
balon_resim = pygame.image.load("balon.png")
balon = []
balon_hiz = []
balon_sayisi = 5
for i in range(balon_sayisi):
    balon.append(balon_resim.get_rect(center = (random.randint(64, genislik-64), random.randint(600,1000))))
    balon_hiz.append(random.randint(2,6))

# SKOR
kacirilan_balon = 0
skor = 0
font = pygame.font.Font(None, 40)

# OYUN DÖNGÜSÜ
oyun = True
while oyun:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            oyun = False
        if event.type == pygame.MOUSEBUTTONDOWN:
            fare_konum = pygame.mouse.get_pos()
            for i in range(balon_sayisi):
                if balon[i].collidepoint(fare_konum):
                    skor += 1
                    balon[i].x = random.randint(64, genislik-64)
                    balon[i].y = random.randint(600,1000)
                    balon_hiz[i] = random.randint(2,6)

    # BALON HAREKETİ
    for i in range(balon_sayisi):
        balon[i].y -= balon_hiz[i]
        if balon[i].bottom <= 0:
            kacirilan_balon += 1
            balon[i].x = random.randint(64, genislik-64)
            balon[i].y = random.randint(600,1000)
            balon_hiz[i] = random.randint(2,6)

    # OYUN SONU
    if kacirilan_balon >= 5:
        oyun = False

    # EKRANA ÇİZME
    pencere.fill(beyaz)
    for i in range(balon_sayisi):
        pencere.blit(balon_resim, balon[i])
    skor_yazisi = font.render("Skor: {}".format(skor), True, siyah)
    pencere.blit(skor_yazisi, (20,20))

    clock.tick(60)
    pygame.display.update()

pygame.quit()