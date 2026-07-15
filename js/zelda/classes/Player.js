const X_VELOCITY = 150;
const Y_VELOCITY = 150;

class Player {
  constructor({ x, y, size, velocity = { x: 0, y: 0 } }) {
    this.x = x;
    this.y = y;
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
    this.image.src = "./images/player.png"; // Replace with actual image path

    this.weaponSpriteHasLoaded = false;
    this.weaponSprite = new Image();
    this.weaponSprite.onload = () => {
      this.weaponSpriteHasLoaded = true;
    };
    this.weaponSprite.src = "./images/lance.png"; // Replace with actual image path

    this.currentFrame = 0;
    this.elapsTime = 0;
    this.sprites = {
      walkDown: {
        x: 0,
        y: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
      walkUp: {
        x: 16,
        y: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
      walkLeft: {
        x: 32,
        y: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
      walkRight: {
        x: 48,
        y: 0,
        width: 16,
        height: 16,
        frameCount: 4,
      },
      attackDown: {
        x: 0,
        y: 64,
        width: 16,
        height: 15,
        frameCount: 1,
      },
      attackUp: {
        x: 16,
        y: 64,
        width: 16,
        height: 15,
        frameCount: 1,
      },
      attackLeft: {
        x: 32,
        y: 64,
        width: 16,
        height: 15,
        frameCount: 1,
      },
      attackRight: {
        x: 48,
        y: 64,
        width: 16,
        height: 15,
        frameCount: 1,
      },
    };
    this.currentSprite = this.sprites.walkDown; // Default sprite
    this.facing = "down"; // Default facing direction
    this.isAttaking = false;
    this.attackTimer = 0;
    this.attackBox = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }
  }
  switchBackToIdleState() {
    switch (this.facing){
      case "down":
        this.currentSprite = this.sprites.walkDown
        break;
      case "up":
        this.currentSprite = this.sprites.walkUp
        break;
      case "right":
        this.currentSprite = this.sprites.walkRight
        break;
      case "left":
        this.currentSprite = this.sprites.walkLeft
        break;
    }
  }
  attack() {
    switch (this.facing) {
      case "down":
        this.currentSprite = this.sprites.attackDown
        break;
      case "up":
        this.currentSprite = this.sprites.attackUp
        break;
      case "right":
        this.currentSprite = this.sprites.attackRight
        break;
      case "left":
        this.currentSprite = this.sprites.attackLeft
        break;
    }
      this.currentFrame = 0
      this.isAttaking = true;
  }

  draw(c) {
    if (!this.loaded || !this.weaponSpriteHasLoaded) return;

    // Red square debug code
    // c.fillStyle = "rgba(0, 0, 255, 0.5)";
    // c.fillRect(this.x, this.y, this.width, this.height);

    c.drawImage(
      this.image,
      this.currentSprite.x,
      this.currentSprite.y + this.currentSprite.height * this.currentFrame + 0.5, // Add 0.5 to avoid subpixel rendering issues
      this.currentSprite.width,
      this.currentSprite.height,
      this.x,
      this.y,
      this.width,
      this.height,
    );
    if (this.isAttaking) {
    let angle = 0;
    let xOffset = 0;
    let yOffset = 0;
    switch (this.facing) {
      case "down":
        angle = 0;
        xOffset = 5;
        yOffset = 22;
        break;
      case "up":
        angle = Math.PI;
        xOffset = 4;
        yOffset = -7;
        break;
      case "right":
        angle = Math.PI * 3 / 2;
        xOffset = 22;
        yOffset = 11;
        break;
      case "left":
        angle = Math.PI / 2;
        xOffset = -8;
        yOffset = 12;
        break;
    }

    c.save()
    c.translate(this.x + xOffset, this.y + yOffset);
    c.rotate(angle)
    c.drawImage(this.weaponSprite, -3, -8, 6, 16);
    c.restore()
  }
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return;
    const timeToCompleteAttack = 0.3;
    if(this.isAttaking && this.attackTimer < timeToCompleteAttack){
    this.attackTimer += deltaTime;
    }else if(this.isAttaking && this.attackTimer >= timeToCompleteAttack){
      this.isAttaking = false;
      this.attackTimer = 0;
      this.switchBackToIdleState()
    }
    this.elapsTime += deltaTime;

    const intervalToGoToNextFrame = 0.15; // 100ms per frame
    if (this.elapsTime > intervalToGoToNextFrame) {
      this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frameCount;
      this.elapsTime -= intervalToGoToNextFrame;
    }

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

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime;
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime;
  }

  handleInput(keys) {
    this.velocity.x = 0;
    this.velocity.y = 0;
    if (this.isAttaking) return
    if (keys.d.pressed) {
      this.velocity.x = X_VELOCITY;
      this.currentSprite = this.sprites.walkRight;
      this.currentSprite.frameCount = 4; // Reset to the first frame when moving left
      this.facing = "right";
    } else if (keys.a.pressed) {
      this.velocity.x = -X_VELOCITY;
      this.currentSprite = this.sprites.walkLeft;
      this.currentSprite.frameCount = 4; // Reset to the first frame when moving right
      this.facing = "left";
    } else if (keys.w.pressed) {
      this.velocity.y = -Y_VELOCITY;
      this.currentSprite = this.sprites.walkUp;
      this.currentSprite.frameCount = 4; // Reset to the first frame when moving up
      this.facing = "up";
    } else if (keys.s.pressed) {
      this.velocity.y = Y_VELOCITY;
      this.currentSprite = this.sprites.walkDown;
      this.currentSprite.frameCount = 4; // Reset to the first frame when moving down
      this.facing = "down";
    } else {
      this.currentSprite.frameCount = 1; // Reset to the first frame when no keys are pressed
    }
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
          break;
        }

        // Check collision while player is going right
        if (this.velocity.x > 0) {
          this.x = collisionBlock.x - this.width - buffer;

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
          this.velocity.y = 0;
          this.y = collisionBlock.y + collisionBlock.height + buffer;
          break;
        }

        // Check collision while player is going down
        if (this.velocity.y > 0) {
          this.velocity.y = 0;
          this.y = collisionBlock.y - this.height - buffer;
          break;
        }
      }
    }
  }
}
