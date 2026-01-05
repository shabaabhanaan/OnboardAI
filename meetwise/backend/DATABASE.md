# MeetingHunts Database Setup

## Overview
MeetingHunts now uses **SQLite** with **SQLAlchemy ORM** for persistent data storage. All user data and meetings are saved to a database file.

## Database File
- **Location**: `meetwise/backend/meetinghunts.db`
- **Type**: SQLite (single file database)
- **Auto-created**: Yes, on first server startup

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    plan VARCHAR DEFAULT 'free',  -- free, pro, team
    meetings_this_month INTEGER DEFAULT 0,
    last_reset DATETIME,
    created_at DATETIME
);
```

### Meetings Table
```sql
CREATE TABLE meetings (
    id VARCHAR PRIMARY KEY,  -- UUID
    title VARCHAR NOT NULL,
    notes TEXT NOT NULL,
    summary TEXT,
    key_points JSON,  -- Array of strings
    action_items JSON,  -- Array of objects
    created_at DATETIME,
    user_id INTEGER FOREIGN KEY REFERENCES users(id)
);
```

## Features

### Data Persistence
✅ Data survives server restarts  
✅ Automatic table creation on startup  
✅ No manual database setup required  

### Relationships
- One user can have many meetings
- Meetings are linked to their owner
- Cascading deletes (deleting user deletes their meetings)

### Indexes
- Email (unique index for fast lookups)
- User ID (foreign key index)
- Meeting ID (primary key)

## Plan Limits Enforced

### Free Plan
- 5 meetings per month
- Counter resets automatically each month
- Enforced at API level

### Pro & Team Plans
- Unlimited meetings
- No restrictions

## Migration from In-Memory

The application has been fully migrated from in-memory dictionaries to SQLAlchemy:

**Before (In-Memory)**:
```python
users_db = {}
meetings_db = {}
```

**After (Database)**:
```python
db.query(User).filter(User.email == email).first()
db.query(Meeting).filter(Meeting.user_id == user_id).all()
```

## Backup & Reset

### Backup Database
```bash
# Copy the database file
cp meetwise/backend/meetinghunts.db meetwise/backend/meetinghunts_backup.db
```

### Reset Database
```bash
# Delete database file (will be recreated on next startup)
rm meetwise/backend/meetinghunts.db
```

### View Database
```bash
# Use SQLite CLI
sqlite3 meetwise/backend/meetinghunts.db

# Show tables
.tables

# View users
SELECT * FROM users;

# View meetings
SELECT * FROM meetings;
```

## Production Considerations

For production deployment, consider:

1. **PostgreSQL**: Replace SQLite with PostgreSQL for better concurrency
2. **Migrations**: Use Alembic for database migrations
3. **Backup Strategy**: Automated backups of database
4. **Connection Pooling**: Configure SQLAlchemy pool size
5. **Read Replicas**: For high-traffic scenarios

## Environment Variables

No additional environment variables needed for SQLite. The database is created automatically.

For PostgreSQL (future):
```env
DATABASE_URL=postgresql://user:password@localhost/meetinghunts
```
