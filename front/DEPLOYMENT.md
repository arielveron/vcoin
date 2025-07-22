# VCoin Production Deployment Guide

This guide explains how to securely deploy the VCoin application using Docker Compose with proper environment variable management.

## 🔐 Security Features

The updated Docker configuration includes several security enhancements:

- **Environment Variable Security**: Uses Docker secrets for sensitive data
- **Non-root Container**: Runs as a non-privileged user
- **Resource Limits**: Prevents resource exhaustion
- **Health Checks**: Monitors application health
- **Network Isolation**: Uses custom Docker networks
- **Security Options**: Implements `no-new-privileges` flag

## 📁 Files Overview

### Configuration Files

- `docker-compose.yml` - Development/basic production setup using .env.local
- `docker-compose.production.yml` - Enhanced production setup with Docker secrets
- `.env.example` - Template for development environment variables
- `.env.production.template` - Template for production environment variables
- `SECURITY.md` - Comprehensive security guidelines

### Setup Scripts

- `setup-production.sh` - Bash script for Linux/macOS deployment setup
- `setup-production.ps1` - PowerShell script for Windows deployment setup

## 🚀 Deployment Options

### Option 1: Basic Production (Environment Variables)

For simpler deployments where external secret management isn't available:

1. **Create production environment file:**
   ```bash
   cp .env.production.template .env.local
   ```

2. **Edit the environment file with your production values:**
   ```bash
   # Use a secure editor
   nano .env.local
   ```

3. **Deploy the application:**
   ```bash
   docker-compose up -d
   ```

### Option 2: Enhanced Production (Docker Secrets)

For maximum security using Docker Swarm secrets:

1. **Initialize Docker Swarm (if not already done):**
   ```bash
   docker swarm init
   ```

2. **Run the setup script:**
   
   **Linux/macOS:**
   ```bash
   chmod +x setup-production.sh
   ./setup-production.sh
   ```
   
   **Windows:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\setup-production.ps1
   ```

3. **Deploy with production configuration:**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

## 🔑 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database server hostname | `db.yourdomain.com` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `vcoin` |
| `DB_USER` | Database username | `vcoin` |
| `DB_PASSWORD` | Database password | `secure-password` |
| `NEXTAUTH_SECRET` | NextAuth.js encryption key | `64-char-random-string` |
| `NEXTAUTH_URL` | Your application URL | `https://yourdomain.com` |
| `SESSION_SECRET` | Student session encryption | `64-char-random-string` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `your-client-secret` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOGIN_THROTTLE_MIN_DELAY` | Min delay for failed logins (ms) | `1000` |
| `LOGIN_THROTTLE_MAX_DELAY` | Max delay for failed logins (ms) | `30000` |
| `LOGIN_THROTTLE_MAX_TRACKED` | Max tracked failed attempts | `10000` |

## 🔧 Production Checklist

### Before Deployment

- [ ] **Generate secure secrets** (minimum 64 characters for auth secrets)
- [ ] **Configure production database** with proper security
- [ ] **Set up domain and SSL certificates**
- [ ] **Configure Google OAuth** for your production domain
- [ ] **Review security settings** in SECURITY.md
- [ ] **Test application** in staging environment

### Security Verification

- [ ] **Verify .env files are not committed** to version control
- [ ] **Check file permissions** on environment files (600)
- [ ] **Validate SSL/TLS configuration**
- [ ] **Test OAuth flow** with production domain
- [ ] **Verify database connections** are encrypted
- [ ] **Test health check endpoint** (`/api/health`)

### Post-Deployment

- [ ] **Monitor application logs**
- [ ] **Set up monitoring and alerting**
- [ ] **Configure log rotation**
- [ ] **Test backup and recovery procedures**
- [ ] **Verify security headers**

## 📊 Monitoring and Maintenance

### Health Check

The application includes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2025-07-22T10:00:00.000Z",
  "service": "vcoin-front",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600
}
```

### Useful Commands

```bash
# Check application status
docker-compose -f docker-compose.production.yml ps

# View application logs
docker-compose -f docker-compose.production.yml logs -f

# Restart the application
docker-compose -f docker-compose.production.yml restart

# Update the application
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Check Docker secrets
docker secret ls

# Remove a secret (will require application restart)
docker secret rm vcoin_db_password
```

## 🔍 Troubleshooting

### Common Issues

1. **Container fails to start:**
   - Check Docker logs: `docker-compose logs vcoin-front`
   - Verify all required environment variables are set
   - Check file permissions on mounted volumes

2. **Database connection issues:**
   - Verify database host and port are accessible
   - Check database credentials
   - Ensure database allows connections from Docker network

3. **OAuth authentication fails:**
   - Verify Google OAuth configuration
   - Check redirect URLs match your domain
   - Ensure NEXTAUTH_URL is correctly set

4. **Health check fails:**
   - Check if the application is responding on port 3000
   - Verify the health endpoint is accessible
   - Check application logs for errors

### Debug Mode

To run with debug logging:

```bash
# Add debug environment variable
echo "DEBUG=1" >> .env.local
docker-compose restart
```

## 🛡️ Security Best Practices

1. **Use external secret management** for production (AWS Secrets Manager, Azure Key Vault, etc.)
2. **Regularly rotate secrets** and passwords
3. **Monitor failed authentication attempts**
4. **Keep Docker images updated**
5. **Use HTTPS only** for all external communications
6. **Implement proper network segmentation**
7. **Regular security audits** and vulnerability scanning

For detailed security guidelines, see [SECURITY.md](./SECURITY.md).

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Secrets Documentation](https://docs.docker.com/engine/swarm/secrets/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
