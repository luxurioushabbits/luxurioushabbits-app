ALTER TABLE `users` ADD `walletAddress` varchar(42);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_walletAddress_unique` UNIQUE(`walletAddress`);