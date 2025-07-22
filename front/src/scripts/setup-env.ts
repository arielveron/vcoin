#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { randomBytes } from 'crypto'
import { join } from 'path'

console.log('🔧 Setting up VCoin environment configuration...\n')

const envLocalPath = join(process.cwd(), '.env.local')
const envExamplePath = join(process.cwd(), '.env.example')

// Check if .env.local already exists
if (existsSync(envLocalPath)) {
  console.log('ℹ️  .env.local already exists')
  
  // Read current .env.local
  const currentEnv = readFileSync(envLocalPath, 'utf-8')
  
  // Check if AUTH_SECRET is missing
  if (!currentEnv.includes('AUTH_SECRET') && !currentEnv.includes('NEXTAUTH_SECRET')) {
    console.log('🔑 Adding missing AUTH_SECRET...')
    const authSecret = randomBytes(32).toString('hex')
    const newEnvContent = currentEnv + `\n# Generated AUTH_SECRET\nAUTH_SECRET=${authSecret}\n`
    writeFileSync(envLocalPath, newEnvContent)
    console.log('✅ AUTH_SECRET added to .env.local')
  } else {
    console.log('✅ AUTH_SECRET already configured')
  }
} else {
  // Create new .env.local from example
  if (existsSync(envExamplePath)) {
    console.log('📋 Creating .env.local from .env.example...')
    
    let envContent = readFileSync(envExamplePath, 'utf-8')
    
    // Generate AUTH_SECRET
    const authSecret = randomBytes(32).toString('hex')
    envContent = envContent.replace('your-auth-secret-here', authSecret)
    
    // Generate SESSION_SECRET
    const sessionSecret = randomBytes(32).toString('hex')
    envContent = envContent.replace('your-session-secret-key-change-in-production', sessionSecret)
    
    writeFileSync(envLocalPath, envContent)
    console.log('✅ .env.local created with generated secrets')
  } else {
    console.error('❌ .env.example not found!')
    process.exit(1)
  }
}

console.log('\n📝 Next steps:')
console.log('1. Configure your database settings in .env.local')
console.log('2. Set up Google OAuth credentials:')
console.log('   - GOOGLE_CLIENT_ID=your-client-id')
console.log('   - GOOGLE_CLIENT_SECRET=your-client-secret')
console.log('3. Run: npm run setup')
console.log('\nℹ️  For Google OAuth setup, visit: https://console.developers.google.com/')
