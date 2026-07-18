ALTER TABLE `orders` ADD `topshelfOrderNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `topshelfSubmittedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `topshelfError` text;