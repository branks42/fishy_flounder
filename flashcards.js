// Flashcards App JavaScript

class FlashcardsApp {
  constructor() {
    this.currentUnit = 1;
    this.currentCardIndex = 0;
    this.correctCount = 0;
    this.helpCount = 0;
    this.helpWords = [];
    this.askedForHelpOnCurrentCard = false;
    this.fireworksInterval = null;

    // Sample flashcard data for each unit
    this.flashcardData = {
      1: [
        "I",
        "have",
        "am",
        "my",
        "the",
        "we",
        "make",
        "to",
        "me",
        "like",
        "for",
        "he",
        "with",
        "is",
      ],
      2: [
        "go",
        "are",
        "of",
        "that",
        "you",
        "they",
        "from",
        "do",
        "two",
        "four",
        "three",
        "five",
        "here",
        "yellow",
        "one",
        "blue",
        "what",
        "green",
      ],
      3: [
        "come",
        "play",
        "how",
        "down",
        "away",
        "give",
        "funny",
        "any",
        "was",
        "were",
        "her",
        "said",
        "some",
        "little",
        "where",
      ],
      4: [
        "find",
        "over",
        "again",
        "pretty",
        "want",
        "brown",
        "open",
        "good",
        "white",
        "black",
        "every",
        "please",
        "all",
        "could",
        "now",
      ],
      5: [
        "saw",
        "our",
        "eat",
        "soon",
        "walk",
        "into",
        "too",
        "then",
        "out",
        "new",
        "there",
        "when",
        "who",
        "be",
        "so",
      ],
      6: [
        "God",
        "Jesus",
        "red",
        "orange",
        "purple",
        "gray",
        "pink",
        "blue",
        "yellow",
        "six",
        "ten",
        "five",
        "eight",
        "three",
        "seven",
        "nine",
        "four",
      ],
    };

    this.currentCards = [];
    this.initializeApp();
  }

  initializeApp() {
    this.bindEvents();
    this.showScreen("main-menu");
  }

  bindEvents() {
    // Unit selection buttons
    document.querySelectorAll(".unit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const unit = parseInt(e.target.dataset.unit);
        this.startUnit(unit);
      });
    });

    // Action buttons
    document.getElementById("need-help-btn").addEventListener("click", () => {
      if (!this.askedForHelpOnCurrentCard) {
        this.helpCount++;
        this.askedForHelpOnCurrentCard = true;
        this.helpWords.push(this.currentCards[this.currentCardIndex]);
      }
      this.handleNeedHelp();
    });

    document.getElementById("need-help-stat").addEventListener("click", () => {
      if (this.helpWords.length > 0) {
        this.startUnit(this.currentUnit, true);
      }
    });

    document.getElementById("got-it-btn").addEventListener("click", () => {
      this.handleGotIt();
    });

    // Navigation buttons
    document.getElementById("back-btn").addEventListener("click", () => {
      this.helpWords = [];
      this.showScreen("main-menu");
    });

    document.getElementById("return-menu-btn").addEventListener("click", () => {
      this.showScreen("main-menu");
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (this.getCurrentScreen() === "flashcard-screen") {
        if (e.key === "1" || e.key === "h" || e.key === "H") {
          this.handleNeedHelp();
        }
        // Spacebar for got it
        else if (e.key === " ") {
          this.handleGotIt();
        } else if (e.key === "Escape") {
          this.showScreen("main-menu");
        }
      }
    });
  }

  // Get available voices and select a preferred one

  startUnit(unitNumber, review = false) {
    this.currentUnit = unitNumber;
    this.currentCardIndex = 0;
    this.correctCount = 0;
    this.helpCount = 0;
    this.currentCards = [...this.flashcardData[unitNumber]];
    if (review) {
      this.currentCards = this.helpWords.length
        ? [...this.helpWords]
        : [...this.flashcardData[unitNumber]];
      this.helpWords = [];
    }

    // Shuffle the cards for variety
    this.shuffleArray(this.currentCards);
    let textContent = `Unit ${this.currentUnit}`;

    if (this.currentUnit === 6) {
      textContent = "Extras";
    }

    document.getElementById("unit-title").textContent = textContent;
    this.updateCard();
    this.showScreen("flashcard-screen");
  }

  updateCard() {
    const wordElement = document.getElementById("word");
    const counterElement = document.getElementById("card-counter");

    if (this.currentCardIndex < this.currentCards.length) {
      wordElement.textContent = this.currentCards[this.currentCardIndex];
      counterElement.textContent = `${this.currentCardIndex + 1} / ${
        this.currentCards.length
      }`;

      // Add subtle animation
      wordElement.style.opacity = "0";
      setTimeout(() => {
        wordElement.style.opacity = "1";
      }, 150);
    } else {
      this.showCompletionScreen();
    }
  }

  handleNeedHelp() {
    // Play Synthesized voice for the word
    const utterance = new SpeechSynthesisUtterance(
      this.currentCards[this.currentCardIndex].toLowerCase()
    );
    utterance.rate = 0.5; // Slightly slower for clarity
    utterance.pitch = 1.2; // Slightly higher pitch for friendliness
    speechSynthesis.speak(utterance);
  }

  handleGotIt() {
    if (!this.askedForHelpOnCurrentCard) {
      this.correctCount++;
    }
    // Play audio ding sound
    const audio = new Audio("sounds/ding.mp3");
    audio.volume = 0.3;
    audio.play();
    this.nextCard();
  }

  nextCard() {
    this.currentCardIndex++;
    this.askedForHelpOnCurrentCard = false;
    setTimeout(() => {
      this.updateCard();
    }, 200);
  }

  showCompletionScreen() {
    let unitComplete = false;
    // Only complete if correctCount is 2/3 or more of total cards
    if (this.correctCount >= (2 / 3) * this.currentCards.length) {
      unitComplete = true;
    }
    if (this.helpCount === 0) {
      this.helpWords = [];
      // Hide help stat div
      document.getElementById("need-help-stat").classList.add("hidden");
    } else {
      document.getElementById("need-help-stat").classList.remove("hidden");
    }
    document.getElementById("correct-count").textContent = this.correctCount;
    document.getElementById("help-count").textContent = this.helpCount;
    document.getElementById("completion-title").textContent = unitComplete
      ? "Unit Complete! 🎉"
      : "Try Again";
    document.getElementById("completion-message").textContent = unitComplete
      ? `Great job! You've completed Unit ${this.currentUnit}${
          this.helpCount === 0 ? " with a perfect score!" : "."
        }`
      : "Don't give up! Review the material and try again.";
    this.showScreen("completion-screen");
    if (unitComplete) {
      this.createFireworks();
      const audio = new Audio("sounds/mario.mp3");
      audio.volume = 0.4;
      audio.play();
    } else {
      // Optionally, play a try again sound or provide feedback
      const audio = new Audio("sounds/hold-on.mp3");
      audio.volume = 0.7;
      audio.play();
    }
  }

  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });

    // Show target screen
    document.getElementById(screenId).classList.add("active");

    // Clean up fireworks when leaving completion screen
    if (screenId !== "completion-screen") {
      this.removeFireworks();
    }
  }

  createFireworks() {
    // Remove any existing fireworks first
    this.removeFireworks();

    // Clear any existing interval
    if (this.fireworksInterval) {
      clearInterval(this.fireworksInterval);
    }

    const completionScreen = document.getElementById("completion-screen");

    // Function to create a new set of fireworks
    const createFireworkBurst = () => {
      // Create firework elements
      for (let i = 0; i < 3; i++) {
        const firework = document.createElement("div");
        firework.className = "firework";
        firework.style.top = Math.random() * 60 + 20 + "%";
        firework.style.left = Math.random() * 60 + 20 + "%";
        firework.style.animationDelay = i * 0.2 + "s";
        completionScreen.appendChild(firework);
      }

      // Create sparkle elements
      for (let i = 0; i < 4; i++) {
        const sparkle = document.createElement("div");
        sparkle.className = "sparkle";
        sparkle.style.top = Math.random() * 80 + 10 + "%";
        sparkle.style.left = Math.random() * 80 + 10 + "%";
        sparkle.style.animationDelay = i * 0.2 + "s";
        completionScreen.appendChild(sparkle);
      }

      // Remove old fireworks after their animation completes
      setTimeout(() => {
        const oldFireworks = completionScreen.querySelectorAll(
          ".firework, .sparkle"
        );
        // Only remove fireworks that are older than 2.5 seconds
        oldFireworks.forEach((fw) => {
          if (
            fw.style.animationDelay === "0s" ||
            parseFloat(fw.style.animationDelay) < 0.5
          ) {
            fw.remove();
          }
        });
      }, 2500);
    };

    // Create initial burst
    createFireworkBurst();

    // Create new fireworks every 1.5 seconds
    this.fireworksInterval = setInterval(() => {
      if (this.getCurrentScreen() === "completion-screen") {
        createFireworkBurst();
      } else {
        // Stop creating fireworks if screen changed
        clearInterval(this.fireworksInterval);
        this.fireworksInterval = null;
      }
    }, 1500);
  }

  removeFireworks() {
    // Clear the interval
    if (this.fireworksInterval) {
      clearInterval(this.fireworksInterval);
      this.fireworksInterval = null;
    }

    // Remove all firework elements
    const fireworks = document.querySelectorAll(".firework, .sparkle");
    fireworks.forEach((firework) => firework.remove());
  }

  getCurrentScreen() {
    const activeScreen = document.querySelector(".screen.active");
    return activeScreen ? activeScreen.id : null;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

// Enhanced animations and interactions
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the app
  const app = new FlashcardsApp();

  // Add ripple effect to buttons
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.classList.add("ripple");

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add CSS for ripple effect
  const style = document.createElement("style");
  style.textContent = `
        button {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .word {
            transition: opacity 0.3s ease;
        }
    `;
  document.head.appendChild(style);
});
