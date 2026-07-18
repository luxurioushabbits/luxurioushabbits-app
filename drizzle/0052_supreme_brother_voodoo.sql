ALTER TABLE `chat_conversations` ADD `chatStatus` enum('open','closed') DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_conversations` ADD `adminInitiated` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_conversations` ADD `closedAt` timestamp;