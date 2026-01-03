
from sqlalchemy import create_engine, text, inspect
from app.core.database import DATABASE_URL
import sys

# Force psycopg2 for postgres (default driver)
# But wait, app might be using something else?
# DATABASE_URL in .env is postgresql://...
# create_engine handles it.

try:
    engine = create_engine(DATABASE_URL)
    connection = engine.connect()
    print("Database connected.")
except Exception as e:
    print(f"Database connection failed: {e}")
    sys.exit(1)

inspector = inspect(engine)
columns = inspector.get_columns('users')
col_names = [c['name'] for c in columns]
print(f"Current User columns: {col_names}")

required = ['plan', 'meetings_this_month', 'last_reset']
missing = [r for r in required if r not in col_names]

if missing:
    print(f"Missing columns: {missing}")
    # Fix it
    with engine.begin() as conn:
        for col in missing:
            print(f"Adding column {col}...")
            if col == 'plan':
                conn.execute(text("ALTER TABLE users ADD COLUMN plan VARCHAR DEFAULT 'free'"))
            elif col == 'meetings_this_month':
                conn.execute(text("ALTER TABLE users ADD COLUMN meetings_this_month INTEGER DEFAULT 0"))
            elif col == 'last_reset':
                conn.execute(text("ALTER TABLE users ADD COLUMN last_reset TIMESTAMP DEFAULT NOW()"))
    print("Schema updated.")
else:
    print("Schema is up to date.")
