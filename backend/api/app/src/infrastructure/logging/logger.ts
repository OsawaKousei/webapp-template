import pino, { type Logger, type LevelWithSilent } from 'pino';

type CreateLoggerInput = {
  readonly level: LevelWithSilent;
};

export const createLogger = ({ level }: CreateLoggerInput): Logger => {
  return pino({ level });
};
