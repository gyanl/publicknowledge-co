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
      initialLength: 18,
      initialWidth: 16,
      debounceDelay: 250,
      videoSource: 'radial-flowers.mp4',
      ...options
    };

    // Cache DOM elements
    this.elements = {
      arms: document.getElementById('arms'),
      length: document.getElementById('length'),
      width: document.getElementById('width'),
      video: document.getElementById('masked-video'),
      videoContainer: document.getElementById('video-container'),
      clipPathWrapper: document.getElementById('clip-path-wrapper')
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
      lastHeight: window.innerHeight
    };

    // Bind methods to preserve 'this' context
    this.handleResize = this.debounce(this.handleResize.bind(this), this.config.debounceDelay);
    this.handleScroll = this.handleScroll.bind(this);
    this.updateAsterisk = this.updateAsterisk.bind(this);

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
        // this.addPlayButton();
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
    ['arms', 'length', 'width'].forEach(id => {
      this.elements[id].addEventListener('input', () => {
        this.updateValue(id);
        this.updateAsterisk();
      });
    });

    // Scroll event
    window.addEventListener('scroll', this.handleScroll);
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
   * Handle scroll events
   */
  handleScroll() {
    const scrollProgress = Math.min(window.scrollY / (window.innerHeight * 2), 1);

    const newLength = this.config.initialLength + (200 - this.config.initialLength) * scrollProgress;
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
      const wrapper = this.elements.clipPathWrapper;
      if (!wrapper) return;

      const arms = parseInt(this.elements.arms.value) || 6;
      const lengthPercent = (parseInt(this.elements.length.value) || 30) / 50;
      const width = parseInt(this.elements.width.value) || 10;

      // Create the clip-path polygon points for the asterisk
      let points = [];

      // Add center point
      points.push(`${this.state.centerX}px ${this.state.centerY}px`);

      // Create arms for the asterisk
      for (let i = 0; i < arms; i++) {
        const angle = (2 * Math.PI / arms) * i;

        // Calculate start point (at center)
        const startX = this.state.centerX;
        const startY = this.state.centerY;

        // Calculate end point (at the full length)
        const endX = this.state.centerX + (this.state.radius * lengthPercent) * Math.cos(angle);
        const endY = this.state.centerY + (this.state.radius * lengthPercent) * Math.sin(angle);

        // Calculate control points for the width of the arm
        const perpAngle = angle + Math.PI / 2;
        const halfWidth = width / 2;

        const controlX1 = startX + halfWidth * Math.cos(perpAngle);
        const controlY1 = startY + halfWidth * Math.sin(perpAngle);

        const controlX2 = endX + halfWidth * Math.cos(perpAngle);
        const controlY2 = endY + halfWidth * Math.sin(perpAngle);

        const controlX3 = endX - halfWidth * Math.cos(perpAngle);
        const controlY3 = endY - halfWidth * Math.sin(perpAngle);

        const controlX4 = startX - halfWidth * Math.cos(perpAngle);
        const controlY4 = startY - halfWidth * Math.sin(perpAngle);

        // Add points to create a filled arm
        points.push(`${controlX1}px ${controlY1}px`);
        points.push(`${controlX2}px ${controlY2}px`);
        points.push(`${controlX3}px ${controlY3}px`);
        points.push(`${controlX4}px ${controlY4}px`);
      }

      // Create the clip-path polygon
      const clipPath = `polygon(${points.join(', ')})`;

      // Apply the clip-path to the wrapper
      wrapper.style.clipPath = clipPath;
      wrapper.style.webkitClipPath = clipPath;

      // Apply the clip-path to the video container
      this.elements.videoContainer.style.clipPath = clipPath;
      this.elements.videoContainer.style.webkitClipPath = clipPath;

    } catch (error) {
      console.error('Error updating clipPath:', error);
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
    ['arms', 'length', 'width'].forEach(id => {
      this.updateValue(id);
    });
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


