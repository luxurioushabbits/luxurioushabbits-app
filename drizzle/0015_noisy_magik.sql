CREATE TABLE `restock_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`notified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `restock_notifications_id` PRIMARY KEY(`id`)
);
