CREATE TABLE `active_sessions` (
	`sessionId` varchar(64) NOT NULL,
	`path` varchar(500) NOT NULL,
	`lastSeen` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `active_sessions_sessionId` PRIMARY KEY(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`path` varchar(500) NOT NULL,
	`referrer` varchar(500),
	`userAgent` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
