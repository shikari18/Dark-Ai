// Authentication and user management functions
const auth = {
    // Load user profile from localStorage
    loadUserProfile: function() {
        const userData = localStorage.getItem("darkAIUser");
        if (userData) {
            const user = JSON.parse(userData);
            isUserLoggedIn = true;
            userName = user.name;
            userProfilePic = user.avatar || "";
            isUserPro = user.premium || false;

            this.updateUserInterface();
            ui.enableInputArea();
        } else {
            this.updateUserInterface();
        }
    },

    // Update user interface based on login status
    updateUserInterface: function() {
        const welcomeTitle = document.getElementById("welcomeTitle");
        const userProfileBtn = document.getElementById("userProfileBtn");
        const userAuthAction = document.getElementById("userAuthAction");
        const pricingButton = document.getElementById("pricingButton");
        const authButtons = document.getElementById("authButtons");

        if (isUserLoggedIn && userName) {
            welcomeTitle.innerHTML = `Hello ${userName}`;

            // Set profile picture if available
            if (userProfilePic) {
                userProfileBtn.innerHTML = `<img src="${userProfilePic}" class="profile-pic" alt="Profile">`;
            } else {
                userProfileBtn.textContent = "👤";
            }

            // Show user profile button
            userProfileBtn.style.display = "flex";

            // Hide auth buttons
            authButtons.style.display = "none";

            // Show pricing button only for logged-in users
            pricingButton.style.display = "block";

            // Update user menu
            userAuthAction.textContent = "Log Out";

            // Update pricing button if user is pro
            if (isUserPro) {
                pricingButton.textContent = "Pro";
                pricingButton.classList.add("pro");
            } else {
                pricingButton.textContent = "Pricing";
                pricingButton.classList.remove("pro");
            }
        } else {
            welcomeTitle.innerHTML = `Hello, I'm Dark`;
            userProfileBtn.style.display = "none";
            userAuthAction.textContent = "Sign In / Sign Up";
            pricingButton.style.display = "none";
            pricingButton.textContent = "Pricing";
            pricingButton.classList.remove("pro");

            // Show auth buttons
            authButtons.style.display = "flex";
        }
    },

    // Redirect to login page
    redirectToLogin: function() {
        window.location.href = "login.html";
    },

    // Redirect to signup page
    redirectToSignup: function() {
        window.location.href = "signup.html";
    },

    // Handle user authentication action
    handleUserAuth: function() {
        if (isUserLoggedIn) {
            this.signOut();
        } else {
            this.redirectToLogin();
        }
        document.getElementById("userMenu").classList.remove("active");
    },

    // Toggle user menu
    toggleUserMenu: function() {
        const userMenu = document.getElementById("userMenu");
        userMenu.classList.toggle("active");
    },

    // Sign out function
    signOut: function() {
        isUserLoggedIn = false;
        userName = "";
        userProfilePic = "";
        isUserPro = false;

        // Clear user data from localStorage
        localStorage.removeItem("darkAIUser");

        // Update UI immediately
        this.updateUserInterface();

        // Show sign-in prompt if needed
        if (messageCount > 5) {
            chat.showSignInPrompt();
        }

        // Close user menu
        document.getElementById("userMenu").classList.remove("active");
    },

    // Process payment
    processPayment: function() {
        const cardNumber = document.getElementById("cardNumber").value;
        const expiryDate = document.getElementById("expiryDate").value;
        const cvv = document.getElementById("cvv").value;
        const cardName = document.getElementById("cardName").value;

        // Simple validation
        if (!cardNumber || !expiryDate || !cvv || !cardName) {
            alert("Please fill in all card details");
            return;
        }

        // In a real application, you would process the payment here
        // For demonstration, we'll simulate a successful payment

        // Update user to pro statusC
        const userData = JSON.parse(localStorage.getItem("darkAIUser"));
        if (userData) {
            userData.premium = true;
            localStorage.setItem("darkAIUser", JSON.stringify(userData));
            isUserPro = true;
        }

        // Show success message
        document.getElementById("paymentForm").style.display = "none";
        document.getElementById("paymentSuccess").classList.add("active");

        // Update UI
        this.updateUserInterface();
    }
};