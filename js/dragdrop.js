/**
 * Drag & Drop System v3 — Pointer Events with Android/iOS fixes
 * 
 * Key fixes for Android (Chrome, Firefox, Samsung Internet):
 * 1. setPointerCapture — reliable tracking even if finger leaves element
 * 2. touch-action:none set via JS on ALL draggable elements & drop zones
 * 3. body touch-action:none during drag (overflow:hidden alone fails on Android)
 * 4. visibility:hidden for elementFromPoint (no reflow, faster than display:none)
 * 5. Explicit pointer-events:none on clone (ensures elementFromPoint skips it)
 * 6. Handles pointercancel (common on Android from system notifications)
 * 7. Cancels previous drag if new one starts (prevents stuck state)
 * 8. Element-level listeners + document fallback (double reliability)
 */
const DragDrop = {
    active: null,
    clone: null,
    offX: 0, offY: 0,
    _move: null, _end: null,

    makeDraggable(el, cb = {}) {
        // CRITICAL: Set touch-action:none via JS — Android browsers need this
        // to stop intercepting touch for scroll/zoom
        el.style.touchAction = 'none';
        el.style.webkitUserSelect = 'none';
        el.style.userSelect = 'none';
        el.style.webkitTouchCallout = 'none';

        // Use pointerdown with passive:false to ensure preventDefault works
        el.addEventListener('pointerdown', e => this._start(e, el, cb), { passive: false });
    },

    makeDropZone(el) {
        // Don't overwrite existing data-drop value (e.g., data-drop="basket")
        if (!el.hasAttribute('data-drop')) el.setAttribute('data-drop', 'true');
        // Drop zones also need touch-action:none to prevent scroll interference on Android
        el.style.touchAction = 'none';
    },

    _start(e, el, cb) {
        if (el.classList.contains('placed') || el.classList.contains('disabled')) return;

        // Cancel any existing drag (prevents stuck state on Android)
        if (this.active) this._cancel();

        e.preventDefault();

        Sound.init();
        const rect = el.getBoundingClientRect();
        this.offX = e.clientX - rect.left;
        this.offY = e.clientY - rect.top;

        // Visual clone follows pointer
        this.clone = el.cloneNode(true);
        this.clone.classList.add('drag-clone');
        this.clone.style.width = rect.width + 'px';
        this.clone.style.height = rect.height + 'px';
        // Explicitly set pointer-events:none so elementFromPoint skips clone
        this.clone.style.pointerEvents = 'none';
        this._position(e);
        document.body.appendChild(this.clone);

        el.classList.add('dragging');
        this.active = { el, cb };
        Sound.click();

        // CRITICAL: setPointerCapture ensures we keep receiving pointer events
        // even if finger moves outside the element or leaves the viewport.
        // This is the #1 fix for Android drag reliability.
        if (typeof el.setPointerCapture === 'function') {
            try { el.setPointerCapture(e.pointerId); } catch (err) {}
        }

        // Store bound handlers for proper cleanup
        this._move = e2 => this._moveFn(e2);
        this._end = e2 => this._endFn(e2);

        // Element-level listeners (primary — works with pointer capture)
        el.addEventListener('pointermove', this._move, { passive: false });
        el.addEventListener('pointerup', this._end, { passive: false });
        el.addEventListener('pointercancel', this._end, { passive: false });

        // Document-level listeners (fallback — for browsers without pointer capture)
        document.addEventListener('pointermove', this._move, { passive: false });
        document.addEventListener('pointerup', this._end, { passive: false });
        document.addEventListener('pointercancel', this._end, { passive: false });

        // CRITICAL: On Android, overflow:hidden alone does NOT prevent touch scroll.
        // Must also set touch-action:none on body during drag.
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
    },

    _position(e) {
        if (!this.clone) return;
        this.clone.style.left = (e.clientX - this.offX) + 'px';
        this.clone.style.top = (e.clientY - this.offY) + 'px';
    },

    _moveFn(e) {
        if (!this.active || !this.clone) return;
        e.preventDefault();
        this._position(e);

        // Detect drop target — use visibility:hidden (no reflow, faster than display:none)
        // Combined with pointer-events:none on clone, elementFromPoint will skip it
        this.clone.style.visibility = 'hidden';
        const below = document.elementFromPoint(e.clientX, e.clientY);
        this.clone.style.visibility = '';

        // Clear previous drag-over highlights
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        if (below) {
            const t = below.closest('[data-drop]');
            if (t) t.classList.add('drag-over');
        }
    },

    _endFn(e) {
        if (!this.active) return;
        this._cleanup(e);

        const el = this.active.el;
        let dropTarget = null;

        // Find drop target at release point
        if (this.clone) {
            this.clone.style.visibility = 'hidden';
            const below = document.elementFromPoint(e.clientX, e.clientY);
            this.clone.style.visibility = '';
            if (below) dropTarget = below.closest('[data-drop]');
        }

        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        el.classList.remove('dragging');

        if (dropTarget) {
            if (this.active.cb.onDrop) this.active.cb.onDrop(dropTarget, this.active.el);
            Sound.drop();
        } else if (this.active.cb.onCancel) {
            this.active.cb.onCancel(this.active.el);
        }

        if (this.clone) { this.clone.remove(); this.clone = null; }
        this.active = null;
    },

    _cancel() {
        // Cancel current drag without firing drop/cancel callbacks
        // Used when a new drag starts before previous ends
        if (!this.active) return;
        const el = this.active.el;
        this._cleanup({ pointerId: -1 });
        el.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        if (this.clone) { this.clone.remove(); this.clone = null; }
        this.active = null;
    },

    _cleanup(e) {
        // Remove all event listeners
        const el = this.active ? this.active.el : null;
        if (el) {
            el.removeEventListener('pointermove', this._move);
            el.removeEventListener('pointerup', this._end);
            el.removeEventListener('pointercancel', this._end);
            // Release pointer capture
            if (typeof el.releasePointerCapture === 'function' && e.pointerId >= 0) {
                try { el.releasePointerCapture(e.pointerId); } catch (err) {}
            }
        }
        document.removeEventListener('pointermove', this._move);
        document.removeEventListener('pointerup', this._end);
        document.removeEventListener('pointercancel', this._end);

        // Restore body styles (CRITICAL for Android — must restore touch-action)
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
    }
};
