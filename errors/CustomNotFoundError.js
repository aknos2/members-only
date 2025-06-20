export class CustomNotFoundError {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = "NotFoundError";
    Error.captureStackTrace(this, this.constructor);
  }
}