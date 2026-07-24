import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:admin123@localhost:5432/postgres")
    try:
        conn = psycopg2.connect(db_url)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        cur.execute("SELECT 1 FROM pg_database WHERE datname='car'")
        exists = cur.fetchone()
        
        if not exists:
            print("Creating database 'car'...")
            cur.execute('CREATE DATABASE car')
            print("Database 'car' created successfully!")
        else:
            print("Database 'car' already exists.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
