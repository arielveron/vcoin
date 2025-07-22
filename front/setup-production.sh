#!/bin/bash

# Production Deployment Script for VCoin
# This script helps set up Docker secrets for secure production deployment

set -e

echo "🔐 VCoin Production Deployment - Setting up Docker Secrets"
echo "==========================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Swarm is initialized
if ! docker node ls > /dev/null 2>&1; then
    echo "⚠️  Docker Swarm is not initialized. Initializing..."
    docker swarm init
    echo "✅ Docker Swarm initialized"
fi

# Function to create secret from user input
create_secret() {
    local secret_name=$1
    local prompt_text=$2
    local is_password=$3
    
    echo ""
    echo "📝 Setting up: $secret_name"
    
    if docker secret inspect $secret_name > /dev/null 2>&1; then
        echo "⚠️  Secret '$secret_name' already exists. Do you want to remove and recreate it? (y/N)"
        read -r confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            docker secret rm $secret_name
            echo "🗑️  Removed existing secret"
        else
            echo "⏭️  Skipping $secret_name"
            return
        fi
    fi
    
    if [[ $is_password == "true" ]]; then
        echo -n "$prompt_text: "
        read -s secret_value
        echo ""
    else
        echo -n "$prompt_text: "
        read -r secret_value
    fi
    
    if [[ -z "$secret_value" ]]; then
        echo "❌ Value cannot be empty. Skipping $secret_name"
        return
    fi
    
    echo "$secret_value" | docker secret create $secret_name -
    echo "✅ Created secret: $secret_name"
}

# Function to generate random secret
generate_secret() {
    local secret_name=$1
    local description=$2
    
    echo ""
    echo "🔑 Generating random secret: $secret_name"
    
    if docker secret inspect $secret_name > /dev/null 2>&1; then
        echo "⚠️  Secret '$secret_name' already exists. Skipping generation."
        return
    fi
    
    # Generate 64-character random secret
    secret_value=$(openssl rand -hex 32)
    echo "$secret_value" | docker secret create $secret_name -
    echo "✅ Generated and created secret: $secret_name"
    echo "ℹ️  $description"
}

echo ""
echo "This script will help you set up Docker secrets for production deployment."
echo "You'll be prompted to enter values for each secret."
echo ""

# Create secrets
create_secret "vcoin_db_host" "Database host (e.g., db.yourdomain.com)" false
create_secret "vcoin_db_user" "Database username" false
create_secret "vcoin_db_password" "Database password" true

echo ""
echo "For the following secrets, you can generate random values or provide your own:"

# Generate or create authentication secrets
echo ""
echo "🔐 NextAuth Secret (should be at least 64 characters)"
echo "Would you like to generate a random NextAuth secret? (Y/n)"
read -r generate_nextauth
if [[ ! $generate_nextauth =~ ^[Nn]$ ]]; then
    generate_secret "vcoin_nextauth_secret" "This is used by NextAuth.js for encryption"
else
    create_secret "vcoin_nextauth_secret" "NextAuth secret (minimum 64 characters)" true
fi

echo ""
echo "🔐 Session Secret (should be at least 64 characters)"
echo "Would you like to generate a random session secret? (Y/n)"
read -r generate_session
if [[ ! $generate_session =~ ^[Nn]$ ]]; then
    generate_secret "vcoin_session_secret" "This is used for student session encryption"
else
    create_secret "vcoin_session_secret" "Session secret (minimum 64 characters)" true
fi

# OAuth secrets
create_secret "vcoin_google_client_id" "Google OAuth Client ID" false
create_secret "vcoin_google_client_secret" "Google OAuth Client Secret" true

echo ""
echo "🎉 Docker secrets setup complete!"
echo ""
echo "📋 Created secrets:"
docker secret ls | grep vcoin

echo ""
echo "🚀 To deploy your application, run:"
echo "   docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "📊 To check the status:"
echo "   docker-compose -f docker-compose.production.yml ps"
echo ""
echo "🔍 To view logs:"
echo "   docker-compose -f docker-compose.production.yml logs -f"
echo ""
echo "⚠️  Remember to:"
echo "   - Set up proper DNS for your domain"
echo "   - Configure SSL/TLS certificates"
echo "   - Set up monitoring and backups"
echo "   - Review the SECURITY.md file for additional security measures"
