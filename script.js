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
    
    // Update body class for CSS mode-specific styling (only when not animating and on desktop)
    if (!animating && window.innerWidth > 600) {
        if (currentMode === 'square2' || square1InExtendedMode || (currentMode === 'square1' && square1Extended)) {
            document.body.classList.add('square2-mode');
        } else {
            document.body.classList.remove('square2-mode');
        }
    } else {
        // Remove class on narrow screens
        document.body.classList.remove('square2-mode');
    }
    
    let gap = 12;
    let square1Pos = { x: 0, y: 0 };
    let square2Pos = { x: 0, y: 0 };
    let squareSize = 8;
    
    if (square1) {
        let square1Rect = square1.getBoundingClientRect();
        square1Pos = {
            x: Math.round(square1Rect.left - containerRect.left),
            y: Math.round(square1Rect.top - containerRect.top)
        };
    }
    
    if (square2) {
        let square2Rect = square2.getBoundingClientRect();
        square2Pos = {
            x: Math.round(square2Rect.left - containerRect.left),
            y: Math.round(square2Rect.top - containerRect.top)
        };
    }
    
    let activeSquare = currentMode === 'square1' ? square1Pos : square2Pos;
    // Calculate actual square corners (squares are positioned by their top-left corner)
    let squareTopLeft = { x: activeSquare.x, y: activeSquare.y };
    let squareTopRight = { x: activeSquare.x + 8, y: activeSquare.y };
    let squareBottomLeft = { x: activeSquare.x, y: activeSquare.y + 8 };
    let squareBottomRight = { x: activeSquare.x + 8, y: activeSquare.y + 8 };
    
    let pTL = document.getElementById('panel-top-left');
    let pTR = document.getElementById('panel-top-right');
    let pBL = document.getElementById('panel-bottom-left');
    let pBR = document.getElementById('panel-bottom-right');
    
    if (currentMode === 'square1') {
        let midX = Math.round(containerRect.width / 2);
        if (square1InExtendedMode) {
            let hasPassedMiddle = activeSquare.x > midX;
            if (hasPassedMiddle) {
                // Top panels follow Y only, horizontally centered
                let topPanelWidth = (containerRect.width - gap - gap - 8) / 2; // Total width minus gaps, divided by 2
                pTL.style.left = gap + 'px';
                pTL.style.top = gap + 'px';
                pTL.style.width = topPanelWidth + 'px';
                pTL.style.height = (squareTopLeft.y - gap) + 'px';
                
                pTR.style.left = (gap + topPanelWidth + 8) + 'px'; // Left gap + panel width + 8px gap
                pTR.style.top = gap + 'px';
                pTR.style.width = topPanelWidth + 'px';
                pTR.style.height = (squareTopRight.y - gap) + 'px';
            } else {
                // Top panels follow both X and Y
                pTL.style.left = gap + 'px';
                pTL.style.top = gap + 'px';
                pTL.style.width = (squareTopLeft.x - gap) + 'px';
                pTL.style.height = (squareTopLeft.y - gap) + 'px';
                
                pTR.style.left = (squareTopRight.x) + 'px';
                pTR.style.top = gap + 'px';
                pTR.style.width = (containerRect.width - squareTopRight.x - gap) + 'px';
                pTR.style.height = (squareTopRight.y - gap) + 'px';
            }
        } else {
            // Normal mode: top panels always overlap center panel
            pTL.style.left = gap + 'px';
            pTL.style.top = gap + 'px';
            pTL.style.width = (squareTopLeft.x - gap) + 'px';
            pTL.style.height = (squareTopLeft.y - gap) + 'px';
            
            pTR.style.left = (squareTopRight.x) + 'px';
            pTR.style.top = gap + 'px';
            pTR.style.width = (containerRect.width - squareTopRight.x - gap) + 'px';
            pTR.style.height = (squareTopRight.y - gap) + 'px';
        }
        // Bottom panels
        if (square1InExtendedMode) {
            let hasPassedMiddle = activeSquare.x > midX;
            if (hasPassedMiddle) {
                // Bottom panels follow both X and Y
                pBL.style.left = gap + 'px';
                pBL.style.top = (squareBottomLeft.y) + 'px';
                pBL.style.width = (squareBottomLeft.x - gap) + 'px';
                pBL.style.height = (containerRect.height - squareBottomLeft.y - 8) + 'px';
                
                pBR.style.left = (squareBottomRight.x) + 'px';
                pBR.style.top = (squareBottomRight.y) + 'px';
                pBR.style.width = (containerRect.width - squareBottomRight.x - gap) + 'px';
                pBR.style.height = (containerRect.height - squareBottomRight.y - 8) + 'px';
            } else {
                // Bottom panels follow Y only
                let bottomPanelWidth = (containerRect.width - gap - gap - 8) / 2; // Total width minus gaps, divided by 2
                pBL.style.left = gap + 'px';
                pBL.style.top = (squareBottomLeft.y) + 'px';
                pBL.style.width = bottomPanelWidth + 'px';
                pBL.style.height = (containerRect.height - squareBottomLeft.y - 8) + 'px';
                
                pBR.style.left = (gap + bottomPanelWidth + 8) + 'px'; // Left gap + panel width + 8px gap
                pBR.style.top = (squareBottomRight.y) + 'px';
                pBR.style.width = bottomPanelWidth + 'px';
                pBR.style.height = (containerRect.height - squareBottomRight.y - 8) + 'px';
            }
        } else {
            // Normal mode: only follow Y-value, restricted by center panel
            // Bottom panels should be positioned at the square's bottom edge, with gap between them
            let blTop = Math.max(centerPanelRect.bottom - containerRect.top + 8, squareBottomLeft.y);
            let panelWidth = (containerRect.width - gap - gap - 8) / 2; // Total width minus gaps, divided by 2
            pBL.style.left = gap + 'px';
            pBL.style.top = blTop + 'px';
            pBL.style.width = panelWidth + 'px';
            pBL.style.height = (containerRect.height - blTop - 8) + 'px';
            
            let brTop = Math.max(centerPanelRect.bottom - containerRect.top + 8, squareBottomRight.y);
            pBR.style.left = (gap + panelWidth + 8) + 'px'; // Left gap + panel width + 8px gap
            pBR.style.top = brTop + 'px';
            pBR.style.width = panelWidth + 'px';
            pBR.style.height = (containerRect.height - brTop - 8) + 'px';
        }
    } else {
        // Square2 mode
        let midX = Math.round(containerRect.width / 2);
        // Top panels - only follow Y-value, restricted by center panel
        let topPanelWidth = (containerRect.width - gap - gap - 8) / 2; // Total width minus gaps, divided by 2
        pTL.style.left = gap + 'px';
        pTL.style.top = gap + 'px';
        pTL.style.width = topPanelWidth + 'px';
        pTL.style.height = (Math.min(centerPanelRect.top - containerRect.top - 8, squareTopLeft.y) - gap) + 'px';
        
        pTR.style.left = (gap + topPanelWidth + 8) + 'px'; // Left gap + panel width + 8px gap
        pTR.style.top = gap + 'px';
        pTR.style.width = topPanelWidth + 'px';
        pTR.style.height = (Math.min(centerPanelRect.top - containerRect.top - 8, squareTopRight.y) - gap) + 'px';
        // Bottom panels - always overlap center panel
        pBL.style.left = gap + 'px';
        pBL.style.top = (squareBottomLeft.y) + 'px';
        pBL.style.width = (squareBottomLeft.x - gap) + 'px';
        pBL.style.height = (containerRect.height - squareBottomLeft.y - 8) + 'px';
        
        pBR.style.left = (squareBottomRight.x) + 'px';
        pBR.style.top = (squareBottomRight.y) + 'px';
        pBR.style.width = (containerRect.width - squareBottomRight.x - gap) + 'px';
        pBR.style.height = (containerRect.height - squareBottomRight.y - 8) + 'px';
    }
    // Update fixed text clipping based on bottom-left panel
    updateFixedTextClipping();
    // Update fixed text clipping based on top-right panel
    updateFixedTextTRClipping();
}

function updateSquare1() {
    if (!square1) return;
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let centerPanelRect = centerPanel.getBoundingClientRect();
    
    let x = Math.round(containerRect.width / 2);
    let y = centerPanelRect.top - containerRect.top - 4; // Bottom of square touches top of center panel
    
    square1.style.left = (x - 4) + 'px';
    square1.style.top = (y - 4) + 'px';
}

function updateSquare2() {
    if (!square2) return;
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let centerPanelRect = centerPanel.getBoundingClientRect();
    
    let x = Math.round(containerRect.width / 2);
    let y = centerPanelRect.bottom - containerRect.top + 4; // Top of square touches bottom of center panel
    
    square2.style.left = (x - 4) + 'px';
    square2.style.top = (y - 4) + 'px';
}

function animateSquare1() {
    if (animating) return;
    
    animating = true;
    clickLocked = true;
    let startTime = performance.now();
    let duration = window.innerWidth <= 600 ? 700 : 900; // Faster on narrow screens
    
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
        
        square1.style.left = (x - 4) + 'px';
        square1.style.top = (y - 4) + 'px';
        
        updatePanels();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
            clickLocked = false;
            atStart = !atStart;
            // Update body class after animation completes
            updatePanels();
        }
    }
    
    requestAnimationFrame(animate);
}

function animateSquare2() {
    if (animating) return;
    
    animating = true;
    clickLocked = true;
    let startTime = performance.now();
    let duration = window.innerWidth <= 600 ? 700 : 900; // Faster on narrow screens
    
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
        
        square2.style.left = (x - 4) + 'px';
        square2.style.top = (y - 4) + 'px';
        
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
                // Teleport square1 back to its start position
                updateSquare1();
                updatePanels();
            } else if (currentMode === 'square2' && !atStart) {
                // Square2 has reached its end position, teleport square1 to square2's end position
                teleportSquare1ToSquare2EndPosition();
            }
            // Update body class after animation completes
            updatePanels();
        }
    }
    
    requestAnimationFrame(animate);
}

function animateSquare1ToSquare2Position() {
    if (animating) return;
    
    animating = true;
    clickLocked = true;
    let startTime = performance.now();
    let duration = window.innerWidth <= 600 ? 1000 : 1400; // Longer duration for S-curve movement
    
    // Make center panel transparent during movement
    centerPanel.style.opacity = '0';
    
    // Calculate square2's end position for square1 to move to
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let gap = 12;
    
    // Calculate square2's end position based on gap alignment
    let h = containerRect.height;
    let verticalPercent = window.innerWidth <= 600 ? 0.46 : 0.475;
    
    // Use square2's start position (below center panel) as reference
    let centerPanelRect = centerPanel.getBoundingClientRect();
    let square2StartY = centerPanelRect.bottom - containerRect.top + 4;
    
    let square2EndPos = {
        x: gap + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 8 + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 8 + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 4, // Left gap + 3 panels + 2 gaps + half gap
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
        
        square1.style.left = (x - 4) + 'px';
        square1.style.top = (y - 4) + 'px';
        
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
            
            // Move square2 to its end position and teleport square1 to square2's end position
            animateSquare2ToEndPosition();
            teleportSquare1ToSquare2EndPosition();
            // Update body class after animation completes
            updatePanels();
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
    let gap = 12;
    let h = containerRect2.height;
    let verticalPercent = window.innerWidth <= 600 ? 0.46 : 0.475;
    let centerPanelRect = centerPanel.getBoundingClientRect();
    let square2StartY = centerPanelRect.bottom - containerRect2.top + 4;
    
    let square2EndPos = {
        x: gap + (containerRect2.width - gap - gap - 8 - 8 - 8) / 4 + 8 + (containerRect2.width - gap - gap - 8 - 8 - 8) / 4 + 8 + (containerRect2.width - gap - gap - 8 - 8 - 8) / 4 + 4, // Left gap + 3 panels + 2 gaps + half gap
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
        
        square2.style.left = (x - 4) + 'px';
        square2.style.top = (y - 4) + 'px';
        
        updatePanels();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
            clickLocked = false;
            // Update body class after animation completes
            updatePanels();
        }
    }
    
    requestAnimationFrame(animate);
}

function animateSquare1FromSquare2ToSquare1Position() {
    if (animating) return;
    
    animating = true;
    clickLocked = true;
    let startTime = performance.now();
    let duration = window.innerWidth <= 600 ? 1000 : 1400; // Longer duration for S-curve movement
    
    // Make center panel transparent during movement
    centerPanel.style.opacity = '0';
    
    // Calculate square1's end position (where it should go back to)
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let gap = 12;
    
    // Calculate square1's end position based on 25% of container width
    let h = containerRect.height;
    let verticalPercent = window.innerWidth <= 600 ? 0.49 : 0.503;
    let centerPanelRect = centerPanel.getBoundingClientRect();
    let square1StartY = centerPanelRect.top - containerRect.top - 4;
    
    let square1EndPos = {
        x: gap + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 4, // Left gap + panel width + half gap
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
        
        square1.style.left = (x - 4) + 'px';
        square1.style.top = (y - 4) + 'px';
        
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
            // Update body class after animation completes
            updatePanels();
        }
    }
    
    requestAnimationFrame(animate);
}

function teleportSquare1ToSquare2EndPosition() {
    // Calculate square2's end position
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let gap = 12;
    let h = containerRect.height;
    let verticalPercent = window.innerWidth <= 600 ? 0.46 : 0.475;
    let centerPanelRect = centerPanel.getBoundingClientRect();
    let square2StartY = centerPanelRect.bottom - containerRect.top + 4;
    
    let square2EndPos = {
        x: gap + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 8 + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 8 + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 4, // Left gap + 3 panels + 2 gaps + half gap
        y: square2StartY - h * verticalPercent
    };
    
    // Teleport square1 to square2's end position
    square1.style.left = (square2EndPos.x - 4) + 'px';
    square1.style.top = (square2EndPos.y - 4) + 'px';
    
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

function updateFixedTextTRClipping() {
    let fixedTextTR = document.getElementById('fixed-text-tr');
    let pTR = document.getElementById('panel-top-right');
    
    if (!fixedTextTR || !pTR) return;
    
    let container = document.getElementById('main-container');
    let containerRect = container.getBoundingClientRect();
    let panelRect = pTR.getBoundingClientRect();
    
    // Calculate the panel's position relative to the viewport
    let panelLeft = panelRect.left;
    let panelTop = panelRect.top;
    let panelRight = panelRect.right;
    let panelBottom = panelRect.bottom;
    
    // Calculate the fixed text's position relative to the viewport
    let textRect = fixedTextTR.getBoundingClientRect();
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
    fixedTextTR.style.clipPath = `polygon(${clipLeft}% ${clipTop}%, ${100 - clipRight}% ${clipTop}%, ${100 - clipRight}% ${100 - clipBottom}%, ${clipLeft}% ${100 - clipBottom}%)`;
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
    
    // Close any open accordion panel before proceeding
    if (window.closeAnyOpenAccordionAsync) {
        window.closeAnyOpenAccordionAsync().then(() => {
            // Continue with Projects panel logic after accordion closes
            continueProjectsAnimation();
        });
        return; // Exit early, animation will continue in the promise
    }
    
}

function continueProjectsAnimation() {
    if (currentMode === 'square1' && square1InExtendedMode) {
        // Extended mode is active, reverse the S-curve movement
        animateSquare1FromSquare2ToSquare1Position();
    } else if (currentMode === 'square2') {
        // Check if square1 is at square2's end position (extended mode trigger)
        let container = document.getElementById('main-container');
        let containerRect = container.getBoundingClientRect();
        let gap = 12;
        let h = containerRect.height;
        let verticalPercent = window.innerWidth <= 600 ? 0.46 : 0.475;
        let centerPanelRect = centerPanel.getBoundingClientRect();
        let square2StartY = centerPanelRect.bottom - containerRect.top + 4;
        
        let square2EndPos = {
            x: gap + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 8 + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 8 + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 4, // Left gap + 3 panels + 2 gaps + half gap
            y: square2StartY - h * verticalPercent
        };
        
        // Check if square1 is at square2's end position
        let square1Rect = square1.getBoundingClientRect();
        let containerRect2 = container.getBoundingClientRect();
        let square1X = square1Rect.left - containerRect2.left + 4;
        let square1Y = square1Rect.top - containerRect2.top + 4;
        
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
    
    // Only blink if the panel is not expanded and not animating (desktop only)
    if (window.innerWidth <= 600 || !(currentMode === 'square2' || square1InExtendedMode || (currentMode === 'square1' && square1Extended) || animating)) {
        blinkProjectsText();
    }
}

function onAboutClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent clicking during animations
    if (clickLocked || animating) return;
    
    // Close any open accordion panel before proceeding
    if (window.closeAnyOpenAccordionAsync) {
        window.closeAnyOpenAccordionAsync().then(() => {
            // Continue with About panel logic after accordion closes
            continueAboutAnimation();
        });
        return; // Exit early, animation will continue in the promise
    }
    
    // If no accordion to close, continue immediately
    continueAboutAnimation();
}

function continueAboutAnimation() {
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
    
    // Only blink if the panel is not expanded and not animating (desktop only)
    if (window.innerWidth <= 600 || !(currentMode === 'square2' || square1InExtendedMode || (currentMode === 'square1' && square1Extended) || animating)) {
        blinkAboutText();
    }
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
    
    // Blink the text and panel
    blinkBottomRightText();
    
    // Smooth scroll to center of bottom-right panel at top of screen
    const bottomRightPanel = document.getElementById('panel-bottom-right');
    if (bottomRightPanel) {
        const panelRect = bottomRightPanel.getBoundingClientRect();
        const panelCenter = panelRect.top + (panelRect.height / 2);
        const targetScroll = window.pageYOffset + panelCenter;
        
        // Custom smooth scroll with gradual acceleration and deceleration
        const startPosition = window.pageYOffset;
        const distance = targetScroll - startPosition;
        const duration = 1800; // 1.8 seconds - shorter and smoother
        let startTime = null;
        let isScrolling = true;
        
        function smoothScrollToGallery(currentTime) {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Smoother easing: gentle start, smooth middle, gentle end
            // Using a single cubic curve for more consistent motion
            const easeProgress = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            // Update scroll position
            const newPosition = startPosition + (distance * easeProgress);
            window.scrollTo(0, newPosition);
            
            // Continue animation if not complete
            if (progress < 1 && isScrolling) {
                requestAnimationFrame(smoothScrollToGallery);
            }
        }
        
        // Start the smooth scroll animation
        requestAnimationFrame(smoothScrollToGallery);
        
        // Allow interruption by user scroll
        const handleUserScroll = () => {
            isScrolling = false;
            window.removeEventListener('wheel', handleUserScroll);
            window.removeEventListener('touchmove', handleUserScroll);
        };
        
        window.addEventListener('wheel', handleUserScroll, { passive: true });
        window.addEventListener('touchmove', handleUserScroll, { passive: true });
    }
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
    let gap = 12;
    
    if (currentMode === 'square1') {
        // Square1 positions (existing logic)
        let centerPanelTop = centerPanelRect.top - containerRect.top;
        let centerPanelBottom = centerPanelRect.bottom - containerRect.top;
        
        startPos = {
            x: Math.round(containerRect.width / 2),
            y: centerPanelTop - 4
        };
        
        // Calculate end position based on 25% of container width
        let h = containerRect.height;
        let verticalPercent = window.innerWidth <= 600 ? 0.49 : 0.503;
        
        endPos = {
            x: gap + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 4, // Left gap + panel width + half gap
            y: startPos.y + h * verticalPercent
        };
    } else {
        // Square2 positions (inverted logic)
        let centerPanelTop = centerPanelRect.top - containerRect.top;
        let centerPanelBottom = centerPanelRect.bottom - containerRect.top;
        
        startPos = {
            x: Math.round(containerRect.width / 2),
            y: centerPanelBottom + 4
        };
        
        // Calculate end position based on 75% of container width
        let h = containerRect.height;
        let verticalPercent = window.innerWidth <= 600 ? 0.46 : 0.475;
        
        endPos = {
            x: gap + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 8 + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 8 + (containerRect.width - gap - gap - 8 - 8 - 8) / 4 + 4, // Left gap + 3 panels + 2 gaps + half gap
            y: startPos.y - h * verticalPercent
        };
    }
}

// Initialize Lenis smooth scrolling
let lenis;

// Disable scroll restoration to prevent browser from remembering scroll position
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Initialize on load
window.addEventListener('load', function() {
    // Initialize Lenis
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // RAF loop for Lenis
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Force scroll to top on page load
    lenis.scrollTo(0, { immediate: true });
    
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

// Initialize accordion functionality
function initAccordion() {
    const GAP_PX = 8;    // keep gap at 8px as requested
    
    let openId = null; // Track which panel is currently open
    
    // Function to calculate responsive rectangle dimensions
    function calculateRectangleDimensions() {
        // Get main container height for height constraint
        const mainContainer = document.getElementById('main-container');
        const containerHeight = mainContainer ? mainContainer.offsetHeight : window.innerHeight;
        
        // Height is fixed at 23.5% of main container height
        const rectHeight = containerHeight * 0.235;
        
        // Width is calculated from height to maintain 2:3 aspect ratio (width = height × 2/3)
        const rectWidth = rectHeight * (2/3);
        
        return { width: rectWidth, height: rectHeight };
    }
    
    // Function to update all accordion grid layouts
    function updateAccordionLayouts() {
        const dimensions = calculateRectangleDimensions();
        
        // Update all accordion grids
        const grids = document.querySelectorAll('.accordion-grid');
        grids.forEach(grid => {
            grid.style.gridTemplateColumns = `${dimensions.width}px ${dimensions.width}px`;
        });
        
        // Update rectangle heights to maintain aspect ratio within height constraint
        const rectangles = document.querySelectorAll('.accordion-grid > a');
        rectangles.forEach(rect => {
            rect.style.height = `${dimensions.height}px`;
        });
    }
    
    // Initial layout calculation
    updateAccordionLayouts();
    
    // Update layout on window resize
    window.addEventListener('resize', updateAccordionLayouts);
    
    function toggle(id) {
        if (openId === id) {
            // Close the currently open panel
            openId = null;
            closePanel(id);
        } else {
            // Close any open panel first, then open the clicked one
            if (openId) {
                closePanel(openId);
            }
            openId = id;
            openPanel(id);
        }
    }
    
    function openPanel(id) {
        const panel = document.getElementById(`panel-${id}`);
        const trigger = document.querySelector(`[data-panel="${id}"]`);
        
        if (panel && trigger) {
            // Update ARIA attributes
            trigger.setAttribute('aria-expanded', 'true');
            
            // Show panel and animate height
            panel.style.display = 'block';
            panel.style.height = '0';
            panel.style.overflow = 'hidden';
            
            // Get the natural height of the content
            const contentHeight = panel.scrollHeight;
            
            // Animate to full height with slow start easing
            requestAnimationFrame(() => {
                panel.style.transition = 'height 0.7s cubic-bezier(0.6, 0, 0.2, 1)';
                panel.style.height = contentHeight + 'px';
            });
            
            // Fade in the black rectangles
            const rectangles = panel.querySelectorAll('.accordion-grid > a');
            rectangles.forEach(rect => {
                rect.style.opacity = '0';
                rect.style.transition = 'opacity 0.2s ease-in-out';
                requestAnimationFrame(() => {
                    rect.style.opacity = '1';
                });
            });
        }
    }
    
    function closePanel(id) {
        const panel = document.getElementById(`panel-${id}`);
        const trigger = document.querySelector(`[data-panel="${id}"]`);
        
        if (panel && trigger) {
            // Update ARIA attributes
            trigger.setAttribute('aria-expanded', 'false');
            
            // Fade out the black rectangles after a delay
            const rectangles = panel.querySelectorAll('.accordion-grid > a');
            setTimeout(() => {
                rectangles.forEach(rect => {
                    rect.style.transition = 'opacity 0.4s ease-in-out';
                    rect.style.opacity = '0';
                });
            }, 300);
            
            // Animate height to 0 with slow start easing
            panel.style.transition = 'height 0.7s cubic-bezier(0.6, 0, 0.2, 1)';
            panel.style.height = '0';
            
            // Hide panel after animation completes
            setTimeout(() => {
                panel.style.display = 'none';
            }, 700);
        }
    }
    
    // Function to close any open accordion panel
    function closeAnyOpenAccordion() {
        if (openId !== null) {
            closePanel(openId);
            openId = null;
        }
    }
    
    // Function to close any open accordion panel and return a promise
    function closeAnyOpenAccordionAsync() {
        return new Promise((resolve) => {
            if (openId !== null) {
                closePanel(openId);
                openId = null;
                // Wait for accordion close animation to complete (300ms)
                setTimeout(resolve, 300);
            } else {
                resolve();
            }
        });
    }
    
    // Add click handlers for accordion functionality
    const triggers = document.querySelectorAll('.accordion-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const panelId = this.getAttribute('data-panel');
            toggle(panelId);
        });
    });
    
    // Make closeAnyOpenAccordion available globally
    window.closeAnyOpenAccordion = closeAnyOpenAccordion;
    window.closeAnyOpenAccordionAsync = closeAnyOpenAccordionAsync;
    
    // Add click handler to Projects panel to close accordions when clicking outside triggers/rectangles
    const projectsPanel = document.getElementById('panel-top-right');
    if (projectsPanel) {
        projectsPanel.addEventListener('click', function(e) {
            // Don't close accordion if clicking on trigger text or black rectangles
            if (e.target.closest('.accordion-trigger') || e.target.closest('.accordion-grid a')) {
                return;
            }
            
            // Close any open accordion before proceeding with Projects panel logic
            closeAnyOpenAccordion();
        });
    }
}

// Initialize accordion when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (lenis) {
        lenis.scrollTo(0, { immediate: true });
    } else {
        window.scrollTo(0, 0);
    }
    
    // Initialize accordion functionality
    initAccordion();
}); 