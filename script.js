class PasswordGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.passwordHistory = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        this.savedPasswords = JSON.parse(localStorage.getItem('savedPasswords') || '[]');
        this.favourites = JSON.parse(localStorage.getItem('favourites') || '[]');
        this.stats = JSON.parse(localStorage.getItem('passwordStats') || '{"totalGenerated": 0, "totalScore": 0, "strongestPassword": "", "strongestScore": 0}');
        this.currentPattern = 'random';
        this.currentCategory = null;
        this.customCharset = '';
        this.updateHistoryDisplay();
        this.updateSavedPasswordsDisplay();
        this.updateFavouritesDisplay();
        this.updateStats();
        this.generatePassword();
    }

    initializeElements() {
        // Main elements
        this.passwordOutput = document.getElementById('passwordOutput');
        this.copyBtn = document.getElementById('copyBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.favouriteBtn = document.getElementById('favouriteBtn');
        this.generateBtn = document.getElementById('generateBtn');
        this.generateMultipleBtn = document.getElementById('generateMultipleBtn');
        this.savePasswordBtn = document.getElementById('savePasswordBtn');
        this.lengthSlider = document.getElementById('passwordLength');
        this.lengthValue = document.getElementById('lengthValue');
        this.strengthIndicator = document.getElementById('strengthIndicator');
        this.strengthText = document.getElementById('strengthText');
        this.entropyInfo = document.getElementById('entropyInfo');
        this.crackTime = document.getElementById('crackTime');
        this.historyList = document.getElementById('historyList');
        this.savedList = document.getElementById('savedList');
        this.favouritesList = document.getElementById('favouritesList');
        
        // Theme controls
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.exportSettings = document.getElementById('exportSettings');
        
        // Checkboxes
        this.uppercase = document.getElementById('uppercase');
        this.lowercase = document.getElementById('lowercase');
        this.numbers = document.getElementById('numbers');
        this.symbols = document.getElementById('symbols');
        this.excludeSimilar = document.getElementById('excludeSimilar');
        this.excludeAmbiguous = document.getElementById('excludeAmbiguous');
        
        // Custom charset
        this.customChars = document.getElementById('customChars');
        this.useCustomChars = document.getElementById('useCustomChars');
        
        // Stats elements
        this.totalGenerated = document.getElementById('totalGenerated');
        this.avgStrength = document.getElementById('avgStrength');
        this.strongestPassword = document.getElementById('strongestPassword');
        this.savedCount = document.getElementById('savedCount');
        this.favouritesCount = document.getElementById('favouritesCount');
        
        // Modal elements
        this.modal = document.getElementById('multipleModal');
        this.saveModal = document.getElementById('saveModal');
        this.closeModal = document.getElementById('closeModal');
        this.closeSaveModal = document.getElementById('closeSaveModal');
        this.passwordCount = document.getElementById('passwordCount');
        this.multiplePasswords = document.getElementById('multiplePasswords');
        this.copyAllBtn = document.getElementById('copyAllBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        // Save modal elements
        this.passwordName = document.getElementById('passwordName');
        this.passwordUsername = document.getElementById('passwordUsername');
        this.passwordCategory = document.getElementById('passwordCategory');
        this.passwordNotes = document.getElementById('passwordNotes');
        this.savePasswordConfirm = document.getElementById('savePasswordConfirm');
        this.cancelSave = document.getElementById('cancelSave');
    }

    bindEvents() {
        // Main functionality
        this.generateBtn.addEventListener('click', () => this.generatePassword());
        this.refreshBtn.addEventListener('click', () => this.generatePassword());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.favouriteBtn.addEventListener('click', () => this.toggleFavourite());
        this.generateMultipleBtn.addEventListener('click', () => this.openMultipleModal());
        this.savePasswordBtn.addEventListener('click', () => this.openSaveModal());
        
        // Theme controls
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        this.exportSettings.addEventListener('click', () => this.exportSettingsToFile());
        
        // Length slider
        this.lengthSlider.addEventListener('input', (e) => {
            this.lengthValue.textContent = e.target.value;
            this.generatePassword();
        });
        
        // Checkbox changes
        [this.uppercase, this.lowercase, this.numbers, this.symbols, this.excludeSimilar, this.excludeAmbiguous].forEach(checkbox => {
            checkbox.addEventListener('change', () => this.generatePassword());
        });
        
        // Custom charset
        this.useCustomChars.addEventListener('click', () => this.useCustomCharset());
        
        // Pattern buttons
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPattern = e.target.dataset.pattern;
                this.generatePassword();
            });
        });
        
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.applyCategorySettings();
            });
        });
        
        // Modal functionality
        this.closeModal.addEventListener('click', () => this.closeMultipleModal());
        this.closeSaveModal.addEventListener('click', () => this.closeSaveModal());
        this.cancelSave.addEventListener('click', () => this.closeSaveModal());
        this.passwordCount.addEventListener('input', () => this.generateMultiplePasswords());
        this.copyAllBtn.addEventListener('click', () => this.copyAllPasswords());
        this.downloadBtn.addEventListener('click', () => this.downloadPasswords());
        this.savePasswordConfirm.addEventListener('click', () => this.savePassword());
        
        // Close modals when clicking outside
        [this.modal, this.saveModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'g':
                        e.preventDefault();
                        this.generatePassword();
                        break;
                    case 'c':
                        if (document.activeElement === this.passwordOutput) {
                            e.preventDefault();
                            this.copyToClipboard();
                        }
                        break;
                    case 'r':
                        e.preventDefault();
                        this.generatePassword();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.toggleFavourite();
                        break;
                }
            }
        });
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('passwordSettings') || '{}');
        if (settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    toggleDarkMode() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            this.darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('passwordSettings', JSON.stringify({...JSON.parse(localStorage.getItem('passwordSettings') || '{}'), darkMode: false}));
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('passwordSettings', JSON.stringify({...JSON.parse(localStorage.getItem('passwordSettings') || '{}'), darkMode: true}));
        }
    }

    toggleFavourite() {
        const currentPassword = this.passwordOutput.value;
        if (!currentPassword) {
            this.showError('No password to favourite');
            return;
        }

        const existingIndex = this.favourites.findIndex(fav => fav.password === currentPassword);
        
        if (existingIndex !== -1) {
            // Remove from favourites
            this.favourites.splice(existingIndex, 1);
            this.favouriteBtn.classList.remove('favourited');
            this.showSuccess('Removed from favourites');
        } else {
            // Add to favourites
            const strength = this.calculatePasswordStrength(currentPassword);
            const favourite = {
                id: Date.now(),
                password: currentPassword,
                strength: strength.level,
                score: strength.score,
                timestamp: new Date().toISOString(),
                pattern: this.currentPattern,
                length: this.lengthSlider.value
            };
            
            this.favourites.unshift(favourite);
            this.favouriteBtn.classList.add('favourited');
            this.showSuccess('Added to favourites!');
        }
        
        localStorage.setItem('favourites', JSON.stringify(this.favourites));
        this.updateFavouritesDisplay();
        this.updateStats();
        this.updateFavouriteButtonState();
    }

    updateFavouriteButtonState() {
        const currentPassword = this.passwordOutput.value;
        const isFavourited = this.favourites.some(fav => fav.password === currentPassword);
        
        if (isFavourited) {
            this.favouriteBtn.classList.add('favourited');
        } else {
            this.favouriteBtn.classList.remove('favourited');
        }
    }

    updateFavouritesDisplay() {
        if (this.favourites.length === 0) {
            this.favouritesList.innerHTML = '<p style="color: #666; font-style: italic;">No favourite passwords yet</p>';
            return;
        }
        
        this.favouritesList.innerHTML = this.favourites.map(item => `
            <div class="favourite-item">
                <div class="favourite-info">
                    <div class="favourite-password">${item.password}</div>
                    <div class="favourite-strength">Strength: ${item.strength} (${item.score}/100)</div>
                </div>
                <div class="favourite-actions">
                    <button class="favourite-copy" onclick="passwordGenerator.copyFavouritePassword('${item.password}')" title="Copy password">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="favourite-remove" onclick="passwordGenerator.removeFavourite(${item.id})" title="Remove from favourites">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    copyFavouritePassword(password) {
        navigator.clipboard.writeText(password).then(() => {
            this.showSuccess('Favourite password copied!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = password;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Favourite password copied!');
        });
    }

    removeFavourite(id) {
        if (confirm('Remove this password from favourites?')) {
            this.favourites = this.favourites.filter(fav => fav.id !== id);
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
            this.updateFavouritesDisplay();
            this.updateStats();
            this.updateFavouriteButtonState();
            this.showSuccess('Removed from favourites');
        }
    }

    exportSettingsToFile() {
        const settings = {
            length: this.lengthSlider.value,
            uppercase: this.uppercase.checked,
            lowercase: this.lowercase.checked,
            numbers: this.numbers.checked,
            symbols: this.symbols.checked,
            excludeSimilar: this.excludeSimilar.checked,
            excludeAmbiguous: this.excludeAmbiguous.checked,
            pattern: this.currentPattern,
            customCharset: this.customCharset
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `password_settings_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Settings exported successfully!');
    }

    applyCategorySettings() {
        const categorySettings = {
            social: { length: 16, symbols: true, excludeSimilar: true },
            email: { length: 20, symbols: true, excludeSimilar: true },
            banking: { length: 24, symbols: true, excludeSimilar: true, excludeAmbiguous: true },
            work: { length: 18, symbols: true, excludeSimilar: true },
            gaming: { length: 16, symbols: false, excludeSimilar: false },
            crypto: { length: 32, symbols: true, excludeSimilar: false, excludeAmbiguous: false }
        };
        
        const settings = categorySettings[this.currentCategory];
        if (settings) {
            this.lengthSlider.value = settings.length;
            this.lengthValue.textContent = settings.length;
            this.symbols.checked = settings.symbols;
            this.excludeSimilar.checked = settings.excludeSimilar;
            this.excludeAmbiguous.checked = settings.excludeAmbiguous || false;
            this.generatePassword();
        }
    }

    useCustomCharset() {
        this.customCharset = this.customChars.value.trim();
        if (this.customCharset) {
            this.generatePassword();
            this.showSuccess('Custom character set applied!');
        } else {
            this.showError('Please enter custom characters');
        }
    }

    generatePassword() {
        const length = parseInt(this.lengthSlider.value);
        const options = this.getSelectedOptions();
        
        if (!this.hasValidOptions(options)) {
            this.showError('Please select at least one character type');
            return;
        }
        
        let password = '';
        
        switch (this.currentPattern) {
            case 'memorable':
                password = this.generateMemorablePassword(length);
                break;
            case 'pronounceable':
                password = this.generatePronounceablePassword(length);
                break;
            case 'pin':
                password = this.generatePIN(length);
                break;
            case 'phrase':
                password = this.generatePassphrase(length);
                break;
            default:
                password = this.generateRandomPassword(length, options);
        }
        
        this.passwordOutput.value = password;
        this.updateStrengthIndicator(password);
        this.updateEntropyInfo(password);
        this.addToHistory(password);
        this.updateStats();
        this.updateFavouriteButtonState();
        
        // Add success animation
        this.passwordOutput.classList.add('success-animation');
        setTimeout(() => {
            this.passwordOutput.classList.remove('success-animation');
        }, 500);
    }

    generateRandomPassword(length, options) {
        let charset = this.customCharset || this.buildCharset(options);
        let password = '';
        
        // Ensure at least one character from each selected type
        if (!this.customCharset) {
            password += this.getRequiredCharacters(options);
        }
        
        // Fill the rest randomly
        const remainingLength = length - password.length;
        for (let i = 0; i < remainingLength; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }
        
        return this.shuffleString(password);
    }

    generateMemorablePassword(length) {
        const words = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'garden', 'house', 'island', 'jungle', 'knight', 'lemon', 'mountain', 'ocean', 'planet', 'queen', 'river', 'star', 'tiger', 'universe', 'village', 'water', 'xylophone', 'yellow', 'zebra'];
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        
        let password = '';
        const wordCount = Math.floor(length / 4);
        
        for (let i = 0; i < wordCount; i++) {
            const word = words[Math.floor(Math.random() * words.length)];
            password += word.charAt(0).toUpperCase() + word.slice(1);
            password += numbers[Math.floor(Math.random() * numbers.length)];
            password += symbols[Math.floor(Math.random() * symbols.length)];
        }
        
        return password.slice(0, length);
    }

    generatePronounceablePassword(length) {
        const consonants = 'bcdfghjklmnpqrstvwxyz';
        const vowels = 'aeiou';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            if (i % 2 === 0) {
                password += consonants[Math.floor(Math.random() * consonants.length)];
            } else {
                password += vowels[Math.floor(Math.random() * vowels.length)];
            }
        }
        
        return password;
    }

    generatePIN(length) {
        const digits = '0123456789';
        let pin = '';
        for (let i = 0; i < length; i++) {
            pin += digits[Math.floor(Math.random() * digits.length)];
        }
        return pin;
    }

    generatePassphrase(length) {
        const words = ['correct', 'horse', 'battery', 'staple', 'security', 'password', 'strong', 'random', 'unique', 'complex', 'secure', 'private', 'personal', 'digital', 'online', 'account', 'login', 'access', 'protect', 'defend', 'guard', 'shield', 'safeguard', 'preserve', 'maintain'];
        let phrase = '';
        
        while (phrase.length < length) {
            const word = words[Math.floor(Math.random() * words.length)];
            if (phrase.length + word.length <= length) {
                phrase += (phrase ? ' ' : '') + word;
            } else {
                break;
            }
        }
        
        return phrase;
    }

    updateEntropyInfo(password) {
        const charset = this.getCharsetFromPassword(password);
        const entropy = Math.log2(Math.pow(charset.length, password.length));
        this.entropyInfo.textContent = `Entropy: ${entropy.toFixed(1)} bits`;
        
        // Calculate crack time
        const crackTime = this.calculateCrackTime(entropy);
        this.crackTime.textContent = `Crack time: ${crackTime}`;
    }

    getCharsetFromPassword(password) {
        let charset = new Set();
        for (let char of password) {
            if (/[A-Z]/.test(char)) charset.add('uppercase');
            else if (/[a-z]/.test(char)) charset.add('lowercase');
            else if (/\d/.test(char)) charset.add('numbers');
            else charset.add('symbols');
        }
        
        const charsetSizes = {
            'uppercase': 26,
            'lowercase': 26,
            'numbers': 10,
            'symbols': 32
        };
        
        return Array.from(charset).reduce((total, type) => total + charsetSizes[type], 0);
    }

    calculateCrackTime(entropy) {
        const attemptsPerSecond = 1000000000; // 1 billion attempts per second
        const totalAttempts = Math.pow(2, entropy - 1);
        const seconds = totalAttempts / attemptsPerSecond;
        
        if (seconds < 1) return 'Instant';
        if (seconds < 60) return `${Math.round(seconds)} seconds`;
        if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
        if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
        return `${Math.round(seconds / 31536000)} years`;
    }

    getSelectedOptions() {
        return {
            uppercase: this.uppercase.checked,
            lowercase: this.lowercase.checked,
            numbers: this.numbers.checked,
            symbols: this.symbols.checked,
            excludeSimilar: this.excludeSimilar.checked,
            excludeAmbiguous: this.excludeAmbiguous.checked
        };
    }

    hasValidOptions(options) {
        return options.uppercase || options.lowercase || options.numbers || options.symbols || this.customCharset;
    }

    buildCharset(options) {
        let charset = '';
        
        if (options.uppercase) {
            charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        if (options.lowercase) {
            charset += 'abcdefghijklmnopqrstuvwxyz';
        }
        if (options.numbers) {
            charset += '0123456789';
        }
        if (options.symbols) {
            charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        }
        
        // Exclude similar characters
        if (options.excludeSimilar) {
            charset = charset.replace(/[l1IO0]/g, '');
        }
        
        // Exclude ambiguous characters
        if (options.excludeAmbiguous) {
            charset = charset.replace(/[{}[\]|\\/]/g, '');
        }
        
        return charset;
    }

    getRequiredCharacters(options) {
        let required = '';
        
        if (options.uppercase) {
            required += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        }
        if (options.lowercase) {
            required += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        }
        if (options.numbers) {
            required += '0123456789'[Math.floor(Math.random() * 10)];
        }
        if (options.symbols) {
            required += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 30)];
        }
        
        return required;
    }

    shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    updateStrengthIndicator(password) {
        const strength = this.calculatePasswordStrength(password);
        
        // Remove existing classes
        this.strengthIndicator.className = 'strength-indicator';
        
        // Add appropriate class and text
        this.strengthIndicator.classList.add(strength.level);
        this.strengthText.textContent = `Strength: ${strength.level.charAt(0).toUpperCase() + strength.level.slice(1)}`;
        
        // Add score details
        this.strengthText.title = `Score: ${strength.score}/100\n${strength.feedback.join('\n')}`;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        const feedback = [];
        
        // Length contribution
        if (password.length >= 12) {
            score += 25;
            feedback.push('✓ Good length (12+ characters)');
        } else if (password.length >= 8) {
            score += 15;
            feedback.push('⚠ Minimum length (8 characters)');
        } else {
            feedback.push('✗ Too short');
        }
        
        // Character variety
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
        
        const varietyCount = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
        
        if (varietyCount >= 4) {
            score += 30;
            feedback.push('✓ All character types included');
        } else if (varietyCount >= 3) {
            score += 20;
            feedback.push('✓ Good character variety');
        } else if (varietyCount >= 2) {
            score += 10;
            feedback.push('⚠ Limited character variety');
        } else {
            feedback.push('✗ Poor character variety');
        }
        
        // Complexity
        if (hasUppercase) score += 10;
        if (hasLowercase) score += 10;
        if (hasNumbers) score += 10;
        if (hasSymbols) score += 15;
        
        // Entropy (randomness)
        const uniqueChars = new Set(password).size;
        const entropy = uniqueChars / password.length;
        
        if (entropy > 0.8) {
            score += 10;
            feedback.push('✓ High entropy (good randomness)');
        } else if (entropy > 0.6) {
            score += 5;
            feedback.push('⚠ Moderate entropy');
        } else {
            feedback.push('✗ Low entropy (repetitive)');
        }
        
        // Determine level
        let level;
        if (score >= 80) level = 'strong';
        else if (score >= 60) level = 'good';
        else if (score >= 40) level = 'fair';
        else level = 'weak';
        
        return { score, level, feedback };
    }

    async copyToClipboard() {
        const password = this.passwordOutput.value;
        if (!password) return;
        
        try {
            await navigator.clipboard.writeText(password);
            this.showSuccess('Password copied to clipboard!');
            
            // Visual feedback
            this.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            this.passwordOutput.select();
            document.execCommand('copy');
            this.showSuccess('Password copied to clipboard!');
        }
    }

    addToHistory(password) {
        // Remove if already exists
        this.passwordHistory = this.passwordHistory.filter(p => p.password !== password);
        
        // Add to beginning
        this.passwordHistory.unshift({
            password,
            timestamp: new Date().toISOString(),
            strength: this.calculatePasswordStrength(password).level
        });
        
        // Keep only last 10 passwords
        if (this.passwordHistory.length > 10) {
            this.passwordHistory = this.passwordHistory.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('passwordHistory', JSON.stringify(this.passwordHistory));
        
        // Update display
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (this.passwordHistory.length === 0) {
            this.historyList.innerHTML = '<p style="color: #666; font-style: italic;">No passwords generated yet</p>';
            return;
        }
        
        this.historyList.innerHTML = this.passwordHistory.map(item => `
            <div class="history-item">
                <span class="history-password">${item.password}</span>
                <button class="history-copy" onclick="passwordGenerator.copyHistoryPassword('${item.password}')">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `).join('');
    }

    copyHistoryPassword(password) {
        navigator.clipboard.writeText(password).then(() => {
            this.showSuccess('Password copied!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = password;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Password copied!');
        });
    }

    openSaveModal() {
        this.saveModal.style.display = 'block';
        this.passwordName.focus();
    }

    closeSaveModal() {
        this.saveModal.style.display = 'none';
        this.passwordName.value = '';
        this.passwordUsername.value = '';
        this.passwordCategory.value = 'other';
        this.passwordNotes.value = '';
    }

    savePassword() {
        const name = this.passwordName.value.trim();
        const username = this.passwordUsername.value.trim();
        const category = this.passwordCategory.value;
        const notes = this.passwordNotes.value.trim();
        const password = this.passwordOutput.value;
        
        if (!name || !password) {
            this.showError('Please enter a name and generate a password');
            return;
        }
        
        const savedPassword = {
            id: Date.now(),
            name,
            username,
            category,
            notes,
            password,
            timestamp: new Date().toISOString(),
            strength: this.calculatePasswordStrength(password).level
        };
        
        this.savedPasswords.unshift(savedPassword);
        localStorage.setItem('savedPasswords', JSON.stringify(this.savedPasswords));
        
        this.updateSavedPasswordsDisplay();
        this.updateStats();
        this.closeSaveModal();
        this.showSuccess('Password saved successfully!');
    }

    updateSavedPasswordsDisplay() {
        if (this.savedPasswords.length === 0) {
            this.savedList.innerHTML = '<p style="color: #666; font-style: italic;">No saved passwords yet</p>';
            return;
        }
        
        this.savedList.innerHTML = this.savedPasswords.map(item => `
            <div class="saved-item">
                <div class="saved-info">
                    <div class="saved-name">${item.name}</div>
                    ${item.username ? `<div class="saved-username">${item.username}</div>` : ''}
                    <div class="saved-password">${item.password}</div>
                    <div class="saved-category">${item.category}</div>
                </div>
                <div class="saved-actions">
                    <button class="saved-copy" onclick="passwordGenerator.copySavedPassword('${item.password}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="saved-delete" onclick="passwordGenerator.deleteSavedPassword(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    copySavedPassword(password) {
        navigator.clipboard.writeText(password).then(() => {
            this.showSuccess('Password copied!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = password;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Password copied!');
        });
    }

    deleteSavedPassword(id) {
        if (confirm('Are you sure you want to delete this saved password?')) {
            this.savedPasswords = this.savedPasswords.filter(p => p.id !== id);
            localStorage.setItem('savedPasswords', JSON.stringify(this.savedPasswords));
            this.updateSavedPasswordsDisplay();
            this.updateStats();
            this.showSuccess('Password deleted!');
        }
    }

    updateStats() {
        this.stats.totalGenerated++;
        const currentStrength = this.calculatePasswordStrength(this.passwordOutput.value);
        this.stats.totalScore += currentStrength.score;
        
        if (currentStrength.score > this.stats.strongestScore) {
            this.stats.strongestScore = currentStrength.score;
            this.stats.strongestPassword = this.passwordOutput.value;
        }
        
        localStorage.setItem('passwordStats', JSON.stringify(this.stats));
        
        this.totalGenerated.textContent = this.stats.totalGenerated;
        this.avgStrength.textContent = `${Math.round(this.stats.totalScore / this.stats.totalGenerated)}%`;
        this.strongestPassword.textContent = this.stats.strongestPassword || '-';
        this.savedCount.textContent = this.savedPasswords.length;
        this.favouritesCount.textContent = this.favourites.length;
    }

    openMultipleModal() {
        this.modal.style.display = 'block';
        this.generateMultiplePasswords();
    }

    closeMultipleModal() {
        this.modal.style.display = 'none';
    }

    generateMultiplePasswords() {
        const count = parseInt(this.passwordCount.value) || 5;
        const passwords = [];
        
        for (let i = 0; i < count; i++) {
            const length = parseInt(this.lengthSlider.value);
            const options = this.getSelectedOptions();
            
            if (!this.hasValidOptions(options)) {
                this.showError('Please select at least one character type');
                return;
            }
            
            let password = '';
            
            switch (this.currentPattern) {
                case 'memorable':
                    password = this.generateMemorablePassword(length);
                    break;
                case 'pronounceable':
                    password = this.generatePronounceablePassword(length);
                    break;
                case 'pin':
                    password = this.generatePIN(length);
                    break;
                case 'phrase':
                    password = this.generatePassphrase(length);
                    break;
                default:
                    password = this.generateRandomPassword(length, options);
            }
            
            passwords.push(password);
        }
        
        this.multiplePasswords.innerHTML = passwords.map((password, index) => `
            <div class="password-item">
                <span>${index + 1}. ${password}</span>
                <button onclick="passwordGenerator.copyMultiplePassword('${password}')">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `).join('');
    }

    copyMultiplePassword(password) {
        navigator.clipboard.writeText(password).then(() => {
            this.showSuccess('Password copied!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = password;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Password copied!');
        });
    }

    copyAllPasswords() {
        const passwordElements = this.multiplePasswords.querySelectorAll('.password-item span');
        const passwords = Array.from(passwordElements).map(el => el.textContent.split('. ')[1]);
        
        const text = passwords.join('\n');
        
        navigator.clipboard.writeText(text).then(() => {
            this.showSuccess('All passwords copied!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('All passwords copied!');
        });
    }

    downloadPasswords() {
        const passwordElements = this.multiplePasswords.querySelectorAll('.password-item span');
        const passwords = Array.from(passwordElements).map(el => el.textContent.split('. ')[1]);
        
        const text = passwords.join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `passwords_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Passwords downloaded!');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 'background: #00b894;' : 'background: #ff6b6b;'}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the password generator when the page loads
let passwordGenerator;
document.addEventListener('DOMContentLoaded', () => {
    passwordGenerator = new PasswordGenerator();
}); 