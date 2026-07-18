CREATE TABLE `dropship_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactName` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`businessName` varchar(255) NOT NULL,
	`website` varchar(500),
	`instagram` varchar(200),
	`currentPlatforms` text,
	`monthlyVolume` varchar(100),
	`whyPartner` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dropship_applications_id` PRIMARY KEY(`id`)
);
