# Database Migration Guide

## Current Status
✅ **PostgreSQL Support Added!**

Your MeetingHunts application now supports both SQLite and PostgreSQL databases.

## What Changed

### 1. Database Configuration (`app/core/database.py`)
- Now reads `DATABASE_URL` from environment variables
- Auto-detects database type (SQLite vs PostgreSQL)
- Configures appropriate connection settings for each database type
- Added connection pooling for PostgreSQL (10 connections, 20 overflow)

### 2. Environment Configuration (`.env`)
- Added `DATABASE_URL` variable
- Included examples for PostgreSQL connection strings
- SQLite remains the default (no configuration needed)

### 3. Health Check Endpoint
- `/health` now shows which database is active
- Easy way to verify your configuration

## How to Use

### Stay with SQLite (Default)
**No changes needed!** Your app continues to use SQLite automatically.

### Switch to PostgreSQL

1. Install PostgreSQL or use Docker:
   ```bash
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
   ```

2. Create database:
   ```sql
   CREATE DATABASE meetinghunts;
   ```

3. Update `.env`:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/meet wise
   ```

4. Restart backend server - tables auto-create!

## Verify Your Setup

Visit: http://localhost:8000/health

**With SQLite:**
```json
{
  "status": "ok",
  "database": "SQLite"
}
```

**With PostgreSQL:**
```json
{
  "status": "ok",
  "database": "PostgreSQL"
}
```

## Files Created

- `POSTGRESQL.md` - Comprehensive PostgreSQL setup guide
- `DATABASE.md` - Database schema documentation

## Benefits of PostgreSQL

- ✅ Better concurrent user support
- ✅ Production-ready
- ✅ Connection pooling  
- ✅ Full ACID compliance
- ✅ Better for scaling

## Rollback

To go back to SQLite, simply remove or comment out `DATABASE_URL` in `.env`:

```env
# DATABASE_URL=postgresql://...
```

The app will automatically use SQLite again!

## Package Installed

- `psycopg2-binary` - PostgreSQL driver for Python

Your database models remain exactly the same - they work with both databases!
