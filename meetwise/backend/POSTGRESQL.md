# PostgreSQL Setup Guide for MeetingHunts

This guide explains how to configure MeetingHunts to use PostgreSQL instead of SQLite.

## Why PostgreSQL?
SQLite is excellent for development and light usage, but MeetingHunts uses PostgreSQL in production for:
1. **Concurrency**: Better handling of multiple simultaneous AI processing tasks.
2. **Reliability**: Robust data management for user accounts and meeting histories.
3. **Scalability**: Capable of handling millions of meeting records.

## Local Setup

### 1. Install PostgreSQL
Download and install PostgreSQL for your OS.

### 2. Create Database
Open `pgAdmin` or use the command line:
```sql
   CREATE DATABASE meetinghunts;
```

### 3. Configure Environment
Update your `.env` file in `meetinghunts/backend/`:
```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/meetinghunts
```

## Connection Strings

```
postgresql://username:password@host:port/database_name
```

### Examples

**Local PostgreSQL:**
```
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/meetinghunts
```

**Docker PostgreSQL:**
```
DATABASE_URL=postgresql://postgres:password@db:5432/meetinghunts
```

**Cloud PostgreSQL (Heroku, AWS RDS, etc):**
```
DATABASE_URL=postgresql://user:pass@host.region.rds.amazonaws.com:5432/meetinghunts
```

**With SSL (required for some cloud providers):**
```
DATABASE_URL=postgresql://user:pass@host:5432/meetinghunts?sslmode=require
```

## Docker Compose Example

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/meetinghunts
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: meetinghunts
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Migration Instructions

If you have data in SQLite and want to move to PostgreSQL:
1. Run the backend once with PostgreSQL to create the tables.
2. Use an ETL tool or manual SQL exports to move data.

## Environment Variable Reference

| Variable | Default (SQLite) | Production (PostgreSQL) |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./meetinghunts.db` | Full database connection string |

## Connection Pool Settings

When using PostgreSQL, the following pool settings are configured:

```python
pool_size=10          # Persistent connections
max_overflow=20       # Additional connections when needed
pool_pre_ping=True    # Verify connections before use
```

## Verification
You can verify the connection by hitting the `/api/health` or `/` endpoint:
```json
{
  "status": "ok",
  "message": "MeetWise API is running with database.",
  "version": "2.0.0",
  "database": "PostgreSQL"  // or "SQLite"
}
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `pg_isready`
- Check port is correct (default 5432)
- Verify host is accessible

### Authentication Failed
- Check username and password in DATABASE_URL
- Verify user has permissions: `GRANT ALL ON DATABASE meetwise TO postgres;`

### Database Not Found
- Create the database: `CREATE DATABASE meetwise;`
- Or use psql: `psql -U postgres -c "CREATE DATABASE meetwise;"`

### SSL Error
- Add `?sslmode=disable` for local development
- Use `?sslmode=require` for production cloud databases

## Migration from SQLite

To migrate existing SQLite data to PostgreSQL:

1. **Export from SQLite**
   ```bash
   sqlite3 meetwise.db .dump > backup.sql
   ```

2. **Import to PostgreSQL**
   ```bash
   psql -U postgres -d meetwise -f backup.sql
   ```

3. **Update .env and restart**

## Best Practices

1. **Use Environment Variables**: Never hardcode database credentials
2. **Enable SSL**: For production deployments
3. **Regular Backups**: Use `pg_dump` for PostgreSQL backups
4. **Monitor Connections**: Watch connection pool usage
5. **Use Connection Limits**: Set appropriate `pool_size` for your load

## Production Deployment

For production:

1. Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
2. Enable SSL/TLS connections
3. Use connection pooling (already configured)
4. Set up automated backups
5. Monitor query performance
6. Use read replicas for high traffic

## Development vs Production

**Development (SQLite)**:
```
DATABASE_URL=sqlite:///./meetwise.db
```

**Production (PostgreSQL)**:
```
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/meetwise?sslmode=require
```

The application automatically detects and configures the appropriate settings!
