class PasswordStrengthAnalyzer {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.resetUI();
    }

    initializeElements() {
        // Input elements
        this.passwordInput = document.getElementById('passwordInput');
        this.togglePassword = document.getElementById('togglePassword');
        this.copyPassword = document.getElementById('copyPassword');
        this.resetPassword = document.getElementById('resetPassword');
        
        // Strength display elements
        this.strengthBar = document.getElementById('strengthBar');
        this.scoreValue = document.getElementById('scoreValue');
        this.crackTime = document.getElementById('crackTime');
        this.entropyValue = document.getElementById('entropyValue');
        this.feedbackMessage = document.getElementById('feedbackMessage');
        
        // Requirement elements
        this.requirementElements = {
            length: document.getElementById('reqLength'),
            lowercase: document.getElementById('reqLowercase'),
            uppercase: document.getElementById('reqUppercase'),
            number: document.getElementById('reqNumber'),
            symbol: document.getElementById('reqSymbol')
        };
        
        // Stats elements
        this.lengthValue = document.getElementById('lengthValue');
        this.charsetValue = document.getElementById('charsetValue');
        this.complexityValue = document.getElementById('complexityValue');
        
        // Strength labels
        this.strengthLabels = document.querySelectorAll('.strength-label');
        this.scoreCircle = document.querySelector('.score-circle');
    }

    setupEventListeners() {
        // Password input event
        this.passwordInput.addEventListener('input', (e) => {
            this.analyzePassword(e.target.value);
        });

        // Control buttons
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        this.copyPassword.addEventListener('click', () => this.copyToClipboard());
        this.resetPassword.addEventListener('click', () => this.resetPasswordField());

        // Focus effects
        this.passwordInput.addEventListener('focus', () => {
            this.passwordInput.parentElement.classList.add('focused');
        });

        this.passwordInput.addEventListener('blur', () => {
            this.passwordInput.parentElement.classList.remove('focused');
        });
    }

    analyzePassword(password) {
        if (!password) {
            this.resetUI();
            return;
        }

        const analysis = {
            length: password.length,
            hasLowercase: /[a-z]/.test(password),
            hasUppercase: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSymbol: /[^a-zA-Z0-9\s]/.test(password),
            score: 0,
            strength: 'very-weak',
            entropy: this.calculateEntropy(password),
            crackTime: this.estimateCrackTime(password)
        };

        analysis.score = this.calculateScore(analysis);
        analysis.strength = this.determineStrength(analysis.score);

        this.updateUI(analysis);
    }

    calculateScore(analysis) {
        let score = 0;

        // Length score (0-40 points)
        if (analysis.length >= 16) score += 40;
        else if (analysis.length >= 12) score += 30;
        else if (analysis.length >= 8) score += 20;
        else if (analysis.length >= 4) score += 10;

        // Character diversity score (0-60 points)
        const requirementsMet = [
            analysis.hasLowercase,
            analysis.hasUppercase,
            analysis.hasNumber,
            analysis.hasSymbol
        ].filter(Boolean).length;

        score += requirementsMet * 15;

        // Bonus for meeting all requirements
        if (requirementsMet === 4 && analysis.length >= 8) {
            score += 10;
        }

        return Math.min(100, Math.max(0, score));
    }

    determineStrength(score) {
        if (score >= 80) return 'strong';
        if (score >= 60) return 'medium';
        if (score >= 30) return 'weak';
        return 'very-weak';
    }

    calculateEntropy(password) {
        if (!password.length) return 0;

        let charsetSize = 0;
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[^a-zA-Z0-9\s]/.test(password)) charsetSize += 32;

        // If no character types detected, assume minimal charset
        if (charsetSize === 0) charsetSize = 26;

        return Math.round(password.length * Math.log2(charsetSize));
    }

    estimateCrackTime(password) {
        if (!password.length) return 'Instant';

        const entropy = this.calculateEntropy(password);
        const guessesPerSecond = 1e9; // 1 billion guesses per second
        const seconds = Math.pow(2, entropy) / guessesPerSecond;

        return this.formatTime(seconds);
    }

    formatTime(seconds) {
        if (seconds < 1) return 'Less than 1 second';
        if (seconds < 60) return `${Math.round(seconds)} seconds`;

        const minutes = seconds / 60;
        if (minutes < 60) return `${Math.round(minutes)} minutes`;

        const hours = minutes / 60;
        if (hours < 24) return `${Math.round(hours)} hours`;

        const days = hours / 24;
        if (days < 365) return `${Math.round(days)} days`;

        const years = days / 365;
        if (years < 1000) return `${Math.round(years)} years`;

        const millennia = years / 1000;
        return `${millennia.toFixed(1)} millennia`;
    }

    updateUI(analysis) {
        this.updateStrengthMeter(analysis);
        this.updateScoreDisplay(analysis);
        this.updateRequirements(analysis);
        this.updateFeedback(analysis);
        this.updateStats(analysis);
    }

    updateStrengthMeter(analysis) {
        // Update progress bar
        this.strengthBar.style.width = `${analysis.score}%`;
        this.strengthBar.className = `meter-fill ${analysis.strength}`;

        // Update strength labels
        this.strengthLabels.forEach(label => {
            label.classList.remove('active');
            if (label.dataset.strength === analysis.strength) {
                label.classList.add('active');
            }
        });
    }

    updateScoreDisplay(analysis) {
        // Update score value
        this.scoreValue.textContent = analysis.score;
        
        // Update score circle color
        this.scoreCircle.className = `score-circle ${analysis.strength}`;
        
        // Update crack time and entropy
        this.crackTime.textContent = analysis.crackTime;
        this.entropyValue.textContent = `${analysis.entropy} bits`;
    }

    updateRequirements(analysis) {
        const requirements = {
            length: analysis.length >= 8,
            lowercase: analysis.hasLowercase,
            uppercase: analysis.hasUppercase,
            number: analysis.hasNumber,
            symbol: analysis.hasSymbol
        };

        Object.entries(requirements).forEach(([key, isValid]) => {
            const element = this.requirementElements[key];
            if (element) {
                element.classList.toggle('valid', isValid);
                const icon = element.querySelector('i');
                if (icon) {
                    icon.className = isValid ? 'fas fa-check' : 'fas fa-times';
                }
            }
        });
    }

    updateFeedback(analysis) {
        let message = '';
        let icon = 'fas fa-info-circle';

        if (analysis.score >= 80) {
            message = 'Excellent! Your password is highly secure';
            icon = 'fas fa-shield-alt';
        } else if (analysis.score >= 60) {
            message = 'Good password. Consider adding more complexity';
            icon = 'fas fa-thumbs-up';
        } else if (analysis.score >= 30) {
            message = 'Fair password. Add more character types for better security';
            icon = 'fas fa-exclamation-triangle';
        } else {
            message = 'Weak password. Consider using a longer password with more character types';
            icon = 'fas fa-exclamation-circle';
        }

        // Add specific suggestions
        const suggestions = [];
        if (!analysis.hasUppercase) suggestions.push('Add uppercase letters');
        if (!analysis.hasLowercase) suggestions.push('Add lowercase letters');
        if (!analysis.hasNumber) suggestions.push('Add numbers');
        if (!analysis.hasSymbol) suggestions.push('Add symbols');
        if (analysis.length < 8) suggestions.push('Use at least 8 characters');
        else if (analysis.length < 12) suggestions.push('Consider using 12+ characters');

        if (suggestions.length > 0 && analysis.score < 80) {
            message += `. Suggestions: ${suggestions.join(', ')}`;
        }

        this.feedbackMessage.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    }

    updateStats(analysis) {
        // Update basic stats
        this.lengthValue.textContent = analysis.length;
        
        // Calculate character set size
        let charsetSize = 0;
        if (analysis.hasLowercase) charsetSize += 26;
        if (analysis.hasUppercase) charsetSize += 26;
        if (analysis.hasNumber) charsetSize += 10;
        if (analysis.hasSymbol) charsetSize += 32;
        
        this.charsetValue.textContent = charsetSize || '0';
        
        // Update complexity
        this.complexityValue.textContent = this.getComplexityLabel(analysis.score);
    }

    getComplexityLabel(score) {
        if (score >= 80) return 'Very High';
        if (score >= 60) return 'High';
        if (score >= 30) return 'Medium';
        return 'Low';
    }

    resetUI() {
        // Reset strength meter
        this.strengthBar.style.width = '0%';
        this.strengthBar.className = 'meter-fill';
        
        // Reset score display
        this.scoreValue.textContent = '0';
        this.scoreCircle.className = 'score-circle';
        this.crackTime.textContent = 'Instant';
        this.entropyValue.textContent = '0 bits';
        
        // Reset requirements
        Object.values(this.requirementElements).forEach(element => {
            element.classList.remove('valid');
            const icon = element.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-times';
            }
        });
        
        // Reset strength labels
        this.strengthLabels.forEach(label => label.classList.remove('active'));
        
        // Reset feedback
        this.feedbackMessage.innerHTML = 
            '<i class="fas fa-info-circle"></i><span>Start typing to analyze your password strength</span>';
        
        // Reset stats
        this.lengthValue.textContent = '0';
        this.charsetValue.textContent = '0';
        this.complexityValue.textContent = 'Low';
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        
        const icon = this.togglePassword.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    async copyToClipboard() {
        if (!this.passwordInput.value) return;

        try {
            await navigator.clipboard.writeText(this.passwordInput.value);
            
            // Visual feedback
            const originalIcon = this.copyPassword.querySelector('i').className;
            this.copyPassword.querySelector('i').className = 'fas fa-check';
            
            setTimeout(() => {
                this.copyPassword.querySelector('i').className = originalIcon;
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy password:', err);
        }
    }

    resetPasswordField() {
        this.passwordInput.value = '';
        this.passwordInput.type = 'password';
        this.togglePassword.querySelector('i').className = 'fas fa-eye';
        this.resetUI();
        this.passwordInput.focus();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PasswordStrengthAnalyzer();
});