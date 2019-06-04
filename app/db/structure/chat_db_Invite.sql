CREATE TABLE `Invate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` datetime DEFAULT current_timestamp(),
  `from` varchar(45) DEFAULT NULL,
  `to` varchar(45) DEFAULT NULL,
  `chat_id` int(11) DEFAULT NULL,
  `progress` int(11) DEFAULT NULL, /* 0 - ожидание; 1 - приглашение выслано */
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
