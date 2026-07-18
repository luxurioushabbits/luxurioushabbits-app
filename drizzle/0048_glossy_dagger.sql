CREATE TABLE `pending_gifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`points` int NOT NULL,
	`message` varchar(500) NOT NULL DEFAULT 'You''ve been selected for a special reward!',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pending_gifts_id` PRIMARY KEY(`id`)
);
