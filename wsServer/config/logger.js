const config = require('./configLog');

module.exports = () => {
    const winston = require('winston');
    const { format, createLogger, transports } = winston;
    const { printf } = format;

    const myFormat = printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level} ${message}`;
    })

    return createLogger({
        levels: config.levels,
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.errors({ stack: true }),
            format.splat(),
            format.json(),
            format.colorize(),
            myFormat
        ),
        transports: [
            new transports.Console({ level: config.level.consoleLevel})
        ]
    });
}
