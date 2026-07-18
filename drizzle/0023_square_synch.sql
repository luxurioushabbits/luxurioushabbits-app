CREATE TABLE `email_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(255) NOT NULL,
	`previewText` varchar(255),
	`htmlBody` text NOT NULL,
	`status` enum('draft','sending','sent','failed') NOT NULL DEFAULT 'draft',
	`recipientCount` int NOT NULL DEFAULT 0,
	`sentCount` int NOT NULL DEFAULT 0,
	`sentAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `abandoned_carts` ADD `email2SentAt` timestamp;--> statement-breakpoint
ALTER TABLE `abandoned_carts` ADD `email3SentAt` timestamp;