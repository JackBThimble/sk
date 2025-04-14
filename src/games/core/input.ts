/**
 * Input Manager to handle keyboard, mouse and touch input
 */
export class InputManager {
	/** Map to track currently pressed keys */
	private keyStates: Map<string, boolean> = new Map();
	/** Map to track key press handlers */
	private keyPressHandlers: Map<string, Function[]> = new Map();
	/** Map to track key release handlers */
	private keyReleaseHandlers: Map<string, Function[]> = new Map();
	/** Reference to attached canvas for mouse/touch events */
	private canvas: HTMLCanvasElement | null = null;
	/** Mouse position */
	private mousePosition = { x: 0, y: 0 };
	/** Mouse button state */
	private mouseButtons: boolean[] = [false, false, false];
	/** Touch states */
	private touches: Touch[] = [];
	/** Mouse move handlers */
	private mouseMoveHandlers: Function[] = [];
	/** Mouse down handlers */
	private mouseDownHandlers: Function[] = [];
	/** Mouse up handlers */
	private mouseUpHandlers: Function[] = [];
	/** Touch start handlers */
	private touchStartHandlers: Function[] = [];
	/** Touch move handlers */
	private touchMoveHandlers: Function[] = [];
	/** Touch end handlers */
	private touchEndHandlers: Function[] = [];

	constructor() {
		window.addEventListener('keydown', this.handleKeyDown.bind(this));
		window.addEventListener('keyup', this.handleKeyUp.bind(this));
	}

	/**
	 * Attach canvas element for mouse/touch events
	 */
	attachCanvas(canvas: HTMLCanvasElement): void {
		if (this.canvas) {
			this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
			this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
			this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
			this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
			this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
			this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
		}

		this.canvas = canvas;

		this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
		this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
		this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
		this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
		this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
		this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
	}

	/**
	 * Handle key down events
	 */
	private handleKeyDown(event: KeyboardEvent): void {
		const key = event.key.toLowerCase();
		this.keyStates.set(key, true);

		const handlers = this.keyPressHandlers.get(key);
		if (handlers) {
			handlers.forEach((handler) => handler(event));
		}
	}

	/**
	 * Handle key up events
	 */
	private handleKeyUp(event: KeyboardEvent): void {
		const key = event.key.toLowerCase();
		this.keyStates.set(key, false);

		const handlers = this.keyReleaseHandlers.get(key);
		if (handlers) {
			handlers.forEach((handler) => handler(event));
		}
	}

	/**
	 * check if a key is currently pressed
	 */
	isKeyPressed(key: string): boolean {
		return !!this.keyStates.get(key.toLowerCase());
	}

	/**
	 * Register a handler for when a key is pressed
	 */
	onKeyPress(key: string, handler: Function): void {
		const k = key.toLowerCase();
		if (!this.keyPressHandlers.has(k)) {
			this.keyPressHandlers.set(k, []);
		}
		this.keyPressHandlers.get(k)?.push(handler);
	}

	/**
	 * Register a handler for when a key is released
	 */
	onKeyRelease(key: string, handler: Function): void {
		const k = key.toLowerCase();
		if (!this.keyReleaseHandlers.has(k)) {
			this.keyReleaseHandlers.set(k, []);
		}
		this.keyReleaseHandlers.get(k)?.push(handler);
	}

	/**
	 * Remove a key press handler
	 */
	offKeyPress(key: string, handler: Function): void {
		const k = key.toLowerCase();
		if (!this.keyPressHandlers.has(k)) return;

		const handlers = this.keyPressHandlers.get(k);
		if (handlers) {
			this.keyPressHandlers.set(
				k,
				handlers.filter((h) => h !== handler)
			);
		}
	}

	/**
	 * Remove a key release handler
	 */
	offKeyRelease(key: string, handler: Function): void {
		const k = key.toLowerCase();
		if (!this.keyReleaseHandlers.has(k)) return;

		const handlers = this.keyReleaseHandlers.get(k);
		if (handlers) {
			this.keyReleaseHandlers.set(
				k,
				handlers.filter((h) => h !== handler)
			);
		}
	}

	/**
	 * Handle mouse move events
	 */
	private handleMouseMove(event: MouseEvent): void {
		if (!this.canvas) return;

		const rect = this.canvas.getBoundingClientRect();
		this.mousePosition = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		this.mouseMoveHandlers.forEach((handler) => handler(this.mousePosition, event));
	}

	/**
	 * handle mouse down events
	 */
	private handleMouseDown(event: MouseEvent): void {
		this.mouseButtons[event.button] = true;
		this.mouseDownHandlers.forEach((handler) => handler(event.button, this.mousePosition, event));
	}

	/**
	 * handle mouse up events
	 */
	private handleMouseUp(event: MouseEvent): void {
		this.mouseButtons[event.button] = false;
		this.mouseUpHandlers.forEach((handler) => handler(event.button, this.mousePosition, event));
	}

	/**
	 * handle touch start
	 */
	private handleTouchStart(event: TouchEvent): void {
		event.preventDefault();
		this.touches = Array.from(event.touches);
		this.touchStartHandlers.forEach((handler) => handler(this.getTouchPositions(), event));
	}

	/**
	 * handle touch move events
	 */
	private handleTouchMove(event: TouchEvent): void {
		event.preventDefault();
		this.touches = Array.from(event.touches);
		this.touchMoveHandlers.forEach((handler) => handler(this.getTouchPositions(), event));
	}

	/**
	 * handle touch end events
	 */
	private handleTouchEnd(event: TouchEvent): void {
		event.preventDefault();
		this.touches = Array.from(event.touches);
		this.touchEndHandlers.forEach((handler) => handler(this.getTouchPositions(), event));
	}

	/**
	 * Get an array of touch positions relative to the canvas
	 */
	private getTouchPositions(): { id: number; x: number; y: number }[] {
		if (!this.canvas) return [];

		const rect = this.canvas.getBoundingClientRect();
		return this.touches.map((touch) => ({
			id: touch.identifier,
			x: touch.clientX - rect.left,
			y: touch.clientY - rect.top
		}));
	}

	/**
	 * get the current mouse position
	 */
	getMousePosition(): { x: number; y: number } {
		return this.mousePosition;
	}

	/**
	 * check if mouse button is pressed
	 */
	isMouseButtonPressed(button: number): boolean {
		return !!this.mouseButtons[button];
	}

	/**
	 * Register a handler for mouse move events
	 */
	onMouseMove(handler: Function): void {
		this.mouseMoveHandlers.push(handler);
	}

	/**
	 * Register a handler for mouse down events
	 */
	onMouseDown(handler: Function): void {
		this.mouseDownHandlers.push(handler);
	}

	/**
	 * Register a handler for mouse up events
	 */
	onMouseUp(handler: Function): void {
		this.mouseUpHandlers.push(handler);
	}

	/**
	 * Register a handler for touch start events
	 */
	onTouchStart(handler: Function): void {
		this.touchStartHandlers.push(handler);
	}

	/**
	 * Register a handler for touch move events
	 */
	onTouchMove(handler: Function): void {
		this.touchMoveHandlers.push(handler);
	}

	/**
	 * Register a handler for touch end events
	 */
	onTouchEnd(handler: Function): void {
		this.touchEndHandlers.push(handler);
	}

	/**
	 * clean up all event listeners
	 */
	destroy(): void {
		window.removeEventListener('keydown', this.handleKeyDown.bind(this));
		window.removeEventListener('keyup', this.handleKeyUp.bind(this));

		if (this.canvas) {
			this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
			this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
			this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
			this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
			this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
			this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
		}
	}
}
