CREATE TABLE `users` (
    `user_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'идентификатор пользователя',
    `user_name` varchar(45) COMMENT 'имя пользователя', 
    `password` varchar(45) COMMENT 'пароль пользователя',

    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `history` (
    `hist_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'идентификатор записи',
    `dialog` varchar(70) COMMENT 'названия диалога', 
    `text_mess` varchar(255) COMMENT 'текст сообщения',
    `date` datetime COMMENT 'время получения сообщения сервером (пока не реализовано)',

    PRIMARY KEY (`hist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
