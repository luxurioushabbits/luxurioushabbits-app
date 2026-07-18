ALTER TABLE `active_sessions` ADD `timezone` varchar(100);--> statement-breakpoint
ALTER TABLE `active_sessions` ADD `browserLanguage` varchar(20);--> statement-breakpoint
ALTER TABLE `active_sessions` ADD `referrer` varchar(500);--> statement-breakpoint
ALTER TABLE `active_sessions` ADD `pageCount` int DEFAULT 1;