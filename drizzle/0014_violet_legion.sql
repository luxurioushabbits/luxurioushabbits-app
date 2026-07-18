ALTER TABLE `products` ADD `stockQuantity` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `isOutOfStock` boolean DEFAULT false NOT NULL;