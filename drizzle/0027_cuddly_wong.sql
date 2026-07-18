ALTER TABLE `orders` ADD `crowdshipOrderId` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `crowdshipSubmittedAt` timestamp;--> statement-breakpoint
ALTER TABLE `products` ADD `crowdshipVariantId` varchar(100);--> statement-breakpoint
ALTER TABLE `products` ADD `crowdshipSku` varchar(100);--> statement-breakpoint
ALTER TABLE `products` ADD `crowdshipSupplierId` varchar(100);