CREATE SCHEMA `social` ;

USE `social`;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `coverPic` VARCHAR(300) NULL,
  `profilePic` VARCHAR(300) NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `posts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `desc` VARCHAR(200) NULL,
  `img` VARCHAR(300) NULL,
  `userId` INT NOT NULL,
  `createdAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `userId_idx` (`userId`),
  CONSTRAINT `fk_userId`
    FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE `comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `desc` VARCHAR(200) NOT NULL,
  `createdAt` DATETIME NULL,
  `userId` INT NOT NULL,
  `postId` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `userId_idx` (`userId`),
  INDEX `postId_idx` (`postId`),
  CONSTRAINT `fk_comment_user`
    FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_comment_post`
    FOREIGN KEY (`postId`)
    REFERENCES `posts` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE `likes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `postId` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `userId_idx` (`userId`),
  INDEX `postId_idx` (`postId`),
  CONSTRAINT `fk_like_user`
    FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_like_post`
    FOREIGN KEY (`postId`)
    REFERENCES `posts` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE `relationships` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `followerUserId` INT NOT NULL,
  `followedUserId` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `followerUser_idx` (`followerUserId`),
  INDEX `followedUser_idx` (`followedUserId`),
  CONSTRAINT `fk_relationship_follower`
    FOREIGN KEY (`followerUserId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_relationship_followed`
    FOREIGN KEY (`followedUserId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
