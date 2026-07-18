CREATE TABLE `product_terpenes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`terpeneSlug` varchar(100) NOT NULL,
	`terpeneName` varchar(100) NOT NULL,
	`percentage` decimal(6,4),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_terpenes_id` PRIMARY KEY(`id`)
);
