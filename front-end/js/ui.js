// UI interaction functions
const ui = {
    // Entrance animation
    startEntranceAnimation: function() {
        const animation = document.getElementById("entranceAnimation");
        const mainContainer = document.getElementById("mainContainer");

        // Skip animation if coming from specific pages
        if (this.shouldSkipAnimation()) {
            animation.style.display = "none";
            mainContainer.classList.add("visible");
            return;
        }

        // Always show animation
        animation.style.display = "flex";

        // Hide animation and show main container after 4 seconds
        setTimeout(() => {
            animation.classList.add("hidden");
            mainContainer.classList.add("visible");

            // Remove animation from DOM after transition completes
            setTimeout(() => {
                animation.style.display = "none";
            }, 1000);
        }, 4000);
    },

    // Check if should skip animation
    shouldSkipAnimation: function() {
        const referrer = document.referrer;
        const skipPages = ["contact.html", "terms.html", "settings.html", "conversation.html"];
        return skipPages.some((page) => referrer.includes(page));
    },

    // Handle key press
    handleKeyPress: function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            chat.sendMessage();
        }
    },

    // Enhanced input change handler
    handleInputChange: function() {
        const input = document.getElementById("messageInput");
        const sendBtn = document.getElementById("sendBtn");

        // Enable send button if there's content or uploaded files
        if ((input.value.trim() || uploadedFiles.length > 0) && !isInputDisabled) {
            sendBtn.classList.add("active");
        } else {
            sendBtn.classList.remove("active");
        }

        // Auto-resize textarea with better handling
        input.style.height = "auto";
        const newHeight = Math.min(input.scrollHeight, 120);
        input.style.height = newHeight + "px";
    },

    // Toggle sidebar
    toggleSidebar: function() {
        document.getElementById("sidebar").classList.toggle("active");
    },

    // Toggle sidebar collapse
    toggleSidebarCollapse: function() {
        const sidebar = document.getElementById("sidebar");
        const collapseBtn = document.getElementById("collapseBtn");

        isSidebarCollapsed = !isSidebarCollapsed;

        if (isSidebarCollapsed) {
            sidebar.classList.add("collapsed");
            collapseBtn.classList.add("collapsed");
            collapseBtn.textContent = "→";
        } else {
            sidebar.classList.remove("collapsed");
            collapseBtn.classList.remove("collapsed");
            collapseBtn.textContent = "←";
        }
    },

    // Toggle pricing dropdown
    togglePricingDropdown: function() {
        const pricingDropdown = document.getElementById("pricingDropdown");
        pricingDropdown.classList.toggle("active");
    },

    // Show payment modal
    showPaymentModal: function() {
        const paymentModal = document.getElementById("paymentModal");
        const pricingDropdown = document.getElementById("pricingDropdown");

        // Close pricing dropdown
        pricingDropdown.classList.remove("active");

        // Show payment modal
        paymentModal.classList.add("active");
    },

    // Close payment modal
    closePaymentModal: function() {
        const paymentModal = document.getElementById("paymentModal");
        paymentModal.classList.remove("active");
    },

    // Disable input area
    disableInputArea: function() {
        const inputArea = document.getElementById("inputArea");
        const messageInput = document.getElementById("messageInput");
        const sendBtn = document.getElementById("sendBtn");

        isInputDisabled = true;
        inputArea.classList.add("disabled");
        messageInput.placeholder = "Please sign in to continue chatting...";
        messageInput.disabled = true;
        sendBtn.classList.remove("active");
        sendBtn.disabled = true;
    },

    // Enable input area
    enableInputArea: function() {
        const inputArea = document.getElementById("inputArea");
        const messageInput = document.getElementById("messageInput");
        const sendBtn = document.getElementById("sendBtn");

        isInputDisabled = false;
        inputArea.classList.remove("disabled");
        messageInput.placeholder = "Message Dark...";
        messageInput.disabled = false;
        sendBtn.disabled = false;
    },

    // Enhanced stop typing function
    stopTyping: function() {
        isTyping = false;
        const stopBtn = document.getElementById("stopBtn");
        const sendBtn = document.getElementById("sendBtn");

        stopBtn.style.display = "none";
        sendBtn.style.display = "block";

        // Cancel any ongoing typing animations
        document.querySelectorAll('.typing-indicator').forEach(indicator => {
            indicator.innerHTML = '<div class="typing-text">Response interrupted</div>';
        });

        console.log("Stopping AI response...");
    },

    // Navigation functions
    openContact: function() {
        window.location.href = "contact.html";
    },

    openTerms: function() {
        window.location.href = "terms.html";
    },

    openConversation: function() {
        window.location.href = "conversation.html";
    },

    getApp: function() {
        const message = document.createElement("div");
        message.className = "message assistant";
        message.innerHTML = `
            <div class="message-content">
                <p>This would redirect to app download page in a real application.</p>
            </div>
            <div class="message-time">${utils.getCurrentTime()}</div>
        `;
        document.getElementById("chatMessages").appendChild(message);
        document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
        document.getElementById("userMenu").classList.remove("active");
    },

    // Settings panel functions
    showSettingsPanel: function() {
        const settingsPanel = document.getElementById("settingsPanel");
        settingsPanel.classList.add("active");
        this.loadMainSettings();
    },

    closeSettings: function() {
        const settingsPanel = document.getElementById("settingsPanel");
        settingsPanel.classList.remove("active");
        currentSettingsView = "main";
    },

    loadMainSettings: function() {
        const settingsContent = document.getElementById("settingsContent");
        const settingsTitle = document.getElementById("settingsTitle");

        settingsTitle.textContent = "Settings";
        currentSettingsView = "main";

        settingsContent.innerHTML = `
            <div class="settings-section">
                <div class="settings-section-title">User Profile</div>
                <div class="settings-option" onclick="ui.loadAccountSettings()">
                    <span class="settings-option-icon">👤</span>
                    <span class="settings-option-text">Account Settings</span>
                    <span class="settings-option-arrow">→</span>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">Privacy & Security</div>
                <div class="settings-option" onclick="ui.loadPrivacySettings()">
                    <span class="settings-option-icon">🔒</span>
                    <span class="settings-option-text">Privacy Settings</span>
                    <span class="settings-option-arrow">→</span>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">Appearance</div>
                <div class="settings-option" onclick="ui.loadThemeSettings()">
                    <span class="settings-option-icon">🎨</span>
                    <span class="settings-option-text">Theme</span>
                    <span class="settings-option-arrow">→</span>
                </div>
                <div class="settings-option" onclick="ui.loadLanguageSettings()">
                    <span class="settings-option-icon">🌐</span>
                    <span class="settings-option-text">Language</span>
                    <span class="settings-option-arrow">→</span>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">Other</div>
                <div class="settings-option" onclick="ui.loadNotificationSettings()">
                    <span class="settings-option-icon">🔔</span>
                    <span class="settings-option-text">Notifications</span>
                    <span class="settings-option-arrow">→</span>
                </div>
                <div class="settings-option" onclick="ui.loadStorageSettings()">
                    <span class="settings-option-icon">💾</span>
                    <span class="settings-option-text">Storage</span>
                    <span class="settings-option-arrow">→</span>
                </div>
                <div class="settings-option" onclick="ui.loadAboutSettings()">
                    <span class="settings-option-icon">ℹ️</span>
                    <span class="settings-option-text">About</span>
                    <span class="settings-option-arrow">→</span>
                </div>
            </div>
        `;
    },

    // Enhanced settings functions
    loadAccountSettings: function() {
        const settingsContent = document.getElementById("settingsContent");
        const settingsTitle = document.getElementById("settingsTitle");

        settingsTitle.textContent = "Account Settings";
        currentSettingsView = "account";

        settingsContent.innerHTML = `
            <button class="settings-back" onclick="ui.loadMainSettings()">
                ← Back
            </button>
            <div class="settings-section">
                <div class="account-option" onclick="ui.editProfile()">
                    <div class="account-option-title">Profile Information</div>
                    <div class="account-option-desc">Update your name, email, and profile picture</div>
                </div>
                <div class="account-option" onclick="ui.manageSubscription()">
                    <div class="account-option-title">Subscription</div>
                    <div class="account-option-desc">Manage your Dark AI Premium subscription</div>
                </div>
                <div class="account-option" onclick="ui.privacySettings()">
                    <div class="account-option-title">Privacy</div>
                    <div class="account-option-desc">Control your data and privacy settings</div>
                </div>
            </div>
        `;
    },

    loadThemeSettings: function() {
        const settingsContent = document.getElementById("settingsContent");
        const settingsTitle = document.getElementById("settingsTitle");

        settingsTitle.textContent = "Theme Settings";
        currentSettingsView = "theme";

        settingsContent.innerHTML = `
            <button class="settings-back" onclick="ui.loadMainSettings()">
                ← Back
            </button>
            <div class="settings-section">
                <div class="settings-section-title">Select Theme</div>
                <div class="theme-preview">
                    <div class="theme-option theme-dark active" onclick="ui.changeTheme('dark')" data-theme="dark">
                        <div class="theme-name">Dark</div>
                    </div>
                    <div class="theme-option theme-light" onclick="ui.changeTheme('light')" data-theme="light">
                        <div class="theme-name">Light</div>
                    </div>
                    <div class="theme-option theme-blue" onclick="ui.changeTheme('blue')" data-theme="blue">
                        <div class="theme-name">Blue</div>
                    </div>
                </div>
            </div>
            <div class="settings-section">
                <div class="settings-section-title">Code Display</div>
                <div class="settings-option" onclick="ui.toggleSyntaxHighlighting()">
                    <span class="settings-option-icon">🎨</span>
                    <span class="settings-option-text">Syntax Highlighting</span>
                    <span class="settings-option-arrow">${localStorage.getItem('syntaxHighlighting') !== 'false' ? '✓' : '→'}</span>
                </div>
                <div class="settings-option" onclick="ui.toggleCodePalettes()">
                    <span class="settings-option-icon">📁</span>
                    <span class="settings-option-text">Enhanced Code Palettes</span>
                    <span class="settings-option-arrow">${localStorage.getItem('codePalettes') !== 'false' ? '✓' : '→'}</span>
                </div>
            </div>
        `;
    },

    // Theme management
    changeTheme: function(theme) {
        document.body.className = '';
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else if (theme === 'blue') {
            document.body.classList.add('blue-mode');
        }
        
        // Update active theme indicator
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        event.target.closest('.theme-option').classList.add('active');
        
        // Save theme preference
        localStorage.setItem('theme', theme);
    },

    // Code display settings
    toggleSyntaxHighlighting: function() {
        const current = localStorage.getItem('syntaxHighlighting') !== 'false';
        localStorage.setItem('syntaxHighlighting', !current);
        this.loadThemeSettings(); // Refresh to show updated state
    },

    toggleCodePalettes: function() {
        const current = localStorage.getItem('codePalettes') !== 'false';
        localStorage.setItem('codePalettes', !current);
        this.loadThemeSettings(); // Refresh to show updated state
    },

    // Enhanced utility functions for code palettes
    initializeCodePalettes: function() {
        // Add copy functionality to all code blocks
        document.addEventListener('click', function(e) {
            if (e.target.closest('.copy-code-btn')) {
                const button = e.target.closest('.copy-code-btn');
                const codeBlock = button.closest('.code-palette');
                const codeContent = codeBlock.querySelector('.code-content');
                const textToCopy = codeContent.textContent;
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalHTML = button.innerHTML;
                    button.innerHTML = '<span>✓</span><span>Copied!</span>';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.innerHTML = originalHTML;
                        button.classList.remove('copied');
                    }, 2000);
                });
            }
        });

        // Add syntax highlighting if enabled
        if (localStorage.getItem('syntaxHighlighting') !== 'false') {
            this.applySyntaxHighlighting();
        }
    },

    // Basic syntax highlighting function
    applySyntaxHighlighting: function() {
        document.querySelectorAll('.code-content').forEach(codeBlock => {
            const code = codeBlock.textContent;
            const language = codeBlock.closest('.code-palette')?.querySelector('.code-language')?.textContent?.toLowerCase() || 'text';
            
            let highlightedCode = this.highlightCode(code, language);
            codeBlock.innerHTML = highlightedCode;
        });
    },

    highlightCode: function(code, language) {
        // Escape HTML
        code = code.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");

        // Apply basic syntax highlighting based on language
        if (language.includes('javascript') || language.includes('js')) {
            code = code
                .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|finally)\b/g, '<span class="keyword">$1</span>')
                .replace(/\b(function)\s+(\w+)/g, '$1 <span class="function">$2</span>')
                .replace(/"([^"]*)"|'([^']*)'|`([^`]*)`/g, '<span class="string">$&</span>')
                .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')
                .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
                .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
        } else if (language.includes('python')) {
            code = code
                .replace(/\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|lambda)\b/g, '<span class="keyword">$1</span>')
                .replace(/"([^"]*)"|'([^']*)'/g, '<span class="string">$&</span>')
                .replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>')
                .replace(/#.*$/gm, '<span class="comment">$&</span>');
        } else if (language.includes('html')) {
            code = code
                .replace(/&lt;(\/?)(\w+)/g, '&lt;$1<span class="tag">$2</span>')
                .replace(/(\w+)=/g, '<span class="attribute">$1</span>=')
                .replace(/"[^"]*"/g, '<span class="string">$&</span>');
        } else if (language.includes('css')) {
            code = code
                .replace(/([^{}]+)\{/g, '<span class="selector">$1</span>{')
                .replace(/([a-z-]+):/g, '<span class="property">$1</span>:')
                .replace(/#[0-9a-fA-F]+|\b(rgb|hsl|var)\([^)]*\)/g, '<span class="value">$&</span>')
                .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
        }

        return code;
    },

    // Enhanced file preview management
    initializeFilePreviews: function() {
        document.addEventListener('click', function(e) {
            if (e.target.closest('.file-remove')) {
                const index = parseInt(e.target.closest('.file-remove').dataset.index);
                chat.removeUploadedFile(index);
            }
        });
    },

    // Make settings panel draggable
    makeSettingsDraggable: function() {
        const settingsPanel = document.getElementById("settingsPanel");
        const settingsHeader = document.getElementById("settingsHeader");

        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        settingsHeader.addEventListener("mousedown", startDrag);
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", stopDrag);

        function startDrag(e) {
            if (e.target.classList.contains("settings-close")) return;

            isDragging = true;
            const rect = settingsPanel.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            settingsPanel.style.transition = "none";
        }

        function drag(e) {
            if (!isDragging) return;

            const newX = e.clientX - dragOffsetX;
            const newY = e.clientY - dragOffsetY;

            // Keep panel within viewport bounds
            const maxX = window.innerWidth - settingsPanel.offsetWidth;
            const maxY = window.innerHeight - settingsPanel.offsetHeight;

            settingsPanel.style.left = Math.max(0, Math.min(newX, maxX)) + "px";
            settingsPanel.style.top = Math.max(0, Math.min(newY, maxY)) + "px";
            settingsPanel.style.right = "auto";
            settingsPanel.style.bottom = "auto";
        }

        function stopDrag() {
            isDragging = false;
            settingsPanel.style.transition = "bottom 0.4s ease";
        }
    },

    // Enhanced event listeners
    initEventListeners: function() {
        // Close sidebar when clicking outside on mobile
        document.addEventListener("click", function(e) {
            const sidebar = document.getElementById("sidebar");
            const menuToggle = document.querySelector(".menu-toggle");
            const userMenu = document.getElementById("userMenu");
            const pricingDropdown = document.getElementById("pricingDropdown");
            const pricingButton = document.getElementById("pricingButton");

            if (window.innerWidth <= 768 && sidebar.classList.contains("active") && !sidebar.contains(e.target) && e.target !== menuToggle) {
                ui.toggleSidebar();
            }

            // Close user menu when clicking outside
            if (userMenu.classList.contains("active") && !e.target.closest(".header-buttons")) {
                userMenu.classList.remove("active");
            }

            // Close pricing dropdown when clicking outside
            if (pricingDropdown.classList.contains("active") && !e.target.closest(".pricing-container")) {
                pricingDropdown.classList.remove("active");
            }

            // Close settings panel when clicking outside
            const settingsPanel = document.getElementById("settingsPanel");
            if (settingsPanel.classList.contains("active") && !e.target.closest(".settings-panel") && !e.target.closest(".user-menu-item")) {
                ui.closeSettings();
            }
        });

        // Enhanced input handling
        const messageInput = document.getElementById("messageInput");
        if (messageInput) {
            messageInput.addEventListener("input", this.handleInputChange.bind(this));
            messageInput.addEventListener("keypress", this.handleKeyPress.bind(this));
        }

        // Card number formatting
        const cardNumberInput = document.getElementById("cardNumber");
        if (cardNumberInput) {
            cardNumberInput.addEventListener("input", function() {
                let value = this.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                let formattedValue = "";

                for (let i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) {
                        formattedValue += " ";
                    }
                    formattedValue += value[i];
                }

                this.value = formattedValue;
            });
        }

        // Expiry date formatting
        const expiryDateInput = document.getElementById("expiryDate");
        if (expiryDateInput) {
            expiryDateInput.addEventListener("input", function() {
                let value = this.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

                if (value.length >= 2) {
                    this.value = value.substring(0, 2) + "/" + value.substring(2, 4);
                } else {
                    this.value = value;
                }
            });
        }

        // CVV validation
        const cvvInput = document.getElementById("cvv");
        if (cvvInput) {
            cvvInput.addEventListener("input", function() {
                this.value = this.value.replace(/[^0-9]/gi, "");
            });
        }

        // Initialize code palettes and file previews
        this.initializeCodePalettes();
        this.initializeFilePreviews();

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.changeTheme(savedTheme);
    }
};

// Initialize utility functions if not already defined
if (typeof utils === 'undefined') {
    const utils = {
        getCurrentTime: function() {
            const now = new Date();
            return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };
}
