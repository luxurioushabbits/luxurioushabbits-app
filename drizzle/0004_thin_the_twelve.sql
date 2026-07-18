CREATE TABLE `product_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`tag` varchar(100) NOT NULL,
	CONSTRAINT `product_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriptionId` int NOT NULL,
	`orderId` int,
	`periodLabel` varchar(50) NOT NULL,
	`status` enum('pending','processing','shipped','delivered','skipped') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscription_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wholesale_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactName` varchar(200) NOT NULL,
	`title` varchar(100),
	`businessName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`website` varchar(500),
	`instagram` varchar(200),
	`facebook` varchar(200),
	`tiktok` varchar(200),
	`twitter` varchar(200),
	`youtube` varchar(200),
	`otherSocials` text,
	`state` varchar(50) NOT NULL,
	`city` varchar(100),
	`businessType` enum('smoke_shop','dispensary','online_retailer','gym_wellness','bar_restaurant','distributor','convenience_store','vape_shop','other') NOT NULL,
	`businessTypeOther` varchar(200),
	`yearsInBusiness` enum('less_than_1','1_2','3_5','6_10','over_10'),
	`numberOfLocations` enum('1','2_5','6_10','over_10'),
	`averageMonthlyRevenue` enum('under_10k','10k_50k','50k_100k','100k_500k','over_500k'),
	`targetDemographic` text,
	`avgCustomerAge` enum('21_25','26_35','36_45','46_plus','mixed'),
	`monthlyVolume` enum('under_500','500_2000','2000_5000','5000_10000','over_10000') NOT NULL,
	`productsInterested` text NOT NULL,
	`timeline` enum('immediately','within_30_days','1_3_months','just_exploring') NOT NULL,
	`currentSupplier` varchar(255),
	`currentSpendMonthly` enum('none','under_500','500_2000','2000_5000','over_5000'),
	`whySwitch` text,
	`farmBillAware` boolean NOT NULL DEFAULT false,
	`hasRetailLicense` boolean NOT NULL DEFAULT false,
	`stateCompliant` boolean NOT NULL DEFAULT false,
	`howHeard` enum('google','instagram','tiktok','referral','trade_show','other'),
	`additionalNotes` text,
	`leadScore` int NOT NULL DEFAULT 0,
	`leadGrade` enum('hot','warm','cold') NOT NULL DEFAULT 'cold',
	`status` enum('new','contacted','qualified','disqualified','closed_won','closed_lost') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wholesale_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `cart_items`;--> statement-breakpoint
ALTER TABLE `smoke_shop_inquiries` RENAME COLUMN `email` TO `contactEmail`;--> statement-breakpoint
ALTER TABLE `smoke_shop_inquiries` RENAME COLUMN `phone` TO `contactPhone`;--> statement-breakpoint
ALTER TABLE `customer_subscriptions` DROP FOREIGN KEY `customer_subscriptions_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `customer_subscriptions` DROP FOREIGN KEY `customer_subscriptions_planId_subscription_plans_id_fk`;
--> statement-breakpoint
ALTER TABLE `habbits_box_contents` DROP FOREIGN KEY `habbits_box_contents_planId_subscription_plans_id_fk`;
--> statement-breakpoint
ALTER TABLE `habbits_box_contents` DROP FOREIGN KEY `habbits_box_contents_productId_products_id_fk`;
--> statement-breakpoint
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_productId_products_id_fk`;
--> statement-breakpoint
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_vendorId_vendors_id_fk`;
--> statement-breakpoint
ALTER TABLE `orders` DROP FOREIGN KEY `orders_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_images` DROP FOREIGN KEY `product_images_productId_products_id_fk`;
--> statement-breakpoint
ALTER TABLE `products` DROP FOREIGN KEY `products_vendorId_vendors_id_fk`;
--> statement-breakpoint
ALTER TABLE `vendor_orders` DROP FOREIGN KEY `vendor_orders_orderId_orders_id_fk`;
--> statement-breakpoint
ALTER TABLE `vendor_orders` DROP FOREIGN KEY `vendor_orders_vendorId_vendors_id_fk`;
--> statement-breakpoint
ALTER TABLE `customer_subscriptions` MODIFY COLUMN `shippingName` varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_subscriptions` MODIFY COLUMN `shippingAddress1` varchar(300) NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_subscriptions` MODIFY COLUMN `shippingAddress2` varchar(300);--> statement-breakpoint
ALTER TABLE `customer_subscriptions` MODIFY COLUMN `contactName` varchar(200);--> statement-breakpoint
ALTER TABLE `customer_subscriptions` MODIFY COLUMN `contactEmail` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_subscriptions` MODIFY COLUMN `contactPhone` varchar(30);--> statement-breakpoint
ALTER TABLE `habbits_box_contents` MODIFY COLUMN `periodLabel` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `orderNumber` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `customerName` varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `shippingName` varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `shippingAddress1` varchar(300) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `shippingAddress2` varchar(300);--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `trackingNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `trackingCarrier` varchar(50);--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `tagline` varchar(500);--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `category` enum('flower','extract','edible','tincture','topical','accessory','other') NOT NULL DEFAULT 'flower';--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `strainType` enum('indica','sativa','hybrid','cbd','cbg');--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `coaBatch` varchar(100);--> statement-breakpoint
ALTER TABLE `smoke_shop_inquiries` MODIFY COLUMN `contactName` varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE `smoke_shop_inquiries` MODIFY COLUMN `contactPhone` varchar(30);--> statement-breakpoint
ALTER TABLE `subscription_plans` MODIFY COLUMN `name` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `subscription_plans` MODIFY COLUMN `slug` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `subscription_plans` MODIFY COLUMN `monthlyPrice` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `vendor_orders` MODIFY COLUMN `status` enum('pending','sent','confirmed','shipped','delivered') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `vendor_orders` MODIFY COLUMN `trackingNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `vendors` MODIFY COLUMN `contactName` varchar(200);--> statement-breakpoint
ALTER TABLE `vendors` MODIFY COLUMN `commissionRate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `customer_subscriptions` ADD `businessAddress` text;--> statement-breakpoint
ALTER TABLE `products` ADD `costPrice` decimal(10,2);--> statement-breakpoint
ALTER TABLE `products` ADD `metaTitle` varchar(255);--> statement-breakpoint
ALTER TABLE `products` ADD `sortOrder` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `smoke_shop_inquiries` ADD `businessAddress` text;--> statement-breakpoint
ALTER TABLE `subscription_plans` ADD `features` text;--> statement-breakpoint
ALTER TABLE `customer_subscriptions` DROP COLUMN `lastShippedAt`;--> statement-breakpoint
ALTER TABLE `customer_subscriptions` DROP COLUMN `paymentProfileId`;--> statement-breakpoint
ALTER TABLE `customer_subscriptions` DROP COLUMN `cancelledAt`;--> statement-breakpoint
ALTER TABLE `order_items` DROP COLUMN `wholesalePrice`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `customerPhone`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `shippingCountry`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `discountAmount`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `taxAmount`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `paymentMethod`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `paymentTransactionId`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `subscriptionId`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `stockCount`;--> statement-breakpoint
ALTER TABLE `subscription_plans` DROP COLUMN `tier`;--> statement-breakpoint
ALTER TABLE `subscription_plans` DROP COLUMN `minimumBudget`;--> statement-breakpoint
ALTER TABLE `subscription_plans` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `vendor_orders` DROP COLUMN `forwardedAt`;--> statement-breakpoint
ALTER TABLE `vendor_orders` DROP COLUMN `vendorOrderRef`;