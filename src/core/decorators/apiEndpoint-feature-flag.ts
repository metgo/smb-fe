import * as dotenv from 'dotenv';
import * as fs from 'fs';

export function permissionsRequiredIsEnabled(): boolean {
  // Check if the 'local.env' file exists, and load it if it does
  if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' });
  } else if (fs.existsSync('local.env')) {
    dotenv.config({ path: 'local.env' });
  } else {
    // If neither file exists, print a warning

    /** @NOTE Make sure the .env filename for prod is added as a conditional!!! */

    console.warn("No .env file found. Make sure to have either '.env' or 'local.env'.");
    return false;
  }

  // Check if the current environment is 'development'
  const isDevelopment = process.env?.NODE_ENV === 'development';

  // Enable the feature if the environment is 'development'
  return isDevelopment;
}
