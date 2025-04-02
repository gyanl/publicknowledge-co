const armsInput = document.getElementById('arms');
const lengthInput = document.getElementById('length');
const widthInput = document.getElementById('width');
const roundedInput = document.getElementById('rounded');
const offsetInput = document.getElementById('offset');
const linesGroup = document.getElementById('asterisk-lines');
const maskSvg = document.getElementById('mask-svg');
const speedInput = document.getElementById('speed');
const video = document.getElementById('masked-video');
let centerX, centerY, radius;
let isSpinning = true;
let initialLength = 35;
let initialWidth = 10;

// Initialize video source
video.src = 'your-video.mp4';

// Add this debounce function at the top of the file
function debounce(func, wait) {
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

// Add these variables to track viewport changes
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

// Update value displays
function updateValue(input, suffix = '') {
  document.getElementById(`${input.id}-value`).textContent = input.value + suffix;
}

function handleMouseMove(e) {
  // Calculate position as percentage of window width (0-100)
  const posX = (e.clientX / window.innerWidth) * 100;
  // Calculate offset as percentage of window height (-100 to 100)
  const offsetY = ((e.clientY / window.innerHeight) * 200) - 100;
  
  // Update the inputs and their displays
  offsetInput.value = Math.round(posX);
  
  updateValue(offsetInput, '%');
  
  updateAsterisk();
}

function handleScroll() {
  const scrollProgress = Math.min(window.scrollY / (window.innerHeight * 2), 1);
  
  // Interpolate between initial and max values based on scroll progress
  const newLength = initialLength + (100 - initialLength) * scrollProgress;
  const newWidth = initialWidth + (800 - initialWidth) * scrollProgress;
  
  // Update the inputs and their displays
  lengthInput.value = Math.round(newLength);
  widthInput.value = Math.round(newWidth);
  
  updateValue(lengthInput, '%');
  updateValue(widthInput, 'px');
  
  updateAsterisk();
}

function updateDimensions() {
  centerX = window.innerWidth / 2;
  centerY = window.innerHeight / 2;
  radius = Math.min(centerX, centerY);
  
  maskSvg.setAttribute('width', window.innerWidth);
  maskSvg.setAttribute('height', window.innerHeight);
  
  updateAsterisk();
}

function updateAsterisk() {
  const arms = parseInt(armsInput.value);
  const lengthPercent = parseInt(lengthInput.value) / 100;
  const strokeWidth = parseInt(widthInput.value);
  const lineStyle = roundedInput.checked ? 'round' : 'butt';
  const offset = parseInt(offsetInput.value);
  
  linesGroup.setAttribute('stroke-width', strokeWidth);
  linesGroup.setAttribute('stroke-linecap', lineStyle);
  
  linesGroup.innerHTML = '';

  for (let i = 0; i < arms; i++) {
    const angle = (2 * Math.PI / arms) * i;
    const startX = centerX + offset * Math.cos(angle);
    const startY = centerY + offset * Math.sin(angle);
    const endX = centerX + (radius * lengthPercent) * Math.cos(angle);
    const endY = centerY + (radius * lengthPercent) * Math.sin(angle);
    
    // Create path for curved line
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${startX} ${startY} L ${endX} ${endY}`;
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    linesGroup.appendChild(path);
  }
}

function updateSpinAnimation() {
  const speed = parseInt(speedInput.value);
  if (speed === 0) {
    linesGroup.classList.remove('rotating');
  } else {
    linesGroup.style.animationDuration = `${21 - speed}s`;
    linesGroup.classList.add('rotating');
  }
}

// Event listeners
window.removeEventListener('resize', updateDimensions); // Remove old listener
window.addEventListener('resize', debounce((e) => {
    // Only update if the viewport actually changed size
    if (window.innerWidth !== lastWidth || window.innerHeight !== lastHeight) {
        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
        updateDimensions();
    }
}, 250)); // 250ms debounce delay

[armsInput, lengthInput, widthInput, offsetInput].forEach(input => {
  input.addEventListener('input', () => {
    updateValue(input);
    updateAsterisk();
  });
  // Initialize value displays
  updateValue(input);
});

roundedInput.addEventListener('change', () => {
  updateAsterisk();
});

speedInput.addEventListener('input', () => {
  updateValue(speedInput, 's');
  updateSpinAnimation();
});
updateValue(speedInput, 's');

// Add scroll event listener
window.addEventListener('scroll', handleScroll);

// Add mouse move event listener
window.addEventListener('mousemove', handleMouseMove);

// Initial setup
updateDimensions();
updateSpinAnimation();
