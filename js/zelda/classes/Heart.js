class Heart {
  constructor({ x, y}) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };

    this.loaded = false;
    this.image = new Image();
    this.image.onload = () => {
      this.loaded = true;
    };
    this.image.src = "./images/heart.png"; // Replace with actual image path
    this.currentFrame = 4;
    
    
    this.currentSprite = {
        x: 0,
        y: 0,
        width: 16,
        height: 16,
        frameCount: 4,
    };
  
  }
  
  draw(c) {
    if (!this.loaded) return;

    // Red square debug code
    // c.fillStyle = "rgba(0, 0, 255, 0.5)";
    // c.fillRect(this.x, this.y, this.width, this.height);
    // Attack box debug code
    // c.fillStyle = "rgba(0, 0, 255, 0.5)";
    // c.fillRect(this.attackBox.x, this.attackBox.y, this.attackBox.width, this.attackBox.height);

    c.drawImage(
      this.image,
      this.currentSprite.x + this.currentSprite.width * this.currentFrame,
      this.currentSprite.y,
      this.currentSprite.width,
      this.currentSprite.height,
      this.x,
      this.y,
      this.width,
      this.height
    )
  }

}

  