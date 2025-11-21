// Configuration
const API_BASE_URL = "http://localhost:5000/api";
const APP_VERSION = "1.0.0";

// Global state
let chatHistory = [];
let currentChatId = null;
let uploadedFiles = [];
let messageCount = 0;
let isUserLoggedIn = false;
let userName = "";
let userProfilePic = "";
let isInputDisabled = false;
let isSidebarCollapsed = false;
let currentSettingsView = "main";
let isUserPro = false;

// Utility functions
// Update the formatResponse function in config.js
const utils = {
    formatResponse: function(response) {
        // First, detect if this is code or a story
        if (this.isCode(response)) {
            return this.formatCode(response);
        } else if (this.isStory(response)) {
            return this.formatStory(response);
        } else {
            return this.formatNormalResponse(response);
        }
    },

    isCode: function(text) {
        const codeIndicators = [
            /\b(function|def|class|import|export|var|let|const|if|else|for|while|return)\b/,
            /```[\s\S]*```/,
            /\b(html|css|javascript|python|java|cpp|php|sql)\b/i,
            /[{}();=>]/,
            /^\s*(def |class |function |import |export )/
        ];
        return codeIndicators.some(pattern => pattern.test(text));
    },

    isStory: function(text) {
        const storyIndicators = [
            /\b(Once upon a time|Long ago|In a|Chapter|Story|Tale)\b/i,
            /^[A-Z][^.!?]*\b(was|were|had|lived|went)\b[^.!?]*[.!?]$/,
            /\b(kingdom|castle|dragon|princess|knight|magic|adventure)\b/i,
            /".*?"\s*(said|exclaimed|whispered|shouted)/i
        ];
        return storyIndicators.some(pattern => pattern.test(text)) && text.length > 200;
    },

    formatCode: function(code) {
        // Extract language from code blocks
        let language = 'text';
        let cleanCode = code;
        
        // Handle ```language code ``` blocks
        const codeBlockMatch = code.match(/```(\w+)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            language = codeBlockMatch[1] || this.detectLanguage(codeBlockMatch[2]);
            cleanCode = codeBlockMatch[2];
        } else {
            language = this.detectLanguage(code);
        }
        
        return `
            <div class="code-palette">
                <div class="code-header">
                    <span class="code-language">${language}</span>
                    <div class="code-actions">
                        <button class="copy-code-btn" onclick="utils.copyCode(this)">
                            <span>📋</span>
                            <span>Copy</span>
                        </button>
                    </div>
                </div>
                <div class="code-content">${this.escapeHtml(cleanCode)}</div>
            </div>
        `;
    },

    // Add this to ui.js in the initEventListeners function
initializeCodePalettes: function() {
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
},

// Add these functions to the utils object in config.js

formatResponseForTyping: function(response) {
    // For typing animation, we need to handle HTML tags carefully
    let formatted = response;
    
    // Convert code blocks to placeholder during typing
    formatted = formatted.replace(/```[\s\S]*?```/g, '【Code Block】');
    
    // Convert story blocks to placeholder
    if (this.isStory(response)) {
        formatted = '【Story】';
    }
    
    // Basic HTML escaping for typing
    formatted = this.escapeHtml(formatted);
    
    return formatted;
},

applyFinalFormatting: function(container) {
    const completeResponse = container.dataset.completeResponse;
    
    // Check if this was a code or story response that needs proper formatting
    if (completeResponse.includes('【Code Block】') || completeResponse.includes('【Story】')) {
        // Get the original complete response from the API
        const originalResponse = container.closest('.message').querySelector('.message-actions').dataset.originalResponse;
        if (originalResponse) {
            container.innerHTML = utils.formatResponse(originalResponse);
        }
    } else {
        // Apply normal formatting to the typed text
        container.innerHTML = utils.formatResponse(completeResponse);
    }
},

// Update the existing formatResponse function to handle the final display
formatResponse: function(response) {
    // First, detect if this is code or a story
    if (this.isCode(response)) {
        return this.formatCode(response);
    } else if (this.isStory(response)) {
        return this.formatStory(response);
    } else {
        return this.formatNormalResponse(response);
    }
},

    formatStory: function(story) {
        // Extract title from first line or generate one
        let title = 'Story';
        let content = story;
        
        const firstLine = story.split('\n')[0];
        if (firstLine.length < 50 && !firstLine.includes('.') && !firstLine.includes('!') && !firstLine.includes('?')) {
            title = firstLine;
            content = story.split('\n').slice(1).join('\n');
        }
        
        // Clean up the story content
        content = content.replace(/\n\s*\n/g, '</p><p>').replace(/\n/g, ' ');
        content = `<p>${content}</p>`;
        
        return `
            <div class="story-palette">
                <div class="story-title">${title}</div>
                <div class="story-content">${content}</div>
            </div>
        `;
    },

    formatNormalResponse: function(response) {
        let formatted = response;
        
        // Convert line breaks to paragraphs
        formatted = formatted.replace(/\n\s*\n/g, '</p><p>');
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = `<p>${formatted}</p>`;
        
        // Format lists
        formatted = formatted.replace(/(\d+)\.\s+(.*?)(?=\n\d+\.|\n\n|$)/g, '<li>$2</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
        formatted = formatted.replace(/\*\s+(.*?)(?=\n\*|\n\n|$)/g, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Format bold and italic
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Format blockquotes
        formatted = formatted.replace(/^&gt;\s+(.*)$/gm, '<blockquote>$1</blockquote>');
        
        return `<div class="enhanced-response">${formatted}</div>`;
    },

    detectLanguage: function(code) {
        if (code.includes('def ') || code.includes('import ') || code.includes('print(')) return 'python';
        if (code.includes('function') || code.includes('const ') || code.includes('let ') || code.includes('var ')) return 'javascript';
        if (code.includes('public class') || code.includes('System.out')) return 'java';
        if (code.includes('#include') || code.includes('cout <<')) return 'cpp';
        if (code.includes('<?php') || code.includes('echo ')) return 'php';
        if (code.includes('<html') || code.includes('<div') || code.includes('</')) return 'html';
        if (code.includes('{') && code.includes('}') && code.includes(':')) return 'css';
        if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE')) return 'sql';
        return 'text';
    },

    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    copyCode: function(button) {
        const codeContent = button.closest('.code-palette').querySelector('.code-content');
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
};