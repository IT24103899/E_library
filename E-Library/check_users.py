import mysql.connector
from mysql.connector import Error

def check_users():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Bharana@2004',
            database='elibrary_db'
        )
        
        cursor = connection.cursor()
        
        # Get all users
        cursor.execute("SELECT id, email, full_name FROM users LIMIT 20")
        users = cursor.fetchall()
        
        print(f"✓ Users in database ({len(users)} found):")
        for user in users:
            print(f"  ID: {user[0]}, Email: {user[1]}, Name: {user[2]}")
        
        if not users:
            print("✗ No users found in database!")
            print("\nInserting default user...")
            cursor.execute("""
                INSERT INTO users (id, email, full_name, password, reading_preference, role) 
                VALUES (1, 'test@elibrary.com', 'Test User', 'password123', 'Fiction', 'USER')
            """)
            connection.commit()
            print("✓ Default user created with ID 1")
        
        cursor.close()
        connection.close()
        
    except Error as e:
        print(f"✗ Database error: {e}")

if __name__ == "__main__":
    check_users()
