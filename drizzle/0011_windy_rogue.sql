CREATE TABLE `gbp_review_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`screenshotUrl` text NOT NULL,
	`screenshotKey` text NOT NULL,
	`reviewerName` varchar(100) NOT NULL,
	`status` enum('pending','approved','rejected','duplicate') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`creditIssued` boolean NOT NULL DEFAULT false,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `gbp_review_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referralCode` varchar(16) NOT NULL,
	`referredEmail` varchar(320),
	`referredUserId` int,
	`orderId` int,
	`status` enum('pending','converted','rewarded') NOT NULL DEFAULT 'pending',
	`rewardCents` int NOT NULL DEFAULT 500,
	`rewardIssuedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`)
);
