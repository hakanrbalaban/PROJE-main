const X_VELOCITY = 150;
const Y_VELOCITY = 150;

class Player {
  constructor({ x, y, size, velocity = { x: 0, y: 0 } }) {
    this.x = x;
    this.y = y;
    this.width = size;
    this.height = size;
    this.velocity = velocity;

    this.loaded = false;
    this.image = new Image();
    this.image.onload = () => {
      this.loaded = true
    };
    this.image.src = "./images/player.png"; // Replace with actual image path
    this.currentFrame = 0
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
    };
    this.currentSprite = this.sprites.walkDown;
  } 

  draw(c) {
    if (!this.loaded) return

    // Red square debug code
    // c.fillStyle = "rgba(0, 0, 255, 0.5)";
    // c.fillRect(this.x, this.y, this.width, this.height);

    

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
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return;
    this.elapsTime += deltaTime;
    const intervalToGoToNextFrame = 0.15; // 100ms per frame
    if (this.elapsTime > intervalToGoToNextFrame) {
      this.currentFrame = (this.currentFrame + 1) % 4;
      this.elapsTime -= intervalToGoToNextFrame;
    }
    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime);
    this.checkForHorizontalCollisions(collisionBlocks);

    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime);
    this.checkForVerticalCollisions(collisionBlocks);
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

    if (keys.d.pressed) {
      this.velocity.x = X_VELOCITY;
      this.currentSprite = this.sprites.walkRight;
      this.currentSprite.frameCount = 4; // Reset to the first frame when moving left
    } else if (keys.a.pressed) {
      this.velocity.x = -X_VELOCITY;
      this.currentSprite = this.sprites.walkLeft;
      this.currentSprite.frameCount = 4; // Reset to the first frame when moving right
    } else if (keys.w.pressed) {
      this.velocity.y = -Y_VELOCITY;
      this.currentSprite = this.sprites.walkUp;
      this.currentSprite.frameCount = 4; // Reset to the first frame when moving up
    } else if (keys.s.pressed) {
      this.velocity.y = Y_VELOCITY;
      this.currentSprite = this.sprites.walkDown;
      this.currentSprite.frameCount = 4; // Reset to the first frame when moving down
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
