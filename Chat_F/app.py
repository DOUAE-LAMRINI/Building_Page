from flask import Flask, request, jsonify, render_template
import sqlite3
import os
import json
from datetime import datetime
from langdetect import detect  # For language detection

app = Flask(__name__, template_folder='templates', static_folder='static')

# Ensure the databases directory exists
os.makedirs('databases', exist_ok=True)

# Database setup
def init_db():
    conn = sqlite3.connect('databases/w_d_b.db')
    c = conn.cursor()

    # Create tables for logins, logouts, and feedback
    c.execute('''CREATE TABLE IF NOT EXISTS logins 
                 (house_number TEXT, username TEXT, email TEXT, login_time TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS logouts 
                 (house_number TEXT, username TEXT, email TEXT, logout_time TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS feedback 
                 (name TEXT, email TEXT, house_number TEXT, message TEXT, rating TEXT, timestamp TEXT)''')

    # Create chat history tables for each house
    for house_number in [1, 2, 3]:
        c.execute(f'''CREATE TABLE IF NOT EXISTS chat_history_{house_number} 
                     (username TEXT, message TEXT, timestamp TEXT)''')

    conn.commit()
    conn.close()

init_db()

# Load chatbot intents from JSON
def load_intents():
    try:
        with open('json/intent.json', 'r', encoding='utf-8') as file:
            intents = json.load(file)
            print("Intents loaded successfully:", intents)  # Debug statement
            return intents
    except Exception as e:
        print(f"Error loading intents: {e}")  # Debug statement
        return None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No data provided!"}), 400

        name = data.get('name')
        email = data.get('email')
        house_number = data.get('house_number')
        message = data.get('message')
        rating = data.get('rating')

        if not all([name, email, house_number, message, rating]):
            return jsonify({"status": "error", "message": "All fields are required!"}), 400

        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        conn = sqlite3.connect('databases/w_d_b.db')
        c = conn.cursor()
        c.execute(
            "INSERT INTO feedback (name, email, house_number, message, rating, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
            (name, email, house_number, message, rating, timestamp)
        )
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Feedback submitted successfully!"}), 200

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({"status": "error", "message": "Database error occurred!"}), 500

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "message": "An unexpected error occurred!"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        house_number = data.get('house_number')
        username = data.get('username')
        email = data.get('email')
        login_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Validate house number
        if house_number not in ['1', '2', '3']:
            return jsonify({"status": "error", "message": "Invalid house number!"}), 400

        conn = sqlite3.connect('databases/w_d_b.db')
        c = conn.cursor()
        c.execute(
            "INSERT INTO logins (house_number, username, email, login_time) VALUES (?, ?, ?, ?)",
            (house_number, username, email, login_time)
        )
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Login recorded successfully!"}), 200

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({"status": "error", "message": "Database error occurred!"}), 500

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "message": "An unexpected error occurred!"}), 500

@app.route('/logout', methods=['POST'])
def logout():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No data provided!"}), 400

        house_number = data.get('house_number')
        username = data.get('username')
        email = data.get('email')
        logout_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Validate all required fields
        if not all([house_number, username, email]):
            return jsonify({"status": "error", "message": "All fields are required!"}), 400

        conn = sqlite3.connect('databases/w_d_b.db')
        c = conn.cursor()
        c.execute(
            "INSERT INTO logouts (house_number, username, email, logout_time) VALUES (?, ?, ?, ?)",
            (house_number, username, email, logout_time)
        )
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "Logout recorded successfully!"}), 200

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({"status": "error", "message": "Database error occurred!"}), 500

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "message": "An unexpected error occurred!"}), 500

@app.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.get_json()
        house_number = data.get('house_number')
        username = data.get('username')
        message = data.get('message')
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Validate house number
        if house_number not in ['1', '2', '3']:
            return jsonify({"status": "error", "message": "Invalid house number!"}), 400

        # Load intents
        intents = load_intents()
        if not intents:
            return jsonify({"status": "error", "message": "Failed to load intents!"}), 500

        # Detect the language of the user's message
        try:
            language = detect(message)
        except:
            language = 'en'  # Default to English if detection fails

        # Map detected language to suffix
        if language == 'fr':
            lang_suffix = '_fr'
        elif language == 'ar':
            lang_suffix = '_ar'
        else:
            lang_suffix = '_en'  # Default to English

        # Find a matching intent
        response = "I'm sorry, I don't understand that."
        for intent in intents['intents']:
            if intent['tag'].endswith(lang_suffix):  # Match language suffix
                for pattern in intent['patterns']:
                    if pattern.lower() in message.lower():
                        response = intent['responses'][0]
                        break

        # Debug: Print the matched response
        print("User Message:", message)
        print("Detected Language:", language)
        print("Matched Response:", response)

        # Log the chat history in the corresponding house's table
        conn = sqlite3.connect('databases/w_d_b.db')
        c = conn.cursor()
        c.execute(
            f"INSERT INTO chat_history_{house_number} (username, message, timestamp) VALUES (?, ?, ?)",
            (username, message, timestamp)
        )
        conn.commit()
        conn.close()

        return jsonify({"response": response}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)