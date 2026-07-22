class Monster {
  constructor({
    x,
    y,
    size,
    velocity = { x: 0, y: 0 },
    imgSrc,
    sprites,
    health = 3,
  }) {
    this.x = x;
    this.y = y;
    this.originalPosition = {
      x: x,
      y: y,
    };
    this.width = size;
    this.height = size;
    this.velocity = velocity;
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };

    this.loaded = false;
    this.image = new Image();
    this.image.onload = () => {
      this.loaded = true;
    };
    this.image.src = imgSrc;
    this.currentFrame = 0;
    this.elapsTime = 0;
    this.elapsedMovementTime = 0;
    this.sprites = sprites;
    this.currentSprite = Object.values(this.sprites)[0];
    this.health = health;
    this.isInvincible = false;
    this.elapsedInvincibilityTime = 0;
    this.invincibilityInterval = 0.3;
  }
  receiveHit() {
    if (this.isInvincible) return;
    this.health--;
    this.isInvincible = true;
  }

  draw(c) {
    if (!this.loaded) return;

    // Red square debug code
    // c.fillStyle = "rgba(0, 0, 255, 0.5)";
    // c.fillRect(this.x, this.y, this.width, this.height);
    let alpha = 1
    if (this.isInvincible) {
      alpha = 0.5;
    }
    c.save();
    c.globalAlpha = alpha;
    c.drawImage(
      this.image,
      this.currentSprite.x,
      this.currentSprite.height * this.currentFrame + 0.5, // Add 0.5 to avoid subpixel rendering issues
      this.currentSprite.width,
      this.currentSprite.height,
      this.x,
      this.y,
      this.width,
      this.height,
    );
    c.restore();
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return;
    this.elapsTime += deltaTime;
    //tutorial
    //this.elapsedInvincibilityTime += deltaTime;

    // tutorial kodu
    // if (this.elapsedInvincibilityTime > this.invincibilityInterval) {
    //   this.isInvincible = false;
    //   this.elapsedInvincibilityTime = 0;
    // }
    if (this.isInvincible) {
      this.elapsedInvincibilityTime += deltaTime;
      if (this.elapsedInvincibilityTime >= this.invincibilityInterval) {
        this.isInvincible = false;
        this.elapsedInvincibilityTime = 0; // Süre bittiğinde sıfırla
      }
    } else {
      this.elapsedInvincibilityTime = 0; // Hasar almıyorken sayaç hep 0'da beklesin
    }
    // update(deltaTime, collisionBlocks) fonksiyonunun içi:
    // if (this.invincible) {
    //   this.elapsedInvincibilityTime += deltaTime;
    //   if (this.elapsedInvincibilityTime > this.invincibilityInterval) {
    //     this.invincible = false;
    //     this.elapsedInvincibilityTime = 0;
    //   }
    // } else {
    //   // Hasar almıyorsa sayacı sıfırda tut ki bir sonraki darbede 0'dan başlasın
    //   this.elapsedInvincibilityTime = 0;
    // }

    const intervalToGoToNextFrame = 0.15; // 100ms per frame
    if (this.elapsTime > intervalToGoToNextFrame) {
      this.currentFrame = (this.currentFrame + 1) % 4;
      this.elapsTime -= intervalToGoToNextFrame;
    }
    // Randomly choose place for enemy to move to
    this.setVelocity(deltaTime);

    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime);
    this.checkForHorizontalCollisions(collisionBlocks);

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime);
    this.checkForVerticalCollisions(collisionBlocks);

    if (this.x < 0) this.x = 0;

    // Sağ sınır kontrolü
    if (this.x + this.width > MAP_WIDTH) {
      this.x = MAP_WIDTH - this.width;
    }

    // Üst sınır kontrolü
    if (this.y < 0) this.y = 0;

    // Alt sınır kontrolü
    if (this.y + this.height > MAP_HEIGHT) {
      this.y = MAP_HEIGHT - this.height;
    }
    // =========================================================

    // Merkez koordinatını sınır kontrolünden sonra hesaplıyoruz ki kamera sapıtmasın
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }
  setVelocity(deltaTime) {
    const changeDirectionInterval = 3; // Change direction every 3 seconds
    if (
      this.elapsedMovementTime > changeDirectionInterval ||
      this.elapsedMovementTime === 0
    ) {
      this.elapsedMovementTime -= changeDirectionInterval;
      const angle = Math.random() * 2 * Math.PI;
      const CIRCLE_RADIUS = 15;
      const targetLocation = {
        x: this.originalPosition.x + Math.cos(angle) * CIRCLE_RADIUS,
        y: this.originalPosition.y + Math.sin(angle) * CIRCLE_RADIUS,
      };
      const deltaX = targetLocation.x - this.x;
      const deltaY = targetLocation.y - this.y;
      const hypotenuse = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normalizedDeltaX = deltaX / hypotenuse;
      const normalizedDeltaY = deltaY / hypotenuse;
      this.velocity.x = normalizedDeltaX * CIRCLE_RADIUS; // Adjust speed as needed
      this.velocity.y = normalizedDeltaY * CIRCLE_RADIUS; // Adjust speed as needed
    }
    this.elapsedMovementTime += deltaTime;
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime;
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime;
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001;
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i];

      // Check if a collision exists on all axes
      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going left
        if (this.velocity.x < -0) {
          this.x = collisionBlock.x + collisionBlock.width + buffer;
          this.velocity.x = -this.velocity.x; // Reverse direction
          break;
        }

        // Check collision while player is going right
        if (this.velocity.x > 0) {
          this.x = collisionBlock.x - this.width - buffer;
          this.velocity.x = -this.velocity.x; // Reverse direction
          break;
        }
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001;
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i];

      // If a collision exists
      if (
        this.x <= collisionBlock.x + collisionBlock.width &&
        this.x + this.width >= collisionBlock.x &&
        this.y + this.height >= collisionBlock.y &&
        this.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Check collision while player is going up
        if (this.velocity.y < 0) {
          this.y = collisionBlock.y + collisionBlock.height + buffer;
          this.velocity.y = -this.velocity.y; // Reverse direction
          break;
        }

        // Check collision while player is going down
        if (this.velocity.y > 0) {
          this.y = collisionBlock.y - this.height - buffer;
          this.velocity.y = -this.velocity.y; // Reverse direction
          break;
        }
      }
    }
  }
}
