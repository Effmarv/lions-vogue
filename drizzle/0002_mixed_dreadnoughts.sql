ALTER TABLE `categories` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` MODIFY COLUMN `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `displayOrder` int DEFAULT 0 NOT NULL;