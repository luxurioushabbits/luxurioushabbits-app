CREATE TABLE `smoke_shop_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32),
	`monthlyBudget` decimal(10,2) NOT NULL,
	`shippingAddress1` varchar(255) NOT NULL,
	`shippingAddress2` varchar(255),
	`shippingCity` varchar(100) NOT NULL,
	`shippingState` varchar(50) NOT NULL,
	`shippingZip` varchar(20) NOT NULL,
	`notes` text,
	`adminNotes` text,
	`status` enum('pending','contacted','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smoke_shop_inquiries_id` PRIMARY KEY(`id`)
);
