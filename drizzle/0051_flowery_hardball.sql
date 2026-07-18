ALTER TABLE `chat_conversations` MODIFY COLUMN `userId` int;--> statement-breakpoint
ALTER TABLE `chat_conversations` ADD `sessionId` varchar(64);--> statement-breakpoint
ALTER TABLE `chat_conversations` ADD `displayName` varchar(255);