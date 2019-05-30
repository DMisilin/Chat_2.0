CREATE TABLE `history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chat` varchar(45) DEFAULT NULL,
  `text` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT current_timestamp(),
  `sender` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=350 DEFAULT CHARSET=latin1;
