# Production Deployment Script for VCoin (Windows PowerShell)
# This script helps set up Docker secrets for secure production deployment

param(
    [switch]$Force = $false
)

Write-Host "🔐 VCoin Production Deployment - Setting up Docker Secrets" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if Docker Swarm is initialized
try {
    docker node ls | Out-Null
    Write-Host "✅ Docker Swarm is initialized" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker Swarm is not initialized. Initializing..." -ForegroundColor Yellow
    docker swarm init
    Write-Host "✅ Docker Swarm initialized" -ForegroundColor Green
}

# Function to create secret from user input
function Create-Secret {
    param(
        [string]$SecretName,
        [string]$PromptText,
        [bool]$IsPassword = $false
    )
    
    Write-Host ""
    Write-Host "📝 Setting up: $SecretName" -ForegroundColor Blue
    
    # Check if secret already exists
    try {
        docker secret inspect $SecretName | Out-Null
        if (-not $Force) {
            $confirm = Read-Host "⚠️  Secret '$SecretName' already exists. Do you want to remove and recreate it? (y/N)"
            if ($confirm -notmatch "^[Yy]$") {
                Write-Host "⏭️  Skipping $SecretName" -ForegroundColor Yellow
                return
            }
        }
        docker secret rm $SecretName | Out-Null
        Write-Host "🗑️  Removed existing secret" -ForegroundColor Yellow
    } catch {
        # Secret doesn't exist, which is fine
    }
    
    if ($IsPassword) {
        $secureValue = Read-Host "$PromptText" -AsSecureString
        $secretValue = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue))
    } else {
        $secretValue = Read-Host "$PromptText"
    }
    
    if ([string]::IsNullOrWhiteSpace($secretValue)) {
        Write-Host "❌ Value cannot be empty. Skipping $SecretName" -ForegroundColor Red
        return
    }
    
    $secretValue | docker secret create $SecretName -
    Write-Host "✅ Created secret: $SecretName" -ForegroundColor Green
}

# Function to generate random secret
function Generate-Secret {
    param(
        [string]$SecretName,
        [string]$Description
    )
    
    Write-Host ""
    Write-Host "🔑 Generating random secret: $SecretName" -ForegroundColor Blue
    
    # Check if secret already exists
    try {
        docker secret inspect $SecretName | Out-Null
        if (-not $Force) {
            Write-Host "⚠️  Secret '$SecretName' already exists. Skipping generation." -ForegroundColor Yellow
            return
        } else {
            docker secret rm $SecretName | Out-Null
            Write-Host "🗑️  Removed existing secret" -ForegroundColor Yellow
        }
    } catch {
        # Secret doesn't exist, which is fine
    }
    
    # Generate 64-character random secret
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    $secretValue = [System.Convert]::ToHexString($bytes).ToLower()
    
    $secretValue | docker secret create $SecretName -
    Write-Host "✅ Generated and created secret: $SecretName" -ForegroundColor Green
    Write-Host "ℹ️  $Description" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "This script will help you set up Docker secrets for production deployment."
Write-Host "You'll be prompted to enter values for each secret."
Write-Host ""

# Create secrets
Create-Secret -SecretName "vcoin_db_host" -PromptText "Database host (e.g., db.yourdomain.com)" -IsPassword $false
Create-Secret -SecretName "vcoin_db_user" -PromptText "Database username" -IsPassword $false
Create-Secret -SecretName "vcoin_db_password" -PromptText "Database password" -IsPassword $true

Write-Host ""
Write-Host "For the following secrets, you can generate random values or provide your own:"

# Generate or create authentication secrets
Write-Host ""
Write-Host "🔐 NextAuth Secret (should be at least 64 characters)" -ForegroundColor Blue
$generateNextAuth = Read-Host "Would you like to generate a random NextAuth secret? (Y/n)"
if ($generateNextAuth -notmatch "^[Nn]$") {
    Generate-Secret -SecretName "vcoin_nextauth_secret" -Description "This is used by NextAuth.js for encryption"
} else {
    Create-Secret -SecretName "vcoin_nextauth_secret" -PromptText "NextAuth secret (minimum 64 characters)" -IsPassword $true
}

Write-Host ""
Write-Host "🔐 Session Secret (should be at least 64 characters)" -ForegroundColor Blue
$generateSession = Read-Host "Would you like to generate a random session secret? (Y/n)"
if ($generateSession -notmatch "^[Nn]$") {
    Generate-Secret -SecretName "vcoin_session_secret" -Description "This is used for student session encryption"
} else {
    Create-Secret -SecretName "vcoin_session_secret" -PromptText "Session secret (minimum 64 characters)" -IsPassword $true
}

# OAuth secrets
Create-Secret -SecretName "vcoin_google_client_id" -PromptText "Google OAuth Client ID" -IsPassword $false
Create-Secret -SecretName "vcoin_google_client_secret" -PromptText "Google OAuth Client Secret" -IsPassword $true

Write-Host ""
Write-Host "🎉 Docker secrets setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Created secrets:" -ForegroundColor Cyan
docker secret ls | Where-Object { $_ -match "vcoin" }

Write-Host ""
Write-Host "🚀 To deploy your application, run:" -ForegroundColor Green
Write-Host "   docker-compose -f docker-compose.production.yml up -d" -ForegroundColor White
Write-Host ""
Write-Host "📊 To check the status:" -ForegroundColor Green
Write-Host "   docker-compose -f docker-compose.production.yml ps" -ForegroundColor White
Write-Host ""
Write-Host "🔍 To view logs:" -ForegroundColor Green
Write-Host "   docker-compose -f docker-compose.production.yml logs -f" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Remember to:" -ForegroundColor Yellow
Write-Host "   - Set up proper DNS for your domain" -ForegroundColor White
Write-Host "   - Configure SSL/TLS certificates" -ForegroundColor White
Write-Host "   - Set up monitoring and backups" -ForegroundColor White
Write-Host "   - Review the SECURITY.md file for additional security measures" -ForegroundColor White
