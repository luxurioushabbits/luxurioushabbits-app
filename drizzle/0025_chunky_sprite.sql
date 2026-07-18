ALTER TABLE `users` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `smsOptIn` boolean DEFAULT false NOT NULL;