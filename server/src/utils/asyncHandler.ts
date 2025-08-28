import type { Request, Response, NextFunction } from 'express';

interface AsyncRequestHandler {
  (req: Request, res: Response, next: NextFunction): Promise<any>;
}

const asyncHandler = (requestHandler: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next))
      .catch((err: unknown) => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  }
}

export default asyncHandler;