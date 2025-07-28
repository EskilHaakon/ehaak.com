console.log('Welcome to EHAAK hemsida!'); 

// --- Crosshair setup ---
let square1 = document.getElementById('square1');
let square2 = document.getElementById('square2');
let panels = document.querySelectorAll('.panel');
let centerPanel = document.getElementById('center-panel');

// Animation state
let atStart = true;
let animating = false;
let startPos = { x: 0, y: 0 };
let endPos = { x: 0, y: 0 };
let currentMode = 'square1'; // 'square1' or 'square2'
let square1Extended = false; // Track if square1 has moved to its first end position
let square1InExtendedMode = false; // Track if square1 is in the special extended mode (moved to square2's position)
let clickLocked = false; // Prevent clicking during animations

// Initialize squares
if (square1) {
    square1.innerHTML = '<div class="square1"></div>';
}
if (square2) {
    square2.innerHTML = '<div class="square2"></div>';
}

const gap = 8; // px, gap between panels and edges

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function getContainerRect() {
    return document.getElementById('main-container').getBoundingClientRect();
}

function getCenterPanelRect() {
    const centerPanel = document.getElementById('center-panel');
    const containerRect = document.getElementById('main-container').getBoundingClientRect();
    const rect = centerPanel.getBoundingClientRect();
    return {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        right: rect.right - containerRect.left,
        bottom: rect.bottom - containerRect.top,
        width: rect.width,
        height: rect.height
    };
}

function setSquare1Position(x, y) {
    square1Pos.x = x;
    square1Pos.y = y;
    updateSquare1(x, y);
    updatePanels(x, y);
}

function easeInOut(t) {
    // Cubic Bézier curve for smoother ease-in-out
    return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function updatePanels() {
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let centerPanelRect = centerPanel.getBoundingClientRect();
    
    let gap = 12;
    let square1Pos = { x: 0, y: 0 };
    let square2Pos = { x: 0, y: 0 };
    
    if (square1) {
        let square1Rect = square1.getBoundingClientRect();
        square1Pos = {
            x: Math.round(square1Rect.left + square1Rect.width / 2 - containerRect.left),
            y: Math.round(square1Rect.top + square1Rect.height / 2 - containerRect.top)
        };
    }
    
    if (square2) {
        let square2Rect = square2.getBoundingClientRect();
        square2Pos = {
            x: Math.round(square2Rect.left + square2Rect.width / 2 - containerRect.left),
            y: Math.round(square2Rect.top + square2Rect.height / 2 - containerRect.top)
        };
    }
    
    let activeSquare = currentMode === 'square1' ? square1Pos : square2Pos;
    
    let pTL = document.getElementById('panel-top-left');
    let pTR = document.getElementById('panel-top-right');
    let pBL = document.getElementById('panel-bottom-left');
    let pBR = document.getElementById('panel-bottom-right');
    
    if (currentMode === 'square1') {
        // Square1 mode
        let midX = containerRect.width / 2;
        
        // Top panels - behavior depends on extended mode
        if (square1InExtendedMode) {
            // Check if square1 has passed the middle of the screen
            let hasPassedMiddle = activeSquare.x > midX;
            
            if (hasPassedMiddle) {
                // Square1 has passed middle: top panels follow Y-axis only, horizontally centered
                pTL.style.left = gap + 'px';
                pTL.style.top = gap + 'px';
                pTL.style.width = (midX - 6 - gap) + 'px';
                pTL.style.height = (activeSquare.y - 6 - gap) + 'px';
                
                pTR.style.left = (midX + 6) + 'px';
                pTR.style.top = gap + 'px';
                pTR.style.width = (containerRect.width - midX - 6 - gap) + 'px';
                pTR.style.height = (activeSquare.y - 6 - gap) + 'px';
            } else {
                // Square1 hasn't passed middle: top panels follow both X and Y axes
                pTL.style.left = gap + 'px';
                pTL.style.top = gap + 'px';
                pTL.style.width = (activeSquare.x - 6 - gap) + 'px';
                pTL.style.height = (activeSquare.y - 6 - gap) + 'px';
                
                pTR.style.left = (activeSquare.x + 6) + 'px';
                pTR.style.top = gap + 'px';
                pTR.style.width = (containerRect.width - activeSquare.x - 6 - gap) + 'px';
                pTR.style.height = (activeSquare.y - 6 - gap) + 'px';
            }
        } else {
            // Normal mode: top panels always overlap center panel
            pTL.style.left = gap + 'px';
            pTL.style.top = gap + 'px';
            pTL.style.width = (activeSquare.x - 6 - gap) + 'px';
            pTL.style.height = (activeSquare.y - 6 - gap) + 'px';
            
            pTR.style.left = (activeSquare.x + 6) + 'px';
            pTR.style.top = gap + 'px';
            pTR.style.width = (containerRect.width - activeSquare.x - 6 - gap) + 'px';
            pTR.style.height = (activeSquare.y - 6 - gap) + 'px';
        }
        
        // Bottom panels - behavior depends on extended mode
        if (square1InExtendedMode) {
            // Check if square1 has passed the middle of the screen
            let hasPassedMiddle = activeSquare.x > midX;
            
            if (hasPassedMiddle) {
                // Square1 has passed middle: bottom panels can follow both X and Y axes
                pBL.style.left = gap + 'px';
                pBL.style.top = (activeSquare.y + 6) + 'px';
                pBL.style.width = (activeSquare.x - 6 - gap) + 'px';
                pBL.style.height = (containerRect.height - activeSquare.y - 6 - gap) + 'px';
                
                pBR.style.left = (activeSquare.x + 6) + 'px';
                pBR.style.top = (activeSquare.y + 6) + 'px';
                pBR.style.width = (containerRect.width - activeSquare.x - 6 - gap) + 'px';
                pBR.style.height = (containerRect.height - activeSquare.y - 6 - gap) + 'px';
            } else {
                // Square1 hasn't passed middle: bottom panels follow Y-axis only
                pBL.style.left = gap + 'px';
                pBL.style.top = (activeSquare.y + 6) + 'px';
                pBL.style.width = (midX - 6 - gap) + 'px';
                pBL.style.height = (containerRect.height - activeSquare.y - 6 - gap) + 'px';
                
                pBR.style.left = (midX + 6) + 'px';
                pBR.style.top = (activeSquare.y + 6) + 'px';
                pBR.style.width = (containerRect.width - midX - 6 - gap) + 'px';
                pBR.style.height = (containerRect.height - activeSquare.y - 6 - gap) + 'px';
            }
        } else {
            // Normal mode: only follow Y-value, restricted by center panel
            pBL.style.left = gap + 'px';
            pBL.style.top = Math.max(centerPanelRect.bottom - containerRect.top + gap, activeSquare.y + 6) + 'px';
            pBL.style.width = (midX - 6 - gap) + 'px';
            pBL.style.height = (containerRect.height - Math.max(centerPanelRect.bottom - containerRect.top + gap, activeSquare.y + 6) - gap) + 'px';
            
            pBR.style.left = (midX + 6) + 'px';
            pBR.style.top = Math.max(centerPanelRect.bottom - containerRect.top + gap, activeSquare.y + 6) + 'px';
            pBR.style.width = (containerRect.width - midX - 6 - gap) + 'px';
            pBR.style.height = (containerRect.height - Math.max(centerPanelRect.bottom - containerRect.top + gap, activeSquare.y + 6) - gap) + 'px';
        }
    } else {
        // Square2 mode
        let midX = containerRect.width / 2;
        
        // Top panels - only follow Y-value, restricted by center panel
        pTL.style.left = gap + 'px';
        pTL.style.top = gap + 'px';
        pTL.style.width = (midX - 6 - gap) + 'px';
        pTL.style.height = (Math.min(centerPanelRect.top - containerRect.top - gap, activeSquare.y - 6) - gap) + 'px';
        
        pTR.style.left = (midX + 6) + 'px';
        pTR.style.top = gap + 'px';
        pTR.style.width = (containerRect.width - midX - 6 - gap) + 'px';
        pTR.style.height = (Math.min(centerPanelRect.top - containerRect.top - gap, activeSquare.y - 6) - gap) + 'px';
        
        // Bottom panels - always overlap center panel
        pBL.style.left = gap + 'px';
        pBL.style.top = (activeSquare.y + 6) + 'px';
        pBL.style.width = (activeSquare.x - 6 - gap) + 'px';
        pBL.style.height = (containerRect.height - activeSquare.y - 6 - gap) + 'px';
        
        pBR.style.left = (activeSquare.x + 6) + 'px';
        pBR.style.top = (activeSquare.y + 6) + 'px';
        pBR.style.width = (containerRect.width - activeSquare.x - 6 - gap) + 'px';
        pBR.style.height = (containerRect.height - activeSquare.y - 6 - gap) + 'px';
    }
    
    // Update fixed text clipping based on bottom-left panel
    updateFixedTextClipping();
}

function updateSquare1() {
    if (!square1) return;
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let centerPanelRect = centerPanel.getBoundingClientRect();
    
    let x = containerRect.width / 2;
    let y = centerPanelRect.top - containerRect.top - 6; // Bottom of square touches top of center panel
    
    square1.style.left = (x - 6) + 'px';
    square1.style.top = (y - 6) + 'px';
}

function updateSquare2() {
    if (!square2) return;
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let centerPanelRect = centerPanel.getBoundingClientRect();
    
    let x = containerRect.width / 2;
    let y = centerPanelRect.bottom - containerRect.top + 6; // Top of square touches bottom of center panel
    
    square2.style.left = (x - 6) + 'px';
    square2.style.top = (y - 6) + 'px';
}

function animateSquare1() {
    if (animating) return;
    
    animating = true;
    clickLocked = true;
    let startTime = performance.now();
    let duration = window.innerWidth <= 600 ? 800 : 1000; // Faster on narrow screens
    
    function animate(currentTime) {
        let elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1);
        
        // Ease in out
        progress = easeInOut(progress);
        
        // Calculate position using smooth cubic Bézier curve
        let t = progress;
        
        // Determine if this is forward or reverse animation based on positions
        let isForward = endPos.x < startPos.x; // If end is left of start, it's forward
        
        // Create smooth curved path using cubic Bézier
        if (isForward) {
            // Forward animation: left then down (smooth curve)
            let control1X = startPos.x + (endPos.x - startPos.x) * 0.95;
            let control1Y = startPos.y;
            let control2X = endPos.x;
            let control2Y = startPos.y + (endPos.y - startPos.y) * 0.3;
            
            x = Math.pow(1 - t, 3) * startPos.x + 
                3 * Math.pow(1 - t, 2) * t * control1X + 
                3 * (1 - t) * Math.pow(t, 2) * control2X + 
                Math.pow(t, 3) * endPos.x;
            
            y = Math.pow(1 - t, 3) * startPos.y + 
                3 * Math.pow(1 - t, 2) * t * control1Y + 
                3 * (1 - t) * Math.pow(t, 2) * control2Y + 
                Math.pow(t, 3) * endPos.y;
        } else {
            // Reverse animation: up then right (smooth curve)
            let control1X = startPos.x;
            let control1Y = startPos.y + (endPos.y - startPos.y) * 0.95;
            let control2X = startPos.x + (endPos.x - startPos.x) * 0.3;
            let control2Y = endPos.y;
            
            x = Math.pow(1 - t, 3) * startPos.x + 
                3 * Math.pow(1 - t, 2) * t * control1X + 
                3 * (1 - t) * Math.pow(t, 2) * control2X + 
                Math.pow(t, 3) * endPos.x;
            
            y = Math.pow(1 - t, 3) * startPos.y + 
                3 * Math.pow(1 - t, 2) * t * control1Y + 
                3 * (1 - t) * Math.pow(t, 2) * control2Y + 
                Math.pow(t, 3) * endPos.y;
        }
        
        square1.style.left = (x - 6) + 'px';
        square1.style.top = (y - 6) + 'px';
        
        updatePanels();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
            clickLocked = false;
            atStart = !atStart;
        }
    }
    
    requestAnimationFrame(animate);
}

function animateSquare2() {
    if (animating) return;
    
    animating = true;
    clickLocked = true;
    let startTime = performance.now();
    let duration = window.innerWidth <= 600 ? 800 : 1000; // Faster on narrow screens
    
    function animate(currentTime) {
        let elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1);
        
        // Ease in out
        progress = easeInOut(progress);
        
        // Calculate position using smooth cubic Bézier curve
        let t = progress;
        
        // Determine if this is forward or reverse animation based on positions
        let isForward = endPos.x > startPos.x; // If end is right of start, it's forward
        
        // Create smooth curved path using cubic Bézier
        if (isForward) {
            // Forward animation: right then up (smooth curve)
            let control1X = startPos.x + (endPos.x - startPos.x) * 0.95;
            let control1Y = startPos.y;
            let control2X = endPos.x;
            let control2Y = startPos.y + (endPos.y - startPos.y) * 0.3;
            
            x = Math.pow(1 - t, 3) * startPos.x + 
                3 * Math.pow(1 - t, 2) * t * control1X + 
                3 * (1 - t) * Math.pow(t, 2) * control2X + 
                Math.pow(t, 3) * endPos.x;
            
            y = Math.pow(1 - t, 3) * startPos.y + 
                3 * Math.pow(1 - t, 2) * t * control1Y + 
                3 * (1 - t) * Math.pow(t, 2) * control2Y + 
                Math.pow(t, 3) * endPos.y;
        } else {
            // Reverse animation: down then left (smooth curve)
            let control1X = startPos.x;
            let control1Y = startPos.y + (endPos.y - startPos.y) * 0.95;
            let control2X = startPos.x + (endPos.x - startPos.x) * 0.3;
            let control2Y = endPos.y;
            
            x = Math.pow(1 - t, 3) * startPos.x + 
                3 * Math.pow(1 - t, 2) * t * control1X + 
                3 * (1 - t) * Math.pow(t, 2) * control2X + 
                Math.pow(t, 3) * endPos.x;
            
            y = Math.pow(1 - t, 3) * startPos.y + 
                3 * Math.pow(1 - t, 2) * t * control1Y + 
                3 * (1 - t) * Math.pow(t, 2) * control2Y + 
                Math.pow(t, 3) * endPos.y;
        }
        
        square2.style.left = (x - 6) + 'px';
        square2.style.top = (y - 6) + 'px';
        
        updatePanels();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
            clickLocked = false;
            atStart = !atStart;
            if (currentMode === 'square2' && atStart) {
                // Switch back to square1 mode when square2 returns to start
                currentMode = 'square1';
                square1Extended = false; // Reset extended flags
                square1InExtendedMode = false;
                updateSquare1();
                updatePanels();
            } else if (currentMode === 'square2' && !atStart) {
                // Square2 has reached its end position, teleport square1 to square2's end position
                teleportSquare1ToSquare2EndPosition();
            }
        }
    }
    
    requestAnimationFrame(animate);
}

function animateSquare1ToSquare2Position() {
    if (animating) return;
    
    animating = true;
    clickLocked = true;
    let startTime = performance.now();
    let duration = window.innerWidth <= 600 ? 1200 : 1500; // Longer duration for S-curve movement
    
    // Make center panel transparent during movement
    centerPanel.style.opacity = '0';
    
    // Calculate square2's end position for square1 to move to
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let gap = 8;
    
    // Calculate square2's end position
    let estimatedTextWidth = window.innerWidth <= 600 ? 50 : window.innerWidth <= 900 ? 70 : 80; // Responsive width for "Gallery" text
    let textRight = containerRect.width - gap - 6; // Right edge of text (container width - gap - text-to-border gap)
    let h = containerRect.height;
    let verticalPercent = window.innerWidth <= 600 ? 0.45 : 0.47;
    
    // Use square2's start position (below center panel) as reference
    let centerPanelRect = centerPanel.getBoundingClientRect();
    let square2StartY = centerPanelRect.bottom - containerRect.top + 6;
    
    let square2EndPos = {
        x: textRight - estimatedTextWidth - gap - 6,
        y: square2StartY - h * verticalPercent
    };
    
    // Current position of square1 (its first end position)
    let square1CurrentPos = {
        x: startPos.x + (endPos.x - startPos.x),
        y: startPos.y + (endPos.y - startPos.y)
    };
    
    function animate(currentTime) {
        let elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1);
        
        // Ease in out
        progress = easeInOut(progress);
        
        // Calculate position using smooth cubic Bézier curve
        let t = progress;
        
        // Create S-curve path using cubic Bézier
        let control1X = square1CurrentPos.x + (square2EndPos.x - square1CurrentPos.x) * 0.85;
        let control1Y = square1CurrentPos.y + (square2EndPos.y - square1CurrentPos.y) * 0.15;
        let control2X = square1CurrentPos.x + (square2EndPos.x - square1CurrentPos.x) * 0.15;
        let control2Y = square1CurrentPos.y + (square2EndPos.y - square1CurrentPos.y) * 0.85;
        
        let x = Math.pow(1 - t, 3) * square1CurrentPos.x + 
                3 * Math.pow(1 - t, 2) * t * control1X + 
                3 * (1 - t) * Math.pow(t, 2) * control2X + 
                Math.pow(t, 3) * square2EndPos.x;
        
        let y = Math.pow(1 - t, 3) * square1CurrentPos.y + 
                3 * Math.pow(1 - t, 2) * t * control1Y + 
                3 * (1 - t) * Math.pow(t, 2) * control2Y + 
                Math.pow(t, 3) * square2EndPos.y;
        
        square1.style.left = (x - 6) + 'px';
        square1.style.top = (y - 6) + 'px';
        
        updatePanels();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
            clickLocked = false;
            // Restore center panel opacity
            centerPanel.style.opacity = '1';
            // Update positions for potential reverse animation
            startPos = square1CurrentPos;
            endPos = square2EndPos;
            
            // Move square2 to its end position
            animateSquare2ToEndPosition();
        }
    }
    
    requestAnimationFrame(animate);
}

function animateSquare2ToEndPosition() {
    if (animating) return;
    
    animating = true;
    clickLocked = true;
    let startTime = performance.now();
    let duration = 0; // Instant movement
    
    // Get square2's current position
    let square2Rect = square2.getBoundingClientRect();
    let containerRect = document.getElementById('main-container').getBoundingClientRect();
    let square2CurrentPos = {
        x: Math.round(square2Rect.left + square2Rect.width / 2 - containerRect.left),
        y: Math.round(square2Rect.top + square2Rect.height / 2 - containerRect.top)
    };
    
    // Calculate square2's end position
    let container = document.getElementById('main-container');
    let containerRect2 = container.getBoundingClientRect();
    let gap = 8;
    let estimatedTextWidth = window.innerWidth <= 600 ? 60 : window.innerWidth <= 900 ? 70 : 80;
    let textRight = containerRect2.width - gap - 6;
    let h = containerRect2.height;
    let verticalPercent = window.innerWidth <= 600 ? 0.45 : 0.47;
    let centerPanelRect = centerPanel.getBoundingClientRect();
    let square2StartY = centerPanelRect.bottom - containerRect2.top + 6;
    
    let square2EndPos = {
        x: textRight - estimatedTextWidth - gap - 6,
        y: square2StartY - h * verticalPercent
    };
    
    function animate(currentTime) {
        let elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1);
        
        // Ease in out
        progress = easeInOut(progress);
        
        // Calculate position using smooth cubic Bézier curve
        let t = progress;
        
        // Create smooth curved path using cubic Bézier
        let control1X = square2CurrentPos.x + (square2EndPos.x - square2CurrentPos.x) * 0.95;
        let control1Y = square2CurrentPos.y;
        let control2X = square2EndPos.x;
        let control2Y = square2CurrentPos.y + (square2EndPos.y - square2CurrentPos.y) * 0.3;
        
        let x = Math.pow(1 - t, 3) * square2CurrentPos.x + 
                3 * Math.pow(1 - t, 2) * t * control1X + 
                3 * (1 - t) * Math.pow(t, 2) * control2X + 
                Math.pow(t, 3) * square2EndPos.x;
        
        let y = Math.pow(1 - t, 3) * square2CurrentPos.y + 
                3 * Math.pow(1 - t, 2) * t * control1Y + 
                3 * (1 - t) * Math.pow(t, 2) * control2Y + 
                Math.pow(t, 3) * square2EndPos.y;
        
        square2.style.left = (x - 6) + 'px';
        square2.style.top = (y - 6) + 'px';
        
        updatePanels();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
            clickLocked = false;
        }
    }
    
    requestAnimationFrame(animate);
}

function animateSquare1FromSquare2ToSquare1Position() {
    if (animating) return;
    
    animating = true;
    clickLocked = true;
    let startTime = performance.now();
    let duration = window.innerWidth <= 600 ? 1200 : 1500; // Longer duration for S-curve movement
    
    // Make center panel transparent during movement
    centerPanel.style.opacity = '0';
    
    // Calculate square1's end position (where it should go back to)
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let gap = 8;
    
    // Calculate square1's end position
    let estimatedTextWidth = window.innerWidth <= 600 ? 65 : window.innerWidth <= 900 ? 85 : 105; // Responsive width for "Eskil Haakonsson" text
    let textLeft = gap + 6; // Left edge of text (gap + text-to-border gap)
    let h = containerRect.height;
    let verticalPercent = window.innerWidth <= 600 ? 0.48 : 0.5;
    let centerPanelRect = centerPanel.getBoundingClientRect();
    let square1StartY = centerPanelRect.top - containerRect.top - 6;
    
    let square1EndPos = {
        x: textLeft + estimatedTextWidth + gap + 6,
        y: square1StartY + h * verticalPercent
    };
    
    // Current position of square1 (at square2's end position)
    let square1CurrentPos = {
        x: startPos.x + (endPos.x - startPos.x),
        y: startPos.y + (endPos.y - startPos.y)
    };
    
    function animate(currentTime) {
        let elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1);
        
        // Ease in out
        progress = easeInOut(progress);
        
        // Calculate position using smooth cubic Bézier curve
        let t = progress;
        
        // Create reverse S-curve path using cubic Bézier
        let control1X = square1CurrentPos.x + (square1EndPos.x - square1CurrentPos.x) * 0.85;
        let control1Y = square1CurrentPos.y + (square1EndPos.y - square1CurrentPos.y) * 0.15;
        let control2X = square1CurrentPos.x + (square1EndPos.x - square1CurrentPos.x) * 0.15;
        let control2Y = square1CurrentPos.y + (square1EndPos.y - square1CurrentPos.y) * 0.85;
        
        let x = Math.pow(1 - t, 3) * square1CurrentPos.x + 
                3 * Math.pow(1 - t, 2) * t * control1X + 
                3 * (1 - t) * Math.pow(t, 2) * control2X + 
                Math.pow(t, 3) * square1EndPos.x;
        
        let y = Math.pow(1 - t, 3) * square1CurrentPos.y + 
                3 * Math.pow(1 - t, 2) * t * control1Y + 
                3 * (1 - t) * Math.pow(t, 2) * control2Y + 
                Math.pow(t, 3) * square1EndPos.y;
        
        square1.style.left = (x - 6) + 'px';
        square1.style.top = (y - 6) + 'px';
        
        updatePanels();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
            clickLocked = false;
            // Restore center panel opacity
            centerPanel.style.opacity = '1';
            // Reset extended mode
            square1InExtendedMode = false;
            square1Extended = true; // Keep it extended since it's back at its first end position
            atStart = false; // Set to false so next click triggers reverse animation
            // Recalculate positions for normal square1 reverse animation
            recalcPositions();
            
            // Teleport square2 back to its start position
            updateSquare2();
        }
    }
    
    requestAnimationFrame(animate);
}

function teleportSquare1ToSquare2EndPosition() {
    // Calculate square2's end position
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let gap = 8;
    let estimatedTextWidth = window.innerWidth <= 600 ? 50 : window.innerWidth <= 900 ? 70 : 80;
    let textRight = containerRect.width - gap - 6;
    let h = containerRect.height;
    let verticalPercent = window.innerWidth <= 600 ? 0.45 : 0.47;
    let centerPanelRect = centerPanel.getBoundingClientRect();
    let square2StartY = centerPanelRect.bottom - containerRect.top + 6;
    
    let square2EndPos = {
        x: textRight - estimatedTextWidth - gap - 6,
        y: square2StartY - h * verticalPercent
    };
    
    // Teleport square1 to square2's end position
    square1.style.left = (square2EndPos.x - 6) + 'px';
    square1.style.top = (square2EndPos.y - 6) + 'px';
    
    updatePanels();
}

function updateFixedTextClipping() {
    let fixedText = document.getElementById('fixed-text');
    let pBL = document.getElementById('panel-bottom-left');
    
    if (!fixedText || !pBL) return;
    
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let panelRect = pBL.getBoundingClientRect();
    
    // Calculate the panel's position relative to the viewport
    let panelLeft = panelRect.left;
    let panelTop = panelRect.top;
    let panelRight = panelRect.right;
    let panelBottom = panelRect.bottom;
    
    // Calculate the fixed text's position relative to the viewport
    let textRect = fixedText.getBoundingClientRect();
    let textLeft = textRect.left;
    let textTop = textRect.top;
    let textRight = textRect.right;
    let textBottom = textRect.bottom;
    
    // Create a clip-path that clips the text to the panel boundaries
    let clipLeft = Math.max(0, (panelLeft - textLeft) / textRect.width * 100);
    let clipTop = Math.max(0, (panelTop - textTop) / textRect.height * 100);
    let clipRight = Math.min(100, (textRight - panelRight) / textRect.width * 100);
    let clipBottom = Math.min(100, (textBottom - panelBottom) / textRect.height * 100);
    
    // Apply the clip-path
    fixedText.style.clipPath = `polygon(${clipLeft}% ${clipTop}%, ${100 - clipRight}% ${clipTop}%, ${100 - clipRight}% ${100 - clipBottom}%, ${clipLeft}% ${100 - clipBottom}%)`;
}

function blinkProjectsText() {
    let projectsLink = document.getElementById('panel-tr-link');
    let projectsPanel = document.getElementById('panel-top-right');
    
    projectsLink.classList.add('active');
    projectsPanel.classList.add('active');
    
    setTimeout(() => {
        projectsLink.classList.remove('active');
        projectsPanel.classList.remove('active');
    }, 300);
}

function blinkAboutText() {
    let aboutLink = document.getElementById('panel-bl-link');
    let aboutPanel = document.getElementById('panel-bottom-left');
    
    aboutLink.classList.add('active');
    aboutPanel.classList.add('active');
    
    setTimeout(() => {
        aboutLink.classList.remove('active');
        aboutPanel.classList.remove('active');
    }, 300);
}

function blinkTopLeftText() {
    let topLeftLink = document.getElementById('panel-tl-link');
    let topLeftPanel = document.getElementById('panel-top-left');
    
    topLeftLink.classList.add('active');
    topLeftPanel.classList.add('active');
    
    setTimeout(() => {
        topLeftLink.classList.remove('active');
        topLeftPanel.classList.remove('active');
    }, 300);
}

function blinkBottomRightText() {
    let bottomRightLink = document.getElementById('panel-br-link');
    let bottomRightPanel = document.getElementById('panel-bottom-right');
    
    bottomRightLink.classList.add('active');
    bottomRightPanel.classList.add('active');
    
    setTimeout(() => {
        bottomRightLink.classList.remove('active');
        bottomRightPanel.classList.remove('active');
    }, 300);
}

function blinkCenterText() {
    let centerLink = document.getElementById('center-panel-link');
    let centerPanel = document.getElementById('center-panel');
    
    centerLink.classList.add('active');
    centerPanel.classList.add('active');
    
    setTimeout(() => {
        centerLink.classList.remove('active');
        centerPanel.classList.remove('active');
    }, 300);
}

function onProjectsClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent clicking during animations
    if (clickLocked || animating) return;
    
    if (currentMode === 'square1' && square1InExtendedMode) {
        // Extended mode is active, reverse the S-curve movement
        animateSquare1FromSquare2ToSquare1Position();
    } else if (currentMode === 'square2') {
        // Check if square1 is at square2's end position (extended mode trigger)
        let container = document.getElementById('main-container');
        let containerRect = container.getBoundingClientRect();
        let gap = 8;
        let estimatedTextWidth = window.innerWidth <= 600 ? 50 : window.innerWidth <= 900 ? 70 : 80;
        let textRight = containerRect.width - gap - 6;
        let h = containerRect.height;
        let verticalPercent = window.innerWidth <= 600 ? 0.45 : 0.47;
        let centerPanelRect = centerPanel.getBoundingClientRect();
        let square2StartY = centerPanelRect.bottom - containerRect.top + 6;
        
        let square2EndPos = {
            x: textRight - estimatedTextWidth - gap - 6,
            y: square2StartY - h * verticalPercent
        };
        
        // Check if square1 is at square2's end position
        let square1Rect = square1.getBoundingClientRect();
        let containerRect2 = container.getBoundingClientRect();
        let square1X = square1Rect.left - containerRect2.left + 6;
        let square1Y = square1Rect.top - containerRect2.top + 6;
        
        if (Math.abs(square1X - square2EndPos.x) < 2 && Math.abs(square1Y - square2EndPos.y) < 2) {
            // Square1 is at square2's end position, trigger extended mode
            currentMode = 'square1';
            square1InExtendedMode = true;
            animateSquare1FromSquare2ToSquare1Position();
        } else {
            // Switch to normal square1 mode
            currentMode = 'square1';
            atStart = true;
            updateSquare1();
            updatePanels();
        }
    } else if (currentMode !== 'square1') {
        return;
    } else if (atStart) {
        recalcPositions();
        animateSquare1();
        square1Extended = true; // Mark that square1 has moved to its first end position
    } else {
        // Reverse animation - normal square1 mode back to start
        let temp = startPos;
        startPos = endPos;
        endPos = temp;
        animateSquare1();
        square1Extended = false; // Reset when returning to start
        square1InExtendedMode = false; // Reset extended mode
    }
    
    blinkProjectsText();
}

function onAboutClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent clicking during animations
    if (clickLocked || animating) return;
    
    if (currentMode === 'square1' && square1Extended && !square1InExtendedMode) {
        // Square1 is in its end position, move it to square2's end position
        currentMode = 'square1';
        atStart = false;
        square1InExtendedMode = true; // Enable special extended mode
        recalcPositions();
        animateSquare1ToSquare2Position();
    } else if (currentMode === 'square1' && square1InExtendedMode) {
        // Extended mode is active, switch to square2 mode and animate back to start
        currentMode = 'square2';
        atStart = false; // Start from end position to go back to start
        square1InExtendedMode = false; // Disable extended mode
        updateSquare2();
        recalcPositions();
        // Force reverse animation by swapping start and end positions
        let temp = startPos;
        startPos = endPos;
        endPos = temp;
        animateSquare2();
    } else if (currentMode !== 'square2') {
        currentMode = 'square2';
        atStart = true;
        updateSquare2();
        // Start animation immediately to prevent panel jumping
        recalcPositions();
        animateSquare2();
    } else {
        if (atStart) {
            recalcPositions();
            animateSquare2();
        } else {
            // Reverse animation
            let temp = startPos;
            startPos = endPos;
            endPos = temp;
            animateSquare2();
        }
    }
    
    blinkAboutText();
}

function onTopLeftClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent clicking during animations
    if (clickLocked || animating) return;
    
    // Blink the text and panel, then reload the page
    blinkTopLeftText();
    
    // Reload the page after a short delay to show the blink effect
    setTimeout(() => {
        window.location.reload();
    }, 300);
}

function onBottomRightClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent clicking during animations
    if (clickLocked || animating) return;
    
    // For now, just blink the text and panel
    blinkBottomRightText();
}

function onCenterClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent clicking during animations
    if (clickLocked || animating) return;
    
    // For now, just blink the text and panel
    blinkCenterText();
}

function recalcPositions() {
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let centerPanelRect = centerPanel.getBoundingClientRect();
    let gap = 8;
    
    if (currentMode === 'square1') {
        // Square1 positions (existing logic)
        let centerPanelTop = centerPanelRect.top - containerRect.top;
        let centerPanelBottom = centerPanelRect.bottom - containerRect.top;
        
        startPos = {
            x: containerRect.width / 2,
            y: centerPanelTop - 6
        };
        
        // Calculate end position based on fixed left edge + estimated text width
        let estimatedTextWidth = window.innerWidth <= 600 ? 65 : window.innerWidth <= 900 ? 85 : 105; // Responsive width for "Eskil Haakonsson" text
        let textLeft = gap + 6; // Left edge of text (gap + text-to-border gap)
        
        let h = containerRect.height;
        let verticalPercent = window.innerWidth <= 600 ? 0.48 : 0.5;
        
        endPos = {
            x: textLeft + estimatedTextWidth + gap + 6,
            y: startPos.y + h * verticalPercent
        };
    } else {
        // Square2 positions (inverted logic)
        let centerPanelTop = centerPanelRect.top - containerRect.top;
        let centerPanelBottom = centerPanelRect.bottom - containerRect.top;
        
        startPos = {
            x: containerRect.width / 2,
            y: centerPanelBottom + 6
        };
        
        // Calculate end position based on fixed right edge - estimated text width
        let estimatedTextWidth = window.innerWidth <= 600 ? 50 : window.innerWidth <= 900 ? 70 : 80; // Responsive width for "Gallery" text
        let textRight = containerRect.width - gap - 6; // Right edge of text (container width - gap - text-to-border gap)
        
        let h = containerRect.height;
        let verticalPercent = window.innerWidth <= 600 ? 0.45 : 0.47;
        
        endPos = {
            x: textRight - estimatedTextWidth - gap - 6,
            y: startPos.y - h * verticalPercent
        };
    }
}

// Initialize on load
window.addEventListener('load', function() {
    updateSquare1();
    updateSquare2();
    updatePanels();
    recalcPositions();
});

// Event listeners
document.getElementById('panel-tr-link').addEventListener('click', onProjectsClick);
document.getElementById('panel-top-right').addEventListener('click', onProjectsClick);
document.getElementById('panel-bl-link').addEventListener('click', onAboutClick);
document.getElementById('panel-bottom-left').addEventListener('click', onAboutClick);
document.getElementById('panel-tl-link').addEventListener('click', onTopLeftClick);
document.getElementById('panel-top-left').addEventListener('click', onTopLeftClick);
document.getElementById('panel-br-link').addEventListener('click', onBottomRightClick);
document.getElementById('panel-bottom-right').addEventListener('click', onBottomRightClick);
document.getElementById('center-panel-link').addEventListener('click', onCenterClick);
document.getElementById('center-panel').addEventListener('click', onCenterClick);

// Handle window resize
window.addEventListener('resize', function() {
    updateSquare1();
    updateSquare2();
    updatePanels();
    recalcPositions();
}); 