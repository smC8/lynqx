import { Request, Response, NextFunction } from "express";
import { CanonicalError } from "./CanonicalError";

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  // If already canonical
  let canonical: CanonicalError;

  if (err && err.isCanonicalError) {
    canonical = err as CanonicalError & { isCanonicalError: true };
  } else {
    // Fallback
    canonical = {
      name: "", // TODO -  Fix this placeholder name
      code: "ERR_INTERNAL",
      message: err?.message ?? "Internal server error",
      httpStatus: err?.status || 500,
      details: { stack: process.env.NODE_ENV === "development" ? err?.stack : undefined },
    };
  }

  const status = canonical.httpStatus || 500;
  res.status(status).json({
    error: {
      code: canonical.code,
      message: canonical.message,
      provider: canonical.provider,
      details: canonical.details,
    },
    correlationId: (req as any).correlationId,
  });
}
