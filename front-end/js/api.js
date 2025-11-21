// API communication functions
const api = {
    // Test backend connection
    testBackendConnection: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (response.ok) {
                const data = await response.json();
                console.log("Backend connection successful:", data);
                return true;
            } else {
                console.warn("Backend health check failed");
                return false;
            }
        } catch (error) {
            console.error("Backend connection failed:", error);
            return false;
        }
    },

    // Get ML response from backend
    // Update the getMLResponse function in api.js
getMLResponse: async function(message) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: message,
                chat_id: currentChatId,
                user_id: isUserLoggedIn ? userName : "anonymous",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error fetching ML response:", error);

        if (error.message.includes("Failed to fetch") || error.message.includes("Network")) {
            throw new Error("Unable to connect to the AI service. Please check your internet connection and ensure the backend server is running.");
        } else if (error.message.includes("500")) {
            throw new Error("The AI service is experiencing technical difficulties. Please try again later.");
        } else {
            throw new Error("Sorry, I encountered an error while processing your request. Please try again.");
        }
    }
},
    // Load chat history from backend
    loadChatHistoryFromBackend: async function(chatId) {
        if (!isUserLoggedIn) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/chat/${chatId}`);
            if (response.ok) {
                const data = await response.json();
                return data.messages;
            }
        } catch (error) {
            console.error("Error loading chat history from backend:", error);
        }
        return null;
    },

    // Delete chat from backend
    deleteChatFromBackend: async function(chatId) {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
                method: "DELETE",
            });
            return response.ok;
        } catch (error) {
            console.error("Error deleting chat from backend:", error);
            return false;
        }
    },

    // Get user profile
    getUserProfile: async function(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/profile?user_id=${userId}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error("Error getting user profile:", error);
        }
        return null;
    },

    // Upgrade user to premium
    upgradeUserToPremium: async function(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/upgrade`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId
                }),
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error("Error upgrading user:", error);
        }
        return null;
    },

    // Create user
    createUser: async function(userId, name) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    name: name
                }),
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error("Error creating user:", error);
        }
        return null;
    }
};