#!/usr/bin/env node
/**
 * Generate JWT secrets for environment variables
 * Run this script to generate secure random secrets for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
 * Usage: npm run generate-secrets
 */

import crypto from 'crypto';

const accessSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');

console.log('\n=== Generated JWT Secrets ===\n');
console.log('Add these to your .env file:\n');
console.log(`JWT_ACCESS_SECRET=${accessSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log('\n================================\n');
console.log('\nIMPORTANT: Keep these secrets secure and never commit them to version control!\n');

