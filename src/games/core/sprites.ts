/**
 * Represents a single frame in an animation
 */
export interface SpriteFrame {
    /// The x-coordinate in the spritesheet
    x: number;
    /// The y-coordinate in the spritesheet
    y: number;
    /// The width of the frame 
    width: number;
    /// The height of the frame
    height: number;
    /// Optional duration for the frame in milliseconds
    duration?: number;
}

/**
 * Animation definition for a sprite
 */
export interface SpriteAnimation {
    /// Name of the animation 
    name: string;
    /// Frames that make up the animation
    frames: SpriteFrame[];
    /// Default frame duration in ms (can be overridden per frame)
    frameDuration: number;
    /// Whether the animation loops
    loop: boolean;
}

/**
 * Sprite class for rendering animated game entities
 */
export class Sprite {
    /// Spritesheet image
    private image: HTMLImageElement;
    /// Map of animation images by name
    private animations: Map<string, SpriteAnimation> = new Map();
    /// Current animation
    private currentAnimation: SpriteAnimation | null = null;
    /// Current frame index
    private currentFrameIndex: number = 0;
    /// Time elapsed on the current frame
    private frameTime = 0;
    /// Whether the sprite is flipped horizontally
    private flippedX = false;
    /// Whether the sprite is flipped vertically
    private flippedY = false;
    /// Opacity of the sprite (0-1)
    private opacity = 1;
    /// Scale factor
    private scale = 1;
    /// Rotation angle in radians
    private rotation = 0; 
    /// Whether the animation is playing 
    private playing = false;
    /// Callback for when animation completes
    private onCompleteCallback: (() => void) | null = null;

    /**
     * Create a new Sprite with a spritesheet
     *
     * @param src - URL of the spritesheet image
     */
    constructor(src: string) {
        this.image = new Image();
        this.image.src = src;
    }

    /**
     * Load the spritesheet and return a promise that resolves when loaded
     */
    load(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.image.complete) {
                resolve();
                return;
            }
            this.image.onload = () => resolve();
            this.image.onerror = () => reject(new Error(`Failed to load image: ${this.image.src}`));
        })
    }

    /**
     * Add an animation to the sprite
     *
     * @param animation - Animation to add
     */
    addAnimation(animation: SpriteAnimation): void {
        this.animations.set(animation.name, animation);
        // if this is the first animation, set it as the current animation
        if (!this.currentAnimation) {
            this.setAnimation(animation.name);
        }
    }

    /**
     * Set the current animation
     *
     * @param name - Name of the animation to set
     * @param resetFrame - Whether to reset the frame index
     */
    setAnimation(name: string, resetFrame = true): boolean {
        const animation = this.animations.get(name);
        if (!animation) {
            console.warn(`Animation '${name}' not found`);
            return false;
        }

        this.currentAnimation = animation;
        if (resetFrame) {
            this.currentFrameIndex = 0;
            this.frameTime = 0;
        }
        return true,
    }

    /**
     * Start playing the current animation
     */
    startPlay(): void {
        this.playing = true;
        this.frameTime = 0;
        this.currentFrameIndex = 0;
    }

    /**
     * Stop playing the current animation 
     */
    stopPlay(): void {
        this.playing = false;
        this.currentFrameIndex = 0;
        this.frameTime = 0;
        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }

    /**
     * Pause the current animation
     */
    pausePlay(): void {
        this.playing = false;
    }

    /**
     * Resume the current animatiob
     */
    resumePlay(): void {
        this.playing = true;
    }

    /**
     * Set a Callback to be called when the animation completes
     *
     * Not valid for animations that loop
     */
    onComplete(callback: () => void): void {
        this.onCompleteCallback = callback;
    }

    /**
     * Update the sprite animation
     *
     * @param deltaTime - Time elapsed since the last update in ms
     */
    update(deltaTime: number): void {
        if (!this.playing || !this.currentAnimation) {
            return;
        }
        this.frameTime += deltaTime;
        // Get current frame and frame duration
        const frame = this.currentAnimation.frames[this.currentFrameIndex];
        const frameDuration = frame.duration ?? this.currentAnimation.frameDuration;

        // Check if it's time to advance to next frame
        if (this.frameTime >= frameDuration) {
            this.frameTime -= frameDuration;
            this.currentFrameIndex++;

            // Check if animation has ended
            if (this.currentFrameIndex >= this.currentAnimation.frames.length) {
                if (this.currentAnimation.loop) {
                    // loop back from start
                    this.currentFrameIndex = 0;
                } else {
                    // stop at the last frame
                    this.currentFrameIndex = this.currentAnimation.frames.length - 1;
                    this.playing = false;
                    if (this.onCompleteCallback) {
                        this.onCompleteCallback();
                    }
                }
            }
        }
    }

    /**
     * Render the sprite to a canvas
     *
     * @param ctx - Canvas rendering context
     * @param x - x-coordinate to render at
     * @param y - y-coordinate to render at
     */
    render(ctx: CanvasRenderingContext2D, x: number, y: number) {
        if (!this.currentAnimation || this.currentFrameIndex >= this.currentAnimation.frames.length) {
            return;
        }
        const frame = this.currentAnimation.frames[this.currentFrameIndex];

        // save current context frame
        ctx.save();
        // apply transformations
        ctx.translate(x, y);

        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        } 
        const scaleX = this.flippedX ? -this.scale : this.scale;
        const scaleY = this.flippedY ? -this.scale : this.scale;
        ctx.scale(scaleX, scaleY);
        
        if (this.opacity !== 1) {
            ctx.globalAlpha = this.opacity;
        }

        const width = frame.width;
        const height = frame.height;

        ctx.drawImage(
            this.image,
            frame.x, frame.y, frame.width, frame.height, -width / 2, - height / 2, width, height
        );
        // restore context frame
        ctx.restore();
    }

    /**
     * Set horizontal flip state
     */
    setFlipX(flipped: boolean): void {
        this.flippedX = flipped;
    }

    /**
     * Set vertical flip state
     */
    setFlipY(flipped: boolean): void {
        this.flippedY = flipped;
    }

    /**
     * Set opacity
     */
    setOpacity(opacity: number): void {
        this.opacity = Math.max(0, Math.min(1, opacity));
    }

    /**
     * Set scale factor
     */
    setScale(scale: number): void {
        this.scale = scale;
    }

    /**
     * Set rotation angle in radians
     */
    setRotation(rotation: number): void {
        this.rotaion = rotation;
    }

    /**
     * Get the width of the current frame
     */
    getWidth(): number {
        if (!this.currentAnimation || this.currentFrameIndex >= this.currentAnimation.frames.length) {
            return 0;
        }
        return this.currentAnimation.frames[this.currentFrameIndex].width * this.scale;
    }

    /**
     * Get the height of the current frame
     */
    getHeight(): number {
        if (!this.currentAnimation || this.currentFrameIndex >= this.currentAnimation.frames.length) {
            return 0;
        }
        return this.currentAnimation.frames[this.currentFrameIndex].height * this.scale;
    }

    /**
     * Check if the sprite contains a specific point
     * Useful for touch/mouse interaction
     */
    containsPoint(pointX: number, pointY: number, spriteX: number, spriteY: number): boolean {
        if (!this.currentAnimation || this.currentFrameIndex >= this.currentAnimation.frames.length) {
            return false;
        }
        const frame = this.currentAnimation.frames[this.currentFrameIndex]; 
        const halfWidth = frame.width * this.scale / 2;
        const halfHeight = frame.height * this.scale / 2;
        return (pointX >= spriteX - halfWidth && pointX <= spriteX + halfWidth && pointY >= spriteY - halfHeight && pointY <= spriteY + halfHeight);
    }

    /**
     * Check if sprite collides with another sprite
     * Uses simple bounding box detection
     */
    collidesWith(other: Sprite, thisX: number, thisY: number, otherX: number, otherY: number): boolean {
        if (!this.currentAnimation || this.currentFrameIndex >= this.currentAnimation.frames.length || !other.currentAnimation || other.currentFrameIndex >= other.currentAnimation.frames.length) {
            return false;
        }

        const thisFrame = this.currentAnimation.frames[this.currentFrameIndex];
        const otherFrame = other.currentAnimation.frames[other.currentFrameIndex];

        const thisHalfWidth = thisFrame.width * this.scale / 2;
        const thisHalfHeight = thisFrame.height * this.scale / 2;
        const otherHalfWidth = otherFrame.width * other.scale / 2;
        const otherHalfHeight = otherFrame.height * other.scale / 2;

        return !(
            thisX + thisHalfWidth < otherX - otherHalfWidth || thisX - thisHalfWidth > otherX + otherHalfWidth || thisY + thisHalfHeight < otherY - otherHalfHeight || thisY - thisHalfHeight > otherY + otherHalfHeight
        );
    }
}
    /**
     * Utility for loading multiple sprites at once
     */
    export class SpriteLoader {
        private: sprites: Map<string, Sprite> = new Map();

        /// add a sprite to be loaded
        addSprite(id: string, src: string): Sprite {
            const sprite = new Sprite(src);
            this.sprites.set(id, sprite)
            return sprite;
        }
        
        /// load all sprites and return a promise
        loadAll(): Promise<void> {
            const promises = Array.from(this.sprites.values()).map(sprite => sprite.load());
            return Promise.all(promises).then(() => {});
        }

        /// Get a loaded sprite by id
        get(id: string): Sprite | undefined {
            return this.sprites.get(id);
        }
    }