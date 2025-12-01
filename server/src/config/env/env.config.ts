import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ quiet: true });

/**
 * Zod schema defining structure and validation rules for environment variables
 * @property {number} PORT - Server port number (must be a positive integer, default 5000)
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
});

/**
 * Type representing validated environment configuration
 * Automatically inferred from the envSchema
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the defined schema
 *
 * This function parses process.env and ensures all required environment variables
 * are present and vallid according to the schema. If validation fails, it logs
 * detailed error messages and exists the process
 *
 * @returns Validated and type-safe environment configuration object
 * @throws Exits process with code 1 if validation fails
 */
function validateEnv(): Env {
  console.log("Validating environment...");
  try {
    const validated = envSchema.parse(process.env);
    console.info("All required environment variables are set and valid");
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Environment validation failed:");
      error.issues.forEach((issue) => {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      });
    } else {
      console.error("Unexpected error during environment validation", error);
    }
    process.exit(1);
  }
}

/**
 * Pre-validated environment configuration object
 *
 * This object is created at module load time and provides type-safe access
 * to validated environment variables throughout the application
 */
export const env = validateEnv();
