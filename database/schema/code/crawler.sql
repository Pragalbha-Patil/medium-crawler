CREATE TABLE `search_history` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `search_tag` varchar(255),
  `created_at` timestamp,
  `result_found` TINYINT(1)
);

CREATE TABLE `blogs` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255),
  `author` varchar(255),
  `details` varchar(255),
  `tags` varchar(255),
  `comments` varchar(255),
  `time_taken` decimal(20,10)
);

CREATE TABLE `tags` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `tag` varchar(255)
);
