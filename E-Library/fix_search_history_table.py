import mysql.connector
from mysql.connector import Error

def check_and_create_search_history():
    try:
        # Connect to MySQL
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Bharana@2004',
            database='elibrary_db'
        )
        
        cursor = connection.cursor()
        
        # Check if table exists
        cursor.execute("SHOW TABLES LIKE 'search_history'")
        result = cursor.fetchone()
        
        if result:
            print("✓ search_history table already exists")
            # Show table structure
            cursor.execute("DESC search_history")
            print("\nTable structure:")
            for row in cursor.fetchall():
                print(f"  {row}")
        else:
            print("✗ search_history table does NOT exist, creating it...")
            
            # Create the table
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
            print("✓ search_history table created successfully!")
            
            # Verify
            cursor.execute("DESC search_history")
            print("\nTable structure:")
            for row in cursor.fetchall():
                print(f"  {row}")
        
        cursor.close()
        connection.close()
        print("\n✓ Database check complete!")
        
    except Error as e:
        print(f"✗ Database error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    check_and_create_search_history()
