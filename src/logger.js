const winston = require("winston")
require("winston-daily-rotate-file")

module.exports = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, timestamp, message }) => {
      return `[${level}][${timestamp}] ${message}`
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.colorize()
    }),
    new winston.transports.DailyRotateFile({
      dirname: "logs",
      filename: "%DATE%.log",
      datePattern: "YYYY-MM-DD HH-mm-ss"
    })
  ]
})