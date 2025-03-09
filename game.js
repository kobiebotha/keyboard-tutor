class TypingGame {
    constructor() {
        this.display = document.getElementById('display');
        this.easyModeBtn = document.getElementById('easyMode');
        this.hardModeBtn = document.getElementById('hardMode');
        this.scoreDisplay = document.getElementById('score');
        this.highScoreDisplay = document.getElementById('highScore');
        this.isEasyMode = true;
        this.colors = [
            '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB',
            '#B5EAD7', '#C7CEEA', '#E8E8E4', '#F2D5F8'
        ];
        this.audioCache = new Map();
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Hard mode properties
        this.currentWord = '';
        this.typedLetters = '';
        this.score = 0;
        this.highScore = 0;
        this.wordList = [
            // Basic sight words
            'the', 'and', 'was', 'for', 'are', 'but', 'not', 'you', 'all', 'any',
            // Common CVC words
            'cat', 'dog', 'pig', 'hat', 'mat', 'sit', 'run', 'fun', 'sun', 'map',
            // Colors and numbers
            'red', 'blue', 'pink', 'gray', 'five', 'nine', 'zero', 'four', 'gold', 'brown',
            // Animals
            'fish', 'bird', 'duck', 'frog', 'bear', 'deer', 'lion', 'wolf', 'seal', 'goat',
            // Objects
            'book', 'desk', 'lamp', 'door', 'wall', 'tree', 'star', 'moon', 'ship', 'boat',
            // Actions
            'jump', 'play', 'read', 'walk', 'skip', 'swim', 'sing', 'draw', 'talk', 'help',
            // Food and drinks
            'milk', 'cake', 'food', 'meat', 'soup', 'rice', 'bread', 'fruit', 'corn', 'fish',
            // Household
            'home', 'room', 'bed', 'chair', 'table', 'clock', 'phone', 'door', 'roof', 'yard',
            // Challenging first-grade words
            'because', 'friend', 'school', 'people', 'little', 'where', 'there', 'what', 'could', 'would',
            // More challenging words
            'through', 'thought', 'should', 'around', 'every', 'again', 'under', 'after', 'many', 'first'
        ];
        
        this.setupEventListeners();
        this.preloadAudio();
    }

    setupEventListeners() {
        document.addEventListener('keypress', (e) => this.handleKeyPress(e));
        
        this.easyModeBtn.addEventListener('click', () => {
            this.isEasyMode = true;
            this.updateModeButtons();
        });
        
        this.hardModeBtn.addEventListener('click', () => {
            this.isEasyMode = false;
            this.updateModeButtons();
            this.startNewWord();
        });
    }

    async preloadAudio() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        for (const letter of letters) {
            try {
                const response = await fetch(`/audio/${letter.toLowerCase()}.wav`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.audioCache.set(letter, audioBuffer);
            } catch (error) {
                console.warn(`Failed to preload audio for ${letter}:`, error);
            }
        }
    }

    async playWordSound(word) {
        console.log(word);
        // Play the entire word
        await new Promise(resolve => setTimeout(resolve, 500));
        const utterance = new SpeechSynthesisUtterance(word);
        window.speechSynthesis.speak(utterance);
        
    }

    startNewWord() {
        this.currentWord = this.wordList[Math.floor(Math.random() * this.wordList.length)];
        this.typedLetters = '';
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.isEasyMode) {
            return;
        }

        let displayContent = '';
        const wordArray = this.currentWord.split('');
        
        wordArray.forEach((letter, index) => {
            if (index < this.typedLetters.length) {
                // Show typed letters in green
                displayContent += `<span class="correct">${letter}</span>`;
            } else if (index === this.typedLetters.length) {
                // Highlight current letter to type
                displayContent += `<span class="current">${letter}</span>`;
            } else {
                // Show remaining letters in gray
                displayContent += `<span class="remaining">${letter}</span>`;
            }
        });

        this.display.innerHTML = displayContent;
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        this.highScoreDisplay.textContent = `High Score: ${this.highScore}`;
    }

    handleKeyPress(e) {
        if (this.isEasyMode) {
            this.handleEasyMode(e);
        } else {
            this.handleHardMode(e);
        }
    }

    handleEasyMode(e) {
        const key = e.key.toUpperCase();
        if (key.length === 1 && /[A-Z0-9]/.test(key)) {
            this.display.textContent = key;
            document.body.style.backgroundColor = 
                this.colors[Math.floor(Math.random() * this.colors.length)];
            this.display.classList.add('pressed');
            setTimeout(() => this.display.classList.remove('pressed'), 200);
            this.playLetterSound(key);
        }
    }

    handleHardMode(e) {
        const key = e.key.toLowerCase();
        const expectedLetter = this.currentWord[this.typedLetters.length];

        if (key === expectedLetter) {
            this.typedLetters += key;
            this.playLetterSound(key.toUpperCase());
            
            if (this.typedLetters === this.currentWord) {
                // Word completed successfully
                this.score++;
                this.highScore = Math.max(this.score, this.highScore);
                document.body.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
                

                this.playWordSound(this.currentWord);
                
                setTimeout(() => this.startNewWord(), 1500);
            }
        } else {
            // Wrong letter typed
            this.score = 0;
            document.body.style.backgroundColor = '#ffcdd2'; // Light red for error
            setTimeout(() => this.startNewWord(), 1000);
        }
        
        this.updateDisplay();
    }

    updateModeButtons() {
        this.easyModeBtn.classList.toggle('active', this.isEasyMode);
        this.hardModeBtn.classList.toggle('active', !this.isEasyMode);
        
        if (this.isEasyMode) {
            this.display.textContent = 'Press any key to start!';
            this.display.classList.add('start-message');
            this.scoreDisplay.style.display = 'none';
            this.highScoreDisplay.style.display = 'none';
        } else {
            this.display.classList.remove('start-message');
            this.scoreDisplay.style.display = 'block';
            this.highScoreDisplay.style.display = 'block';
            this.score = 0;
            this.updateDisplay();
        }
        
        document.body.style.backgroundColor = '#ffffff';
    }

    playLetterSound(key) {
        const buffer = this.audioCache.get(key);
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start();
        }
    }
}

// Initialize the game
const game = new TypingGame();