class ApiError extends Error {
  code: number;
  constructor(code: number, message: string | undefined, stack = '') {
    super(message);
    this.code = code;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
