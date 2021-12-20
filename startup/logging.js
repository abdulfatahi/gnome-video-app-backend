import winston from 'winston';

const { createLogger, transports } = winston;

export default () => {
  // Enable rejection and exception handling when creating logger.
  createLogger({
    rejectionHandlers: [
      new transports.Console({ format: winston.format.simple() }),
      new transports.File({ filename: 'rejections.log' }),
    ],
    exceptionHandlers: [
      new transports.Console({ format: winston.format.simple() }),
      new transports.File({ filename: 'exceptions.log' }),
    ],

  });

  winston.add(new winston.transports.File({ filename: 'logfile.log' }));
  if (process.env.NODE_ENV !== 'production') {
    winston.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }
};
