/**
 * PORSCHE DRIVING - AI CHAT SYSTEM
 * Groq API Integration with Llama 3.1 405B
 * Mobile-Optimized with Real-Time Sync
 */

class AIChatManager {
    constructor() {
        // Groq API Configuration
        this.apiKey = ''; // Set via prompt or environment variable
        this.apiUrl = 'https://api.groq.com/v1/chat/completions';
        this.model = 'llama-3.1-405b-reasoning';
        
        // Chat state
        this.conversationHistory = [];
        this.isProcessing = false;
        this.isChatboxOpen = false;
        
        // UI Elements
        this.chatbox = document.getElementById('ai-chatbox');
        this.chatBtn = document.getElementById('ai-chat-btn');
        this.closeBtn = document.getElementById('close-chatbox');
        this.chatMessages = document.getElementById('chat-messages');
        this.aiInput = document.getElementById('ai-input');
        this.sendBtn = document.getElementById('ai-send-btn');
        
        // Time sync
        this.lastMessageTime = null;
        this.gameTimeOffset = 0;
        
        // Initialize
        this.init();
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        // Set up event listeners
        if (this.chatBtn) {
            this.chatBtn.addEventListener('click', () => this.toggleChatbox());
        }
        
        // Set API key from prompt if not set
        if (!this.apiKey) {
            this.apiKey = prompt('Groq API Key দিন:', '');
            if (!this.apiKey) {
                console.warn('Groq API Key required for AI chat');
            }
        }
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeChatbox());
        }
        
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (this.aiInput) {
            this.aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        // Add initial message
        this.addMessage('AI', 'হয়, আমি কীভাবে আপনাকে সাহায্য করতে পারি? গাড়ি চালানোর সময় যেকোনো প্রশ্ন করুন!', true);
        
        // Start time sync
        this.startTimeSync();
        
        console.log('AI Chat Manager initialized with Groq Llama 405B');
    }
    
    // ============================================
    // TOGGLE CHATBOX
    // ============================================
    toggleChatbox() {
        this.isChatboxOpen = !this.isChatboxOpen;
        
        if (this.chatbox) {
            this.chatbox.classList.toggle('hidden', !this.isChatboxOpen);
        }
        
        // Focus input when opened
        if (this.isChatboxOpen && this.aiInput) {
            setTimeout(() => {
                this.aiInput.focus();
            }, 100);
        }
        
        // Pause/resume game
        if (this.isChatboxOpen) {
            this.pauseGame();
        } else {
            this.resumeGame();
        }
    }
    
    // ============================================
    // CLOSE CHATBOX
    // ============================================
    closeChatbox() {
        this.isChatboxOpen = false;
        
        if (this.chatbox) {
            this.chatbox.classList.add('hidden');
        }
        
        this.resumeGame();
    }
    
    // ============================================
    // SEND MESSAGE
    // ============================================
    async sendMessage() {
        if (!this.aiInput || this.isProcessing) return;
        
        const message = this.aiInput.value.trim();
        if (!message) return;
        
        // Clear input
        this.aiInput.value = '';
        this.aiInput.blur();
        
        // Disable send button
        if (this.sendBtn) {
            this.sendBtn.disabled = true;
        }
        
        // Add user message
        this.addMessage('User', message, false);
        
        // Record time
        this.lastMessageTime = new Date();
        
        // Show thinking indicator
        const thinkingMessage = this.addMessage('AI', '...', false, 'ai-thinking');
        
        // Process message
        this.isProcessing = true;
        
        try {
            // Call Groq API
            const response = await this.callGroqAPI(message);
            
            // Remove thinking message
            if (thinkingMessage && thinkingMessage.parentNode) {
                thinkingMessage.parentNode.removeChild(thinkingMessage);
            }
            
            // Add AI response
            this.addMessage('AI', response, true);
            
            // Sync game time with message time
            this.syncGameTime();
            
        } catch (error) {
            console.error('AI Chat Error:', error);
            
            // Remove thinking message
            if (thinkingMessage && thinkingMessage.parentNode) {
                thinkingMessage.parentNode.removeChild(thinkingMessage);
            }
            
            // Show error
            this.addMessage('AI', 'সর্বারভার এরর হচ্ছে। আবার চেষ্টা করুন।', true);
        }
        
        // Enable send button
        if (this.sendBtn) {
            this.sendBtn.disabled = false;
        }
        
        this.isProcessing = false;
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    // ============================================
    // CALL GROQ API
    // ============================================
    async callGroqAPI(message) {
        // Build conversation history
        const messages = this.conversationHistory.map(msg => ({
            role: msg.sender === 'User' ? 'user' : 'assistant',
            content: msg.text
        }));
        
        // Add current message
        messages.push({
            role: 'user',
            content: message
        });
        
        // Request body
        const requestBody = {
            model: this.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 4096,
            stream: false,
            stop: null,
            response_format: { type: 'text' }
        };
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'x-llm-provider': 'groq'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Extract response
            const aiResponse = data.choices[0]?.message?.content || 'কোনো উত্তর পাওয়া যায়নি।';
            
            // Add to conversation history
            this.conversationHistory.push({
                sender: 'User',
                text: message
            });
            this.conversationHistory.push({
                sender: 'AI',
                text: aiResponse
            });
            
            // Keep only last 50 messages
            if (this.conversationHistory.length > 50) {
                this.conversationHistory = this.conversationHistory.slice(-50);
            }
            
            return aiResponse;
            
        } catch (error) {
            console.error('Groq API Error:', error);
            throw error;
        }
    }
    
    // ============================================
    // ADD MESSAGE TO CHAT
    // ============================================
    addMessage(sender, text, isAi, className = '') {
        if (!this.chatMessages) return null;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender === 'User' ? 'user' : 'ai'} ${className}`;
        
        const senderSpan = document.createElement('span');
        senderSpan.className = 'message-sender';
        senderSpan.textContent = `${sender}:`;
        
        const textSpan = document.createElement('span');
        textSpan.className = 'message-text';
        textSpan.textContent = text;
        
        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(textSpan);
        
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        this.scrollToBottom();
        
        return messageDiv;
    }
    
    // ============================================
    // SCROLL TO BOTTOM
    // ============================================
    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
    
    // ============================================
    // TIME SYNC WITH REAL USER TIME
    // ============================================
    startTimeSync() {
        // Update game time based on real time
        this.updateGameTimeFromRealTime();
        
        // Sync every second
        this.timeSyncInterval = setInterval(() => {
            this.updateGameTimeFromRealTime();
        }, 1000);
        
        // Also update display
        this.updateClockDisplay();
        this.clockInterval = setInterval(() => {
            this.updateClockDisplay();
        }, 1000);
    }
    
    // ============================================
    // UPDATE GAME TIME FROM REAL TIME
    // ============================================
    updateGameTimeFromRealTime() {
        if (!this.lastMessageTime) return;
        
        const now = new Date();
        const diffSeconds = (now - this.lastMessageTime) / 1000;
        
        // Update game time
        if (typeof GAME_STATE !== 'undefined') {
            GAME_STATE.playTime = this.calculateGameTimeFromRealTime();
        }
    }
    
    // ============================================
    // CALCULATE GAME TIME FROM REAL TIME
    // ============================================
    calculateGameTimeFromRealTime() {
        // If we have a last message time, use it as reference
        if (this.lastMessageTime) {
            const now = new Date();
            const diffSeconds = (now - this.lastMessageTime) / 1000;
            
            // If game was already running, add the difference
            if (typeof GAME_STATE !== 'undefined' && GAME_STATE.playTime > 0) {
                return GAME_STATE.playTime + diffSeconds;
            }
        }
        
        // Otherwise, use current time of day in seconds
        const now = new Date();
        return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    }
    
    // ============================================
    // UPDATE CLOCK DISPLAY
    // ============================================
    updateClockDisplay() {
        const clockElement = document.getElementById('current-time');
        if (!clockElement) return;
        
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // ============================================
    // SYNC GAME TIME
    // ============================================
    syncGameTime() {
        if (typeof GAME_STATE !== 'undefined') {
            // Use real time as game time
            const now = new Date();
            GAME_STATE.playTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        }
    }
    
    // ============================================
    // PAUSE GAME
    // ============================================
    pauseGame() {
        if (typeof isGameRunning !== 'undefined') {
            isGameRunning = false;
        }
        
        // Pause audio
        if (typeof audioManager !== 'undefined' && audioManager) {
            audioManager.suspend();
        }
    }
    
    // ============================================
    // RESUME GAME
    // ============================================
    resumeGame() {
        if (typeof isGameRunning !== 'undefined') {
            isGameRunning = true;
            if (typeof animate !== 'undefined') {
                animate();
            }
        }
        
        // Resume audio
        if (typeof audioManager !== 'undefined' && audioManager) {
            audioManager.resume();
        }
    }
    
    // ============================================
    // SET API KEY
    // ============================================
    setApiKey(key) {
        this.apiKey = key;
        console.log('Groq API Key set');
    }
    
    // ============================================
    // SET MODEL
    // ============================================
    setModel(model) {
        this.model = model;
        console.log(`AI Model set to: ${model}`);
    }
    
    // ============================================
    // GET CHAT HISTORY
    // ============================================
    getChatHistory() {
        return this.conversationHistory;
    }
    
    // ============================================
    // CLEAR CHAT HISTORY
    // ============================================
    clearChatHistory() {
        this.conversationHistory = [];
        
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }
        
        // Add initial message
        this.addMessage('AI', 'হয়, আমি কীভাবে আপনাকে সাহায্য করতে পারি?', true);
    }
    
    // ============================================
    // CLEANUP
    // ============================================
    cleanup() {
        // Clear intervals
        if (this.timeSyncInterval) {
            clearInterval(this.timeSyncInterval);
        }
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        
        // Reset state
        this.conversationHistory = [];
        this.isProcessing = false;
        this.isChatboxOpen = false;
        
        // Close chatbox
        if (this.chatbox) {
            this.chatbox.classList.add('hidden');
        }
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================
const aiChatManager = new AIChatManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = aiChatManager;
}

// ============================================
// GROQ MODEL INFORMATION
// ============================================

// Available Groq models (Largest first)
const GROQ_MODELS = {
    'llama-3.1-405b-reasoning': {
        name: 'Llama 3.1 405B Reasoning',
        context: 131072,
        maxTokens: 4096,
        description: 'Groq এর সবচেয়ে বড় মডেল - 405B প্যারামিটার'
    },
    'llama-3.1-405b': {
        name: 'Llama 3.1 405B',
        context: 131072,
        maxTokens: 4096,
        description: '405B প্যারামিটার মডেল'
    },
    'llama-3.1-70b-reasoning': {
        name: 'Llama 3.1 70B Reasoning',
        context: 131072,
        maxTokens: 4096,
        description: '70B প্যারামিটার রিজনিং মডেল'
    },
    'llama-3.1-70b': {
        name: 'Llama 3.1 70B',
        context: 131072,
        maxTokens: 4096,
        description: '70B প্যারামিটার মডেল'
    },
    'mixtral-8x7b': {
        name: 'Mixtral 8x7B',
        context: 32768,
        maxTokens: 4096,
        description: 'Mixture of Experts মডেল'
    },
    'gemma2-9b': {
        name: 'Gemma2 9B',
        context: 8192,
        maxTokens: 4096,
        description: 'Google এর Gemma2 মডেল'
    }
};

// Set the largest model by default
if (aiChatManager) {
    aiChatManager.setModel('llama-3.1-405b-reasoning');
}
