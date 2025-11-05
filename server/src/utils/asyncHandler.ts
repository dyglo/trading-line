import type { NextFunction, Request, Response } from "express";

export const asyncHandler =
  <Req extends Request = Request, Res extends Response = Response>(
    handler: (req: Req, res: Res, next: NextFunction) => Promise<unknown>
  ) =>
  (req: Req, res: Res, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
