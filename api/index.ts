/**
 * Vercel Serverless Function entry point.
 * Exports the Express app from server.ts as the default handler.
 *
 * When this module is imported, server.ts executes at module scope:
 * - dotenv.config() loads environment variables
 * - Express app is created with all middleware and routes
 * - Hybrid retriever embeddings are initialized (async, best-effort)
 * - startServer() is SKIPPED because process.env.VERCEL is set by Vercel
 *
 * The Vite SPA is pre-built to dist/ by the build step and served
 * as static assets via vercel.json output configuration.
 */

import { app as expressApp } from '../server.js';

export default expressApp;
