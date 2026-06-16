import { type Request, type Response, type NextFunction, type RequestHandler } from 'express'

// Wrapper pour passer automatiquement les erreurs async au error handler Express
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}
