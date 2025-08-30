# VCoin Achievement System Documentation

## Overview

The VCoin Achievement System is a comprehensive gamification solution that rewards students for their learning progress and investment activities. It features automatic achievement unlocking, progress tracking, celebration UI, and background processing for time-sensitive achievements.

## Features

### ✨ Core Features
- **Automatic Achievement Unlocking**: Achievements trigger automatically based on student actions
- **Manual Achievement Granting**: Admins can award special achievements manually
- **Progress Tracking**: Visual progress indicators for multi-step achievements
- **Celebration UI**: Animated modals with confetti effects when achievements unlock
- **Background Processing**: Cron-based processing for time-sensitive achievements like streaks
- **Admin Management**: Complete admin interface for achievement oversight

### 🏆 Achievement Types

**Academic Achievements**
- First Steps (1 investment)
- Getting Started (5 investments)  
- Active Learner (10 investments)
- Scholar (25 investments)

**Consistency Achievements**
- On a Roll (3-day streak)
- Dedicated (7-day streak)
- Unstoppable (14-day streak)

**Milestone Achievements**
- Saver (10,000 VCoins)
- Investor (50,000 VCoins)
- Wealthy (100,000 VCoins)
- Millionaire (1,000,000 VCoins)

**Special Achievements**
- Teacher's Pet (manual award)
- Class Champion (manual award)

## Architecture

### Database Schema

```sql
-- Core achievement definitions
achievements (id, name, description, category, rarity, icon_config, trigger_type, trigger_config, points)

-- Student unlock tracking  
student_achievements (student_id, achievement_id, unlocked_at, seen, metadata)

-- Progress tracking for multi-step achievements
achievement_progress (student_id, achievement_id, current_value, last_updated)
```

### Backend Services

**AchievementEngine** (`/src/services/achievement-engine.ts`)
- Core achievement checking logic
- Metric calculation (investment count, total invested, streaks)
- Automatic and manual achievement unlocking
- Progress tracking

**AchievementRepository** (`/src/repos/achievement-repo.ts`)
- Database operations for achievements
- Student achievement management
- Progress tracking persistence

**BackgroundAchievementProcessor** (`/scripts/achievement-processor.ts`)
- Cron-based background processing
- Time-sensitive achievement validation
- Health monitoring and logging

### Frontend Components

**Achievement Celebration** (`/src/app/student/components/achievement-celebration.tsx`)
- Animated modal with confetti effect
- Achievement display with icon and details
- Auto-dismiss after 3 seconds

**Achievement Dashboard** (`/src/app/student/components/achievement-dashboard.tsx`)
- Complete achievement overview
- Progress indicators
- Category filtering
- Statistics display

**Admin Interface** (`/src/app/admin/achievements/`)
- Achievement management
- Manual award interface
- Background job monitoring
- Student progress oversight

## Background Processing

### Docker Integration

The system includes Docker integration for background processing:

```dockerfile
# Enhanced Dockerfile with cron support
FROM node:18-alpine
RUN apk add --no-cache curl tzdata bash

# Cron job setup
COPY crontab /etc/crontabs/root
RUN chmod 0644 /etc/crontabs/root
```

### Cron Schedule

```bash
# Every 5 minutes - Check new achievements
*/5 * * * * npm run achievement:check

# Daily at midnight - Validate streaks
0 0 * * * npm run achievement:daily  

# Weekly on Sunday at 2 AM - Generate summaries
0 2 * * 0 npm run achievement:weekly
```

### Background Job Monitoring

The admin interface includes real-time monitoring of background jobs:
- Last run times
- Success/error status
- Log file analysis
- Health check status

## Usage

### For Students

1. **Viewing Achievements**: Visit the student dashboard to see all achievements
2. **Progress Tracking**: Watch progress bars fill as you approach achievement goals
3. **Celebrations**: Enjoy animated celebrations when you unlock new achievements
4. **Categories**: Browse achievements by Academic, Consistency, Milestone, or Special

### For Admins

1. **Management**: Access `/admin/achievements` to manage the achievement system
2. **Manual Awards**: Grant special achievements to deserving students
3. **Monitoring**: View background job status and system health
4. **Analytics**: Review achievement statistics and student progress

### For Developers

1. **Testing**: Run `npm run test:achievements` to verify system functionality
2. **Background Jobs**: Use `npm run achievement:check` for manual processing
3. **Health Check**: Use `npm run achievement:check health` for system validation

## Configuration

### Achievement Configuration

Achievements are defined in the database with JSON configuration:

```sql
INSERT INTO achievements (name, description, category, rarity, icon_config, trigger_type, trigger_config, points) VALUES
('First Steps', 'Receive your first investment', 'academic', 'common', 
 '{"name": "Trophy", "library": "lucide", "size": 24, "color": "#10B981"}', 
 'automatic', '{"metric": "investment_count", "operator": ">=", "value": 1}', 10);
```

### Trigger Types

**Automatic Triggers**
- `investment_count`: Number of investments received
- `total_invested`: Total VCoins accumulated  
- `streak_days`: Consecutive days with investments
- `category_count`: Investments in specific categories

**Manual Triggers**
- Admin-awarded achievements
- Special recognition
- End-of-class awards

## Monitoring & Maintenance

### Log Files

```bash
/var/log/achievement.log         # Regular processing logs
/var/log/achievement-daily.log   # Daily streak validation
/var/log/achievement-weekly.log  # Weekly summaries
```

### Health Checks

The system includes comprehensive health monitoring:
- Database connectivity
- Achievement engine functionality  
- Background processor status
- Cron job execution

### Performance

- Achievement checking is non-blocking
- Background processing handles heavy operations
- Caching implemented for frequent database queries
- Progress tracking optimized for real-time updates

## Troubleshooting

### Common Issues

**Achievements Not Unlocking**
1. Check database connectivity
2. Verify trigger configuration  
3. Run manual achievement check
4. Review application logs

**Background Jobs Not Running**
1. Verify cron daemon is running in Docker
2. Check crontab configuration
3. Review log files for errors
4. Test manual execution

**UI Issues**
1. Check icon configuration
2. Verify celebration component loading
3. Test with different browser/device
4. Review console for JavaScript errors

### Testing Commands

```bash
# Test complete system
npm run test:achievements

# Test background processing
npm run achievement:check health

# Manual achievement processing  
npm run achievement:check all

# View system statistics
npm run test:achievements
```

## Security Considerations

- Manual achievements require admin authentication
- Background processing runs with limited privileges
- Achievement data is validated before storage
- SQL injection protection through parameterized queries
- XSS protection in achievement displays

## Future Enhancements

- Real-time achievement notifications via WebSocket
- Social sharing integration
- Achievement leaderboards
- Custom achievement creation UI
- Achievement import/export functionality
- Advanced analytics and reporting

## Support

For technical support or questions about the Achievement System:
1. Check this documentation
2. Review log files for errors
3. Run diagnostic tests
4. Contact the development team

---

**Achievement System Status**: ✅ Fully Operational  
**Last Updated**: July 26, 2025  
**Version**: 1.0.0
