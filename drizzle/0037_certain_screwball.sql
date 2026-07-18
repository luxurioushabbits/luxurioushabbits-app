CREATE TABLE `strain_review_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`body` text NOT NULL,
	`photoKey` text,
	`approved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `strain_review_comments_id` PRIMARY KEY(`id`)
);
