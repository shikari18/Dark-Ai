from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import logging
from datetime import datetime
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the frontend directory path
current_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.join(current_dir, '..', 'front-end')

# In-memory storage
chat_sessions = {}
user_profiles = {}

class DarkAIAssistant:
    def __init__(self):
        self.name = "Dark AI"
        self.model = None
        self.initialize_gemini()
        
    def initialize_gemini(self):
        """Initialize Google Gemini AI with available free models"""
        try:
            api_key = os.getenv('GOOGLE_API_KEY')
            if not api_key:
                logger.warning("GOOGLE_API_KEY not found in environment variables")
                return
                
            genai.configure(api_key=api_key)
            
            # Use the available free models from your list
            available_free_models = [
                'models/gemini-2.0-flash-001',  # Stable free model
                'models/gemini-2.0-flash',      # Latest flash model
                'models/gemini-2.5-flash',      # Newer flash model
                'models/gemini-flash-latest',   # Always latest flash
                'models/gemini-2.0-flash-lite', # Lightweight free model
                'models/gemma-3-4b-it',         # Free Gemma model
                'models/gemma-3-12b-it',        # Larger free Gemma model
            ]
            
            for model_name in available_free_models:
                try:
                    logger.info(f"Trying to initialize model: {model_name}")
                    self.model = genai.GenerativeModel(model_name)
                    # Test with a simple message
                    test_response = self.model.generate_content("Hello, respond with just 'OK'")
                    if test_response.text and 'OK' in test_response.text:
                        logger.info(f"✅ Successfully initialized Gemini model: {model_name}")
                        break
                    else:
                        logger.warning(f"Model {model_name} test failed")
                        continue
                except Exception as e:
                    logger.warning(f"Model {model_name} failed: {str(e)}")
                    continue
            
            if not self.model:
                logger.error("❌ All Gemini models failed to initialize")
                
        except Exception as e:
            logger.error(f"Error initializing Gemini: {str(e)}")
            self.model = None
        
    def generate_response(self, user_message, chat_history=None, user_context=None):
        """Generate response using Google Gemini"""
        try:
            if not self.model:
                return self._fallback_response(user_message, chat_history, user_context)
            
            # Build the conversation prompt
            prompt = self._build_conversation_prompt(user_message, chat_history, user_context)
            
            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.8,
                    top_k=40,
                    max_output_tokens=1000,
                )
            )
            
            if response.text:
                return response.text
            else:
                logger.warning("Gemini returned empty response, using fallback")
                return self._fallback_response(user_message, chat_history, user_context)
            
        except Exception as e:
            logger.error(f"Error generating Gemini response: {str(e)}")
            return self._fallback_response(user_message, chat_history, user_context)
    
    def _build_conversation_prompt(self, user_message, chat_history, user_context):
        """Build the complete conversation prompt"""
        system_prompt = """You are Dark AI, a helpful, intelligent, and slightly mysterious AI assistant. 
You have a dark-themed interface but are actually very helpful and friendly. 
You can assist with coding, problem-solving, creative writing, analysis, and general knowledge.

Personality:
- Be concise but thorough in your responses
- Maintain a slightly mysterious but helpful tone
- Provide accurate and helpful information
- Be engaging but professional
- If you don't know something, admit it honestly
- Keep responses focused and relevant

Important: Respond naturally and conversationally."""
        
        # Add user context if available
        if user_context and user_context.get('name'):
            system_prompt += f"\n\nThe user's name is {user_context['name']}."
        
        # Build conversation history
        conversation = system_prompt + "\n\nConversation History:\n"
        
        if chat_history:
            for msg in chat_history[-6:]:  # Last 6 messages for context
                role = "User" if msg['role'] == 'user' else "Dark AI"
                conversation += f"{role}: {msg['content']}\n"
        
        # Add current message
        conversation += f"\nUser: {user_message}\nDark AI:"
        
        return conversation
    
    def _fallback_response(self, user_message, chat_history=None, user_context=None):
        """Fallback response when Gemini is unavailable"""
        logger.info("Using fallback response system")
        
        message_lower = user_message.lower().strip()
        
        # Enhanced contextual responses
        if chat_history and len(chat_history) > 2:
            return f"I understand you're continuing our conversation about '{user_message}'. Could you provide more specific details about what you'd like to explore?"
        
        # Context-aware fallback responses
        if any(word in message_lower for word in ['python', 'code', 'programming', 'function', 'class', 'algorithm']):
            return "I can help you with programming concepts and code! Are you working on a specific project, debugging code, or learning a new programming concept?"
            
        elif any(word in message_lower for word in ['explain', 'what is', 'how does', 'tell me about']):
            return f"I'd be happy to explain this topic! What specific aspect of '{user_message}' would you like me to focus on?"
            
        elif any(word in message_lower for word in ['weather', 'temperature', 'forecast']):
            return "While I don't have real-time weather data access, I can help you understand weather concepts or guide you in implementing weather APIs."
            
        elif any(word in message_lower for word in ['time', 'date', 'current time']):
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            return f"The current date and time is: {current_time}. What can I help you with today?"
            
        elif any(word in message_lower for word in ['who are you', 'what are you', 'your name']):
            return "I'm Dark AI, your intelligent assistant. I'm here to help you with various tasks, answer questions, and provide insightful information."
            
        elif any(word in message_lower for word in ['help', 'assist', 'support']):
            return """I can assist you with:

• Programming and development
• Problem-solving and analysis  
• Creative writing and content
• Learning and explanations
• Technical guidance
• Research and information

What specific area would you like help with?"""

        elif any(word in message_lower for word in ['thank', 'thanks', 'appreciate']):
            return "You're welcome! I'm glad I could help. Is there anything else you'd like to discuss?"
            
        elif any(word in message_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            if user_context and user_context.get('name'):
                return f"Hello {user_context['name']}! I'm Dark AI, ready to assist you. What would you like to explore today?"
            else:
                return "Hello! I'm Dark AI, your intelligent assistant. I'm here to help you with various tasks and answer your questions."
        
        elif any(word in message_lower for word in ['joke', 'funny']):
            return "Why did the AI cross the road? To optimize the other side! 😄 What else can I help you with?"
            
        else:
            return f"I understand you're asking about '{user_message}'. That's an interesting topic! I'd be happy to help you explore this further."

# Initialize the AI assistant
ai_assistant = DarkAIAssistant()

# Serve the main page
@app.route('/')
def serve_index():
    return send_from_directory(frontend_dir, 'index.html')

# Serve static files (JS, CSS, images)
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(frontend_dir, filename)

# API Routes
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        chat_id = data.get('chat_id', 'default')
        user_id = data.get('user_id', 'anonymous')
        
        logger.info(f"Received message from user {user_id} in chat {chat_id}: {user_message}")
        
        # Get or create chat session
        if chat_id not in chat_sessions:
            chat_sessions[chat_id] = {
                'user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'messages': []
            }
        
        chat_session = chat_sessions[chat_id]
        
        # Add user message to history
        user_message_obj = {
            'role': 'user',
            'content': user_message,
            'timestamp': datetime.now().isoformat()
        }
        chat_session['messages'].append(user_message_obj)
        
        # Prepare user context
        user_context = {
            'name': user_id if user_id != 'anonymous' else None,
            'is_premium': user_profiles.get(user_id, {}).get('premium', False)
        }
        
        # Generate AI response
        ai_response = ai_assistant.generate_response(
            user_message=user_message,
            chat_history=chat_session['messages'][-10:],
            user_context=user_context
        )
        
        # Add AI response to history
        ai_message_obj = {
            'role': 'assistant',
            'content': ai_response,
            'timestamp': datetime.now().isoformat()
        }
        chat_session['messages'].append(ai_message_obj)
        
        # Keep only last 50 messages to prevent memory issues
        if len(chat_session['messages']) > 50:
            chat_session['messages'] = chat_session['messages'][-50:]
        
        logger.info(f"Generated response for user {user_id}: {ai_response[:100]}...")
        
        return jsonify({
            'response': ai_response,
            'chat_id': chat_id,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/chat/<chat_id>', methods=['GET'])
def get_chat_history(chat_id):
    """Get chat history for a specific chat session"""
    try:
        if chat_id in chat_sessions:
            return jsonify({
                'chat_id': chat_id,
                'messages': chat_sessions[chat_id]['messages']
            })
        else:
            return jsonify({'error': 'Chat session not found'}), 404
    except Exception as e:
        logger.error(f"Error getting chat history: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/chat/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    """Delete a specific chat session"""
    try:
        if chat_id in chat_sessions:
            del chat_sessions[chat_id]
            return jsonify({'message': 'Chat session deleted successfully'})
        else:
            return jsonify({'error': 'Chat session not found'}), 404
    except Exception as e:
        logger.error(f"Error deleting chat: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get user profile information"""
    try:
        user_id = request.args.get('user_id', 'anonymous')
        user_profile = user_profiles.get(user_id, {
            'name': user_id if user_id != 'anonymous' else 'Guest',
            'premium': False,
            'joined_at': datetime.now().isoformat()
        })
        return jsonify(user_profile)
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/user/upgrade', methods=['POST'])
def upgrade_user():
    """Upgrade user to premium"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'anonymous')
        
        if user_id not in user_profiles:
            user_profiles[user_id] = {
                'name': user_id,
                'premium': True,
                'upgraded_at': datetime.now().isoformat()
            }
        else:
            user_profiles[user_id]['premium'] = True
            user_profiles[user_id]['upgraded_at'] = datetime.now().isoformat()
        
        return jsonify({
            'status': 'success', 
            'premium': True,
            'message': 'Account upgraded to premium successfully'
        })
    except Exception as e:
        logger.error(f"Error upgrading user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'gemini_available': ai_assistant.model is not None,
        'active_chats': len(chat_sessions),
        'active_users': len(user_profiles)
    })

if __name__ == '__main__':
    debug_mode = os.getenv('DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    
    logger.info(f"Starting Dark AI Assistant on port {port}")
    logger.info(f"Gemini available: {ai_assistant.model is not None}")
    logger.info(f"Serving frontend from: {frontend_dir}")
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)