import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const headerKey = "x-correlation-id";
  const id = (req.headers[headerKey] as string) || uuidv4();
  (req as any).correlationId = id;
  res.setHeader(headerKey, id);
  next();
}
