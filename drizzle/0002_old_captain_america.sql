ALTER TABLE `buzzwords` DROP INDEX `buzzwords_word_unique`;--> statement-breakpoint
ALTER TABLE `buzzwords` ADD CONSTRAINT `word_language_idx` UNIQUE(`word`,`language`);