ALTER TABLE `active_sessions` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `active_sessions` ADD `userName` varchar(255);--> statement-breakpoint
ALTER TABLE `active_sessions` ADD `walletAddress` varchar(64);--> statement-breakpoint
ALTER TABLE `active_sessions` ADD `ipAddress` varchar(64);--> statement-breakpoint
ALTER TABLE `active_sessions` ADD `city` varchar(128);--> statement-breakpoint
ALTER TABLE `active_sessions` ADD `region` varchar(128);--> statement-breakpoint
ALTER TABLE `active_sessions` ADD `country` varchar(64);