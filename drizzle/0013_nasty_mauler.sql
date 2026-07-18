CREATE TABLE `email_captures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`couponCode` varchar(32),
	`discountPct` int NOT NULL DEFAULT 15,
	`source` varchar(64) NOT NULL DEFAULT 'popup',
	`used` boolean NOT NULL DEFAULT false,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_captures_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_captures_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`status` varchar(64) NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_status_history_id` PRIMARY KEY(`id`)
);
