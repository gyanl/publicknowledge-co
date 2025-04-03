/**
 * Asterisk Animation Module
 * Creates an interactive asterisk animation with customizable properties
 */
class AsteriskAnimation {
  /**
   * Initialize the animation with configuration options
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Default configuration
    this.config = {
      initialLength: 35,
      initialWidth: 10,
      debounceDelay: 250,
      videoSource: 'radial-flowers.mp4',
      ...options
    };

    // Cache DOM elements
    this.elements = {
      arms: document.getElementById('arms'),
      length: document.getElementById('length'),
      width: document.getElementById('width'),
      rounded: document.getElementById('rounded'),
      offset: document.getElementById('offset'),
      speed: document.getElementById('speed'),
      video: document.getElementById('masked-video'),
      videoContainer: document.getElementById('video-container')
    };

    // Set video source if not already set
    if (this.elements.video && !this.elements.video.src) {
      this.elements.video.src = this.config.videoSource;
    }

    // Animation state
    this.state = {
      centerX: 0,
      centerY: 0,
      radius: 0,
      lastWidth: window.innerWidth,
      lastHeight: window.innerHeight,
      isSpinning: true
    };

    // Bind methods to preserve 'this' context
    this.handleResize = this.debounce(this.handleResize.bind(this), this.config.debounceDelay);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.updateAsterisk = this.updateAsterisk.bind(this);
    this.updateSpinAnimation = this.updateSpinAnimation.bind(this);

    // Initialize the animation
    this.init();
  }

  /**
   * Initialize the animation
   */
  init() {
    this.setupEventListeners();
    this.updateDimensions();
    this.updateAsterisk();
    this.updateSpinAnimation();
    this.updateValueDisplays();
    this.setupVideoAutoplay();
  }

  /**
   * Set up video autoplay with fallback
   */
  setupVideoAutoplay() {
    const video = this.elements.video;
    
    // Log video loading status
    video.addEventListener('loadeddata', () => {
      console.log('Video loaded successfully');
    });
    
    video.addEventListener('error', (e) => {
      console.error('Error loading video:', e);
    });
    
    // Try to play the video, with fallback for autoplay restrictions
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('Video playing successfully');
      }).catch(error => {
        console.warn('Autoplay prevented:', error);
        // Add a play button if autoplay is blocked
        this.addPlayButton();
      });
    }
  }

  /**
   * Add a play button if autoplay is blocked
   */
  addPlayButton() {
    const playButton = document.createElement('button');
    playButton.textContent = 'Play Video';
    playButton.style.position = 'fixed';
    playButton.style.bottom = '20px';
    playButton.style.left = '50%';
    playButton.style.transform = 'translateX(-50%)';
    playButton.style.zIndex = '10';
    playButton.style.padding = '10px 20px';
    playButton.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    playButton.style.border = 'none';
    playButton.style.borderRadius = '4px';
    playButton.style.cursor = 'pointer';
    
    playButton.addEventListener('click', () => {
      this.elements.video.play();
      playButton.remove();
    });
    
    document.body.appendChild(playButton);
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Window resize event
    window.addEventListener('resize', this.handleResize);

    // Input change events
    ['arms', 'length', 'width', 'offset'].forEach(id => {
      this.elements[id].addEventListener('input', () => {
        this.updateValue(id);
        this.updateAsterisk();
      });
    });

    // Rounded checkbox change event
    this.elements.rounded.addEventListener('change', this.updateAsterisk);

    // Speed input change event
    this.elements.speed.addEventListener('input', () => {
      this.updateValue('speed', 's');
      this.updateSpinAnimation();
    });

    // Scroll event
    window.addEventListener('scroll', this.handleScroll);

    // Mouse move event
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  /**
   * Handle window resize events
   */
  handleResize() {
    if (window.innerWidth !== this.state.lastWidth || 
        window.innerHeight !== this.state.lastHeight) {
      this.state.lastWidth = window.innerWidth;
      this.state.lastHeight = window.innerHeight;
      this.updateDimensions();
    }
  }

  /**
   * Handle mouse move events
   */
  handleMouseMove(e) {
    const posX = (e.clientX / window.innerWidth) * 100;
    this.elements.offset.value = Math.round(posX);
    this.updateValue('offset', '%');
    this.updateAsterisk();
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    const scrollProgress = Math.min(window.scrollY / (window.innerHeight * 2), 1);
    
    const newLength = this.config.initialLength + (100 - this.config.initialLength) * scrollProgress;
    const newWidth = this.config.initialWidth + (1500 - this.config.initialWidth) * scrollProgress;
    
    this.elements.length.value = Math.round(newLength);
    this.elements.width.value = Math.round(newWidth);
    
    this.updateValue('length', '%');
    this.updateValue('width', 'px');
    
    this.updateAsterisk();
  }

  /**
   * Update dimensions based on window size
   */
  updateDimensions() {
    this.state.centerX = window.innerWidth / 2;
    this.state.centerY = window.innerHeight / 2;
    this.state.radius = Math.min(this.state.centerX, this.state.centerY);
    this.updateAsterisk();
  }

  /**
   * Update the asterisk shape using CSS clip-path
   */
  updateAsterisk() {
    try {
      const container = this.elements.videoContainer;
      if (!container) return;

      const arms = parseInt(this.elements.arms.value) || 6;
      const lengthPercent = (parseInt(this.elements.length.value) || 30) / 100;
      const width = parseInt(this.elements.width.value) || 10;
      const offset = parseInt(this.elements.offset.value) || 0;
      
      // Create the clip-path polygon points for the asterisk
      let points = [];
      for (let i = 0; i < arms; i++) {
        const angle = (2 * Math.PI / arms) * i;
        const startX = this.state.centerX + offset * Math.cos(angle);
        const startY = this.state.centerY + offset * Math.sin(angle);
        const endX = this.state.centerX + (this.state.radius * lengthPercent) * Math.cos(angle);
        const endY = this.state.centerY + (this.state.radius * lengthPercent) * Math.sin(angle);
        
        // Add points for a line segment
        points.push(`${startX}px ${startY}px`);
        points.push(`${endX}px ${endY}px`);
      }
      
      // Create the clip-path polygon
      const clipPath = `polygon(${points.join(', ')})`;
      
      // Apply the clip-path
      container.style.clipPath = clipPath;
      container.style.webkitClipPath = clipPath;
      
    } catch (error) {
      console.error('Error updating clipPath:', error);
    }
  }

  /**
   * Update the spin animation
   */
  updateSpinAnimation() {
    const container = this.elements.videoContainer;
    if (!container) return;

    const speed = parseInt(this.elements.speed.value);
    if (speed === 0) {
      container.style.animation = 'none';
    } else {
      container.style.animation = `rotate ${21 - speed}s linear infinite`;
    }
  }

  /**
   * Update the value display for an input
   */
  updateValue(inputId, suffix = '') {
    const valueElement = document.getElementById(`${inputId}-value`);
    if (valueElement) {
      valueElement.textContent = this.elements[inputId].value + suffix;
    }
  }

  /**
   * Update all value displays
   */
  updateValueDisplays() {
    ['arms', 'length', 'width', 'offset'].forEach(id => {
      this.updateValue(id);
    });
    this.updateValue('speed', 's');
  }

  /**
   * Debounce function to limit how often a function can be called
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize the animation when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AsteriskAnimation();
});
