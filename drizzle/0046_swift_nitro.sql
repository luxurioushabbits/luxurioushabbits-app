ALTER TABLE `users` ADD `isWholesale` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `wholesaleApprovedAt` timestamp;