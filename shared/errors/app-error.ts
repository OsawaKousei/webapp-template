export type AppError =
  | {
    readonly type: 'NOT_FOUND';
    readonly message: string;
  }
  | {
    readonly type: 'CONFLICT';
    readonly message: string;
  }
  | {
    readonly type: 'INTERNAL_SERVER_ERROR';
    readonly message: string;
  };

export const createNotFoundError = (message: string): AppError => {
  return {
    type: 'NOT_FOUND',
    message,
  };
};

export const createConflictError = (message: string): AppError => {
  return {
    type: 'CONFLICT',
    message,
  };
};

export const createInternalServerError = (message: string): AppError => {
  return {
    type: 'INTERNAL_SERVER_ERROR',
    message,
  };
};
