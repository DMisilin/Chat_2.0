const winston = require('winston');
const { format, createLogger, transports } = winston;
const { printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level} ${message}`;
})

module.exports = createLogger({
    level: 'info',
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
        new transports.Console()
    ]
});
