export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, new.target.prototype)
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, 'BAD_REQUEST', details)
  }

  static unauthorized(message = 'Non authentifié') {
    return new AppError(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Accès refusé') {
    return new AppError(message, 403, 'FORBIDDEN')
  }

  static notFound(message: string) {
    return new AppError(message, 404, 'NOT_FOUND')
  }

  static conflict(message: string) {
    return new AppError(message, 409, 'CONFLICT')
  }

  static internal(message = 'Erreur interne du serveur') {
    return new AppError(message, 500, 'INTERNAL_ERROR')
  }
}
