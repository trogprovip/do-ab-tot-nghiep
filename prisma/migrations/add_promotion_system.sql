-- CreateEnum
CREATE ENUM `discount_type` AS ('percentage', 'fixed_amount');

-- CreateEnum
CREATE ENUM `promotions_status` AS ('active', 'inactive', 'expired');

-- CreateTable
CREATE TABLE `promotions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `promotion_code` VARCHAR(50) NOT NULL,
    `promotion_name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `discount_type` ENUM('percentage', 'fixed_amount') NOT NULL,
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `max_discount_amount` DECIMAL(10, 2) NULL,
    `min_order_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `usage_limit` INT UNSIGNED NULL,
    `usage_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `usage_per_user` INT UNSIGNED NOT NULL DEFAULT 1,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `applicable_days` VARCHAR(50) NULL,
    `applicable_movies` TEXT NULL,
    `applicable_cinemas` TEXT NULL,
    `status` ENUM('active', 'inactive', 'expired') NOT NULL DEFAULT 'active',
    `image_url` VARCHAR(255) NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `promotions_promotion_code_key`(`promotion_code`),
    INDEX `idx_promotion_code`(`promotion_code`),
    INDEX `idx_promotion_status`(`status`),
    INDEX `idx_promotion_dates`(`start_date`, `end_date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_usage` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `promotion_id` INT UNSIGNED NOT NULL,
    `account_id` INT UNSIGNED NOT NULL,
    `tickets_id` INT UNSIGNED NOT NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL,
    `used_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_promotion_usage_account`(`account_id`),
    INDEX `idx_promotion_usage_promotion`(`promotion_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddColumn
ALTER TABLE `tickets` ADD COLUMN `promotion_id` INT UNSIGNED NULL, ADD COLUMN `promotion_code` VARCHAR(50) NULL;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_promotion_id` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_usage` ADD CONSTRAINT `fk_promotion_usage_promotion_id` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_usage` ADD CONSTRAINT `fk_promotion_usage_account_id` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_usage` ADD CONSTRAINT `fk_promotion_usage_tickets_id` FOREIGN KEY (`tickets_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
