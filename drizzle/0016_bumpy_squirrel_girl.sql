CREATE TABLE `product_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int NOT NULL,
	`question` text NOT NULL,
	`answer` text,
	`answeredAt` timestamp,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(64) NOT NULL DEFAULT 'Home',
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`address1` varchar(255) NOT NULL,
	`address2` varchar(255),
	`city` varchar(100) NOT NULL,
	`state` varchar(50) NOT NULL,
	`zip` varchar(20) NOT NULL,
	`phone` varchar(30),
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_addresses_id` PRIMARY KEY(`id`)
);
