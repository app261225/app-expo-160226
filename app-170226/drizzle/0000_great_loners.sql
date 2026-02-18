CREATE TABLE `log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_produk` integer,
	`id_pengguna` integer,
	`tipe` text,
	`qty` integer NOT NULL,
	`notes` text,
	`created` integer DEFAULT '"2026-02-16T18:15:05.972Z"',
	`updated` integer,
	`deleted` integer,
	FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pengguna` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`nama` text,
	`role` text DEFAULT 'staff',
	`last_aktif` integer,
	`created` integer DEFAULT '"2026-02-16T18:15:05.970Z"',
	`updated` integer,
	`deleted` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pengguna_username_unique` ON `pengguna` (`username`);--> statement-breakpoint
CREATE TABLE `produk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` text,
	`nama` text NOT NULL,
	`stock_min` integer DEFAULT 0,
	`stock` integer DEFAULT 0,
	`modal_non_rp` real,
	`mata_uang_non_rp` text,
	`modal_rp` integer,
	`jual` integer,
	`in_sum` integer DEFAULT 0,
	`out_sum` integer DEFAULT 0,
	`in_count` integer DEFAULT 0,
	`out_count` integer DEFAULT 0,
	`created` integer DEFAULT '"2026-02-16T18:15:05.971Z"',
	`updated` integer,
	`deleted` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `produk_sku_unique` ON `produk` (`sku`);