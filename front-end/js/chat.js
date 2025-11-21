// Chat functionality
const chat = {
    // Send message function
// In chat.js, update the sendMessage function's response handling
sendMessage: function() {
    if (isInputDisabled) return;

    const input = document.getElementById("messageInput");
    const message = input.value.trim();

    if (!message) return;

    // Check if user has sent too many messages without signing in
    messageCount++;
    if (messageCount > 5 && !isUserLoggedIn) {
        this.showSignInPrompt();
        return;
    }

    const chatMessages = document.getElementById("chatMessages");
    const welcome = chatMessages.querySelector(".welcome");
    if (welcome) welcome.remove();

    // Add user message
    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-actions">
            <button class="message-action-btn" onclick="chat.copyMessage(this)" data-tooltip="Copy message">📋</button>
            <button class="message-action-btn" onclick="chat.editMessage(this)" data-tooltip="Edit message">✏️</button>
        </div>
    `;
    chatMessages.appendChild(userMsg);

    // Clear input and reset send button
    input.value = "";
    input.style.height = "auto";
    document.getElementById("sendBtn").classList.remove("active");

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Generate or get chat ID
    if (!currentChatId) {
        currentChatId = "chat-" + Date.now();
        // Generate conversation title based on conversation content
        const title = utils.generateConversationTitle(message);
        this.addToHistory(currentChatId, title);
    } else {
        // Update conversation title if it's too generic
        this.updateConversationTitle(message);
    }

    // Show typing indicator
    const thinkingIndicator = document.createElement("div");
    thinkingIndicator.className = "message assistant";
    thinkingIndicator.innerHTML = `
        <div class="message-content">
            <div class="thinking-indicator">
                <span>Dark is thinking</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
    `;
    chatMessages.appendChild(thinkingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Send message to Python ML backend
    api.getMLResponse(message)
        .then((response) => {
            // Remove thinking indicator
            thinkingIndicator.remove();

            // Add AI response with typing animation
            this.showTypingResponse(response, chatMessages);
        })
        .catch((error) => {
            console.error("Error getting ML response:", error);
            // Remove thinking indicator
            thinkingIndicator.remove();

            // Show error message with typing animation
            const errorResponse = `<p style="color: #ff6b6b;">${error.message}</p>
            <p style="margin-top: 8px; font-size: 0.9em; color: #888;">
                You can still type messages, but responses will be limited until the service is restored.
            </p>`;
            this.showTypingResponse(errorResponse, chatMessages);
        });
},

// New function for typing animation
// Update the showTypingResponse function to store original response
showTypingResponse: function(response, chatMessages) {
    const assistantMsg = document.createElement("div");
    assistantMsg.className = "message assistant";
    
    // Create message content container
    const messageContent = document.createElement("div");
    messageContent.className = "message-content enhanced-response typing-response";
    messageContent.innerHTML = '<div class="typing-cursor">|</div>';
    
    assistantMsg.appendChild(messageContent);
    
    // Add copy button (initially hidden)
    const messageActions = document.createElement("div");
    messageActions.className = "message-actions";
    messageActions.style.opacity = "0";
    messageActions.innerHTML = `
        <button class="message-action-btn" onclick="chat.copyMessage(this)" data-tooltip="Copy message">📋</button>
    `;
    // Store the original response for final formatting
    messageActions.dataset.originalResponse = response;
    assistantMsg.appendChild(messageActions);
    
    chatMessages.appendChild(assistantMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Start typing animation
    this.typeText(response, messageContent, messageActions);
},

// Typing animation function
typeText: function(text, container, actionsContainer) {
    const formattedText = utils.formatResponseForTyping(text);
    let index = 0;
    const speed = 20; // Adjust typing speed (lower = faster)
    const cursor = container.querySelector('.typing-cursor');
    
    // Store the complete formatted response for copying later
    container.dataset.completeResponse = formattedText;
    
    function type() {
        if (index < formattedText.length) {
            // Get current text and add next character
            const currentText = formattedText.substring(0, index + 1);
            
            // Update container with formatted text
            container.innerHTML = currentText + '<div class="typing-cursor">|</div>';
            
            index++;
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Continue typing
            setTimeout(type, speed);
        } else {
            // Typing complete
            cursor.style.display = 'none';
            container.innerHTML = formattedText;
            
            // Show message actions
            actionsContainer.style.opacity = "1";
            
            // Apply final formatting if needed
            utils.applyFinalFormatting(container);
        }
    }
    
    // Start typing
    type();
},

    // Copy message to clipboard
    copyMessage: function(button) {
        const messageContent = button.closest(".message").querySelector(".message-content");
        const textToCopy = messageContent.textContent || messageContent.innerText;

        navigator.clipboard.writeText(textToCopy).then(() => {
            // Show temporary feedback
            const originalText = button.textContent;
            button.textContent = "✓";
            setTimeout(() => {
                button.textContent = originalText;
            }, 1000);
        });
    },

    // Edit message
    editMessage: function(button) {
        const messageContent = button.closest(".message").querySelector(".message-content");
        const originalText = messageContent.textContent || messageContent.innerText;

        // Create an input field for editing
        const inputField = document.createElement("textarea");
        inputField.value = originalText;
        inputField.style.width = "100%";
        inputField.style.minHeight = "100px";
        inputField.style.padding = "8px";
        inputField.style.borderRadius = "4px";
        inputField.style.border = "1px solid #333333";
        inputField.style.background = "#111111";
        inputField.style.color = "#e0e0e0";

        // Replace message content with input field
        messageContent.innerHTML = "";
        messageContent.appendChild(inputField);

        // Add save and cancel buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.style.marginTop = "10px";
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "10px";

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.className = "message-action-btn";
        saveButton.onclick = function() {
            const newText = inputField.value;
            messageContent.innerHTML = newText;
            // In a real app, you would send the edited message to the AI for a new response
        };

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.className = "message-action-btn";
        cancelButton.onclick = function() {
            messageContent.innerHTML = originalText;
        };

        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(cancelButton);
        messageContent.appendChild(buttonContainer);

        // Focus the input field
        inputField.focus();
    },

    // Update conversation title
    updateConversationTitle: function(newMessage) {
        const currentChat = chatHistory.find((chat) => chat.id === currentChatId);
        if (currentChat && (currentChat.title === "General Conversation" || currentChat.title === "New Conversation")) {
            const newTitle = utils.generateConversationTitle(newMessage);
            if (newTitle !== "General Conversation" && newTitle !== "New Conversation") {
                currentChat.title = newTitle;
                this.updateHistoryDisplay();
            }
        }
    },

    // Add to chat history
    addToHistory: function(chatId, title) {
        // Remove existing chat with same ID if any
        chatHistory = chatHistory.filter((chat) => chat.id !== chatId);

        // Add new chat to beginning
        chatHistory.unshift({ id: chatId, title: title });

        // Keep only last 10 chats
        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(0, 10);
        }

        this.updateHistoryDisplay();
    },

    // Update history display
    updateHistoryDisplay: function() {
        const historyElement = document.getElementById("history");
        historyElement.innerHTML = "";

        // Show only recent conversations (last 5)
        const recentChats = chatHistory.slice(0, 5);

        recentChats.forEach((chat) => {
            const historyItem = document.createElement("div");
            historyItem.className = "history-item";
            historyItem.innerHTML = `
                <span>${chat.title}</span>
                <div class="history-item-actions">
                    <button class="history-action-btn" onclick="chat.renameChat('${chat.id}')" data-tooltip="Rename chat">✏️</button>
                    <button class="history-action-btn" onclick="chat.deleteChat('${chat.id}')" data-tooltip="Delete chat">🗑️</button>
                </div>
            `;
            historyItem.onclick = () => this.loadChat(chat.id);
            historyElement.appendChild(historyItem);
        });
    },

    // Load chat
    loadChat: async function(chatId) {
        currentChatId = chatId;
        const chatItem = chatHistory.find((c) => c.id === chatId);

        // Clear current messages
        const chatMessages = document.getElementById("chatMessages");
        chatMessages.innerHTML = "";

        // Try to load chat history from backend
        const backendMessages = await api.loadChatHistoryFromBackend(chatId);

        if (backendMessages && backendMessages.length > 0) {
            // Display messages from backend
            backendMessages.forEach((msg) => {
                const messageDiv = document.createElement("div");
                messageDiv.className = `message ${msg.role}`;

                if (msg.role === "user") {
                    messageDiv.innerHTML = `
                        <div class="message-content">${msg.content}</div>
                        <div class="message-actions">
                            <button class="message-action-btn" onclick="chat.copyMessage(this)" data-tooltip="Copy message">📋</button>
                            <button class="message-action-btn" onclick="chat.editMessage(this)" data-tooltip="Edit message">✏️</button>
                        </div>
                    `;
                } else {
                    messageDiv.innerHTML = `
                        <div class="message-content enhanced-response">${utils.formatResponse(msg.content)}</div>
                        <div class="message-actions">
                            <button class="message-action-btn" onclick="chat.copyMessage(this)" data-tooltip="Copy message">📋</button>
                        </div>
                    `;
                }

                chatMessages.appendChild(messageDiv);
            });
        } else {
            // Fallback to showing placeholder
            chatMessages.innerHTML = `
                <div class="welcome">
                    <h1>${chatItem.title}</h1>
                    <p>Loading conversation...</p>
                </div>
            `;
        }

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Close sidebar on mobile after loading chat
        if (window.innerWidth <= 768) {
            ui.toggleSidebar();
        }
    },

    // Rename chat
    renameChat: function(chatId) {
        const newTitle = prompt("Enter new chat title:");
        if (newTitle && newTitle.trim()) {
            const chat = chatHistory.find((c) => c.id === chatId);
            if (chat) {
                chat.title = newTitle.trim();
                this.updateHistoryDisplay();
            }
        }
    },

    // Delete chat
    deleteChat: function(chatId) {
        if (confirm("Are you sure you want to delete this chat?")) {
            // Try to delete from backend first
            api.deleteChatFromBackend(chatId);

            // Remove from local history
            chatHistory = chatHistory.filter((chat) => chat.id !== chatId);
            if (currentChatId === chatId) {
                this.newChat();
            }
            this.updateHistoryDisplay();
        }
    },

    // New chat
    newChat: function() {
        document.getElementById("chatMessages").innerHTML = `
            <div class="welcome">
                <h1 id="welcomeTitle">${isUserLoggedIn && userName ? `Hello ${userName}` : "Hello, I'm Dark"}</h1>
                <p>How can I help you today?</p>
            </div>
        `;
        document.getElementById("messageInput").value = "";
        document.getElementById("sendBtn").classList.remove("active");
        currentChatId = null;
        uploadedFiles = [];
        messageCount = 0;

        // Close sidebar on mobile after new chat
        if (window.innerWidth <= 768) {
            ui.toggleSidebar();
        }
    },

    // Show sign in prompt
    showSignInPrompt: function() {
        const chatMessages = document.getElementById("chatMessages");
        const signInPrompt = document.createElement("div");
        signInPrompt.className = "sign-in-prompt";
        signInPrompt.innerHTML = `
            <p>You've sent several messages. Please sign in to continue chatting.</p>
            <button class="sign-in-btn" onclick="auth.redirectToLogin()">Sign In / Sign Up</button>
        `;
        chatMessages.appendChild(signInPrompt);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Disable input area completely
        ui.disableInputArea();
    },

    // Handle file upload
    handleFileUpload: function(event) {
        const file = event.target.files[0];
        if (file) {
            // Create a preview of the uploaded file
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedFiles.push({
                    name: file.name,
                    url: e.target.result,
                });

                // Show the uploaded file preview
                const inputTools = document.querySelector(".input-tools");
                const filePreview = document.createElement("div");
                filePreview.className = "uploaded-file";
                filePreview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <div class="file-name">${file.name}</div>
                    <button class="file-remove-btn" onclick="chat.removeUploadedFile(${uploadedFiles.length - 1})">×</button>
                `;
                // Insert at the beginning of input tools
                inputTools.insertBefore(filePreview, inputTools.firstChild);

                // Show file upload message
                const message = document.createElement("div");
                message.className = "message assistant";
                message.innerHTML = `
                    <div class="message-content">
                        <p>File uploaded: ${file.name}</p>
                    </div>
                `;
                document.getElementById("chatMessages").appendChild(message);
                document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
            };
            reader.readAsDataURL(file);
        }
    },

    // Remove uploaded file
    removeUploadedFile: function(index) {
        uploadedFiles.splice(index, 1);

        // Remove the file preview from the input tools
        const inputTools = document.querySelector(".input-tools");
        const filePreviews = inputTools.querySelectorAll(".uploaded-file");
        if (filePreviews[index]) {
            filePreviews[index].remove();
        }
    },

    // Take screenshot
    takeScreenshot: function() {
        // In a real implementation, this would use a screenshot API
        // For now, we'll show a message
        const message = document.createElement("div");
        message.className = "message assistant";
        message.innerHTML = `
            <div class="message-content">
                <p>Screenshot functionality would be implemented with a proper library in a real application.</p>
            </div>
        `;
        document.getElementById("chatMessages").appendChild(message);
        document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
    }
};
