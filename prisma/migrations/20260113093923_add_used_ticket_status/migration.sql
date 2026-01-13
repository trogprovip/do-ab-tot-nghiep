-- CreateTable
CREATE TABLE `accounts` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(15) NULL,
    `full_name` VARCHAR(50) NOT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    `create_at` DATETIME(0) NULL,
    `update_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `username`(`username`),
    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookingseats` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `tickets_id` INTEGER UNSIGNED NOT NULL,
    `seat_id` INTEGER UNSIGNED NOT NULL,
    `seat_price` DECIMAL(10, 2) NOT NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    INDEX `seat_id`(`seat_id`),
    UNIQUE INDEX `tickets_id`(`tickets_id`, `seat_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cinemas` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `province_id` INTEGER UNSIGNED NOT NULL,
    `cinema_name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `status` ENUM('active', 'inactive') NULL DEFAULT 'active',
    `phone` VARCHAR(10) NULL,
    `email` VARCHAR(50) NULL,
    `create_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    INDEX `province_id`(`province_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moviecinemas` (
    `movie_id` INTEGER UNSIGNED NOT NULL,
    `cinema_id` INTEGER UNSIGNED NOT NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    INDEX `cinema_id`(`cinema_id`),
    PRIMARY KEY (`movie_id`, `cinema_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movies` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `duration` INTEGER NOT NULL,
    `release_date` DATE NULL,
    `director` VARCHAR(100) NULL,
    `cast` TEXT NULL,
    `genre` VARCHAR(100) NULL,
    `language` VARCHAR(50) NULL,
    `poster_url` VARCHAR(255) NULL,
    `trailer_url` VARCHAR(255) NULL,
    `status` ENUM('coming_soon', 'now_showing', 'ended') NULL DEFAULT 'coming_soon',
    `create_at` DATETIME(0) NULL,
    `update_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `create_at` DATETIME(0) NULL,
    `update_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_name` VARCHAR(100) NOT NULL,
    `category` ENUM('food', 'drink', 'combo', 'voucher') NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `create_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provinces` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `province_name` VARCHAR(100) NOT NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rooms` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `cinema_id` INTEGER UNSIGNED NOT NULL,
    `room_name` VARCHAR(50) NOT NULL,
    `room_type` VARCHAR(50) NULL,
    `total_seats` INTEGER NOT NULL,
    `status` ENUM('active', 'inactive') NULL DEFAULT 'active',
    `is_deleted` BOOLEAN NULL DEFAULT false,

    INDEX `cinema_id`(`cinema_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seats` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER UNSIGNED NOT NULL,
    `seat_row` VARCHAR(5) NOT NULL,
    `seat_number` INTEGER NOT NULL,
    `seat_type_id` INTEGER UNSIGNED NOT NULL,
    `status` ENUM('active', 'broken') NULL DEFAULT 'active',

    INDEX `seat_type_id`(`seat_type_id`),
    UNIQUE INDEX `room_id`(`room_id`, `seat_row`, `seat_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seattypes` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `type_name` VARCHAR(50) NOT NULL,
    `price_multiplier` DECIMAL(3, 2) NULL DEFAULT 1.00,
    `description` VARCHAR(255) NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setting_system` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `create_at` DATETIME(0) NULL,
    `config_data` JSON NOT NULL,
    `type` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `type`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `slots` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `movie_id` INTEGER UNSIGNED NOT NULL,
    `room_id` INTEGER UNSIGNED NULL,
    `show_time` DATETIME(0) NOT NULL,
    `end_time` DATETIME(0) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `empty_seats` INTEGER NOT NULL,
    `create_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    INDEX `movie_id`(`movie_id`),
    INDEX `room_id`(`room_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `account_id` INTEGER UNSIGNED NOT NULL,
    `slot_id` INTEGER UNSIGNED NOT NULL,
    `tickets_code` VARCHAR(20) NOT NULL,
    `qr_code_url` VARCHAR(255) NULL,
    `qr_code_data` TEXT NULL,
    `tickets_date` DATETIME(0) NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `discount_amount` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `final_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `payment_status` ENUM('unpaid', 'paid', 'refunded') NULL DEFAULT 'unpaid',
    `status` ENUM('pending', 'confirmed', 'cancelled', 'used') NULL DEFAULT 'pending',
    `note` TEXT NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `tickets_code`(`tickets_code`),
    INDEX `account_id`(`account_id`),
    INDEX `slot_id`(`slot_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticketsdetails` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `tickets_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    INDEX `product_id`(`product_id`),
    INDEX `tickets_id`(`tickets_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `account_id` INTEGER UNSIGNED NOT NULL,
    `movie_id` INTEGER UNSIGNED NOT NULL,
    `create_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` BOOLEAN NULL DEFAULT false,

    INDEX `idx_favorites_movie_id`(`movie_id`),
    INDEX `idx_favorites_account_id`(`account_id`),
    UNIQUE INDEX `account_id`(`account_id`, `movie_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `account_id` INTEGER UNSIGNED NOT NULL,
    `movie_id` INTEGER UNSIGNED NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL,
    `comment` TEXT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `create_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NULL DEFAULT false,

    INDEX `idx_reviews_movie_id`(`movie_id`),
    INDEX `idx_reviews_account_id`(`account_id`),
    INDEX `idx_reviews_rating`(`rating`),
    INDEX `idx_reviews_status`(`status`),
    UNIQUE INDEX `account_id_2`(`account_id`, `movie_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookingseats` ADD CONSTRAINT `bookingseats_ibfk_1` FOREIGN KEY (`tickets_id`) REFERENCES `tickets`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookingseats` ADD CONSTRAINT `bookingseats_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seats`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cinemas` ADD CONSTRAINT `cinemas_ibfk_1` FOREIGN KEY (`province_id`) REFERENCES `provinces`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `moviecinemas` ADD CONSTRAINT `moviecinemas_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `moviecinemas` ADD CONSTRAINT `moviecinemas_ibfk_2` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `seats` ADD CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `seats` ADD CONSTRAINT `seats_ibfk_2` FOREIGN KEY (`seat_type_id`) REFERENCES `seattypes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `slots` ADD CONSTRAINT `slots_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `slots` ADD CONSTRAINT `slots_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`slot_id`) REFERENCES `slots`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ticketsdetails` ADD CONSTRAINT `ticketsdetails_ibfk_1` FOREIGN KEY (`tickets_id`) REFERENCES `tickets`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ticketsdetails` ADD CONSTRAINT `ticketsdetails_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
