import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// In production (CommonJS bundle), __dirname is available
// In development (ES modules), we need to calculate it
const getDirname = () => {
  // Production: CommonJS bundle has __dirname
  if (process.env.NODE_ENV === 'production') {
    // In production, the bundle is at dist/index.cjs, so public is at dist/public
    return path.resolve(process.cwd(), 'dist');
  }
  // Development: ES modules, __dirname not available
  // Server files are in server/, public will be in dist/public after build
  return path.resolve(process.cwd(), 'dist');
};

export function serveStatic(app: Express) {
  const dirname = getDirname();
  const distPath = path.resolve(dirname, "public");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
