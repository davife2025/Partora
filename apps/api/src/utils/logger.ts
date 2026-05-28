import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level    = res.statusCode >= 500 ? "error"
                   : res.statusCode >= 400 ? "warn"
                   : "info";

    console[level](
      `${req.method} ${req.path} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}
