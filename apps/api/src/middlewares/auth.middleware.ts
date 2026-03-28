import { Request, Response, NextFunction } from "express";
import { auth } from "../auth";

/**
 * Middleware untuk memastikan pengguna sudah login
 * Ini membaca headers / cookies dari request dan memvalidasi ke auth session.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized. Harap login terlebih dahulu." });
    }

    // Simpan informasi user di dalam req agar bisa dipakai di endpoints selanjutnya
    (req as any).user = session.user;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};
