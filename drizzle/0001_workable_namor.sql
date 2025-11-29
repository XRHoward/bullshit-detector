CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text` text NOT NULL,
	`language` varchar(10) NOT NULL,
	`score` int NOT NULL,
	`suggestions` text,
	`buzzwords` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `buzzwords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word` varchar(255) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`language` varchar(10) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buzzwords_id` PRIMARY KEY(`id`),
	CONSTRAINT `buzzwords_word_unique` UNIQUE(`word`)
);
