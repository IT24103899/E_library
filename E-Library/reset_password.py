import mysql.connector
from mysql.connector import Error
import bcrypt

def reset_password():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Bharana@2004',
            database='elibrary_db'
        )
        
        cursor = connection.cursor()
        
        # Generate BCrypt hash for "test123"
        test_password = "test123"
        hashed_password = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
        
        # Update Heshan's password
        cursor.execute(
            "UPDATE users SET password = %s WHERE email = %s",
            (hashed_password.decode('utf-8'), 'Heshan@gmail.com')
        )
        
        connection.commit()
        
        print(f"✓ Password reset for Heshan@gmail.com")
        print(f"  New password: {test_password}")
        
        cursor.close()
        connection.close()
        
    except Error as e:
        print(f"✗ Database error: {e}")

if __name__ == "__main__":
    reset_password()
