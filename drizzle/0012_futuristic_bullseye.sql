CREATE TABLE `abandoned_carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`cartData` text NOT NULL,
	`totalCents` int NOT NULL,
	`recoveryEmailSentAt` timestamp,
	`recoveredAt` timestamp,
	`orderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `abandoned_carts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`referrerUrl` text,
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`orderId` int NOT NULL,
	`orderTotalCents` int NOT NULL,
	`commissionCents` int NOT NULL,
	`status` enum('pending','approved','paid','reversed') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_conversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`affiliateCode` varchar(20) NOT NULL,
	`commissionPercent` decimal(5,2) NOT NULL DEFAULT '10.00',
	`status` enum('active','paused','terminated') NOT NULL DEFAULT 'active',
	`paypalEmail` varchar(320),
	`totalEarnedCents` int NOT NULL DEFAULT 0,
	`totalPaidCents` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `affiliates_affiliateCode_unique` UNIQUE(`affiliateCode`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `adminNotes` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `customerPhone` varchar(30);--> statement-breakpoint
ALTER TABLE `orders` ADD `smsOptIn` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `couponCode` varchar(50);--> statement-breakpoint
ALTER TABLE `orders` ADD `discountAmount` decimal(10,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `orders` ADD `referralCode` varchar(20);