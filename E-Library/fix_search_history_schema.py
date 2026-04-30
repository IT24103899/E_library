import mysql.connector
from mysql.connector import Error

def fix_search_history_table():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Bharana@2004',
            database='elibrary_db'
        )
        
        cursor = connection.cursor()
        
        print("Fixing search_history table...")
        
        # Check current column size
        cursor.execute("DESC search_history")
        for row in cursor.fetchall():
            if row[0] == 'search_query':
                print(f"Current search_query column: {row[1]}")
        
        # Drop the old table and recreate it with correct schema
        print("\nDropping old search_history table...")
        cursor.execute("DROP TABLE IF EXISTS search_history")
        
        print("Creating new search_history table with correct schema...")
        create_table_sql = """
        CREATE TABLE search_history (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT NOT NULL,
          search_query VARCHAR(500) NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_deleted BOOLEAN DEFAULT FALSE,
          FOREIGN KEY (user_id) REFERENCES users(id),
          INDEX idx_user_id (user_id),
          INDEX idx_timestamp (timestamp),
          INDEX idx_user_timestamp (user_id, timestamp)
        )
        """
        cursor.execute(create_table_sql)
        connection.commit()
        print("✓ Table recreated successfully!")
        
        # Verify the fix
        cursor.execute("DESC search_history")
        print("\nNew table structure:")
        for row in cursor.fetchall():
            print(f"  {row[0]}: {row[1]}")
        
        cursor.close()
        connection.close()
        print("\n✓ Database schema fixed!")
        
    except Error as e:
        print(f"✗ Database error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    fix_search_history_table()
