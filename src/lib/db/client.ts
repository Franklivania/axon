import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "../config/env";
import * as schema from "./schema";

const sql = neon(config.database_url);
export const db = drizzle(sql, { schema });
