CREATE TABLE `coupon_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`email` varchar(320) NOT NULL,
	`discountPct` int NOT NULL DEFAULT 15,
	`used` boolean NOT NULL DEFAULT false,
	`usedAt` timestamp,
	`orderId` int,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupon_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupon_codes_code_unique` UNIQUE(`code`)
);
