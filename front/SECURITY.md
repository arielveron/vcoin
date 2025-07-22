# Security Guidelines for VCoin Production Deployment

## Environment Variables Security

### 1. File Permissions and Access
- Ensure `.env.local` has restricted permissions: `chmod 600 .env.local`
- Only the application user should be able to read environment files
- Never commit `.env.local` or production environment files to version control

### 2. Secret Management Best Practices

#### For Production Deployment:
1. **Use External Secret Management**:
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - Kubernetes Secrets (if using K8s)

2. **Docker Secrets** (for Docker Swarm):
   ```yaml
   services:
     vcoin-front:
       secrets:
         - db_password
         - nextauth_secret
         - session_secret
         - google_client_secret
   secrets:
     db_password:
       external: true
     nextauth_secret:
       external: true
   ```

3. **Environment Variable Injection at Runtime**:
   - Use CI/CD pipelines to inject secrets
   - Never store secrets in Docker images
   - Use build-time secrets vs runtime secrets appropriately

### 3. Network Security
- Use internal networks for database connections
- Implement proper firewall rules
- Use TLS/SSL for all external communications

### 4. Container Security
- Run containers as non-root user (already configured)
- Use security options like `no-new-privileges`
- Regularly update base images
- Scan images for vulnerabilities

### 5. Monitoring and Logging
- Monitor failed authentication attempts
- Log security events
- Set up alerts for suspicious activities
- Use structured logging with proper log levels

### 6. Database Security
- Use connection pooling
- Implement proper database user permissions
- Use SSL connections to database
- Regular database security audits

## Deployment Checklist

### Before Production:
- [ ] Replace all default secrets with strong, unique values
- [ ] Verify NEXTAUTH_SECRET is at least 64 characters
- [ ] Confirm HTTPS is properly configured
- [ ] Test OAuth2 configuration with production domain
- [ ] Verify database connections are encrypted
- [ ] Check all CORS and security headers
- [ ] Test login throttling is working
- [ ] Ensure proper backup strategies are in place

### Production Deployment:
- [ ] Use external secret management
- [ ] Configure proper monitoring
- [ ] Set up log aggregation
- [ ] Implement health checks
- [ ] Configure auto-scaling if needed
- [ ] Set up proper CI/CD with security scanning
