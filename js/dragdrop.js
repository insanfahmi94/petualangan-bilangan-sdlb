/**
 * Drag & Drop System — Pointer Events (mouse + touch unified)
 * Redesigned for reliability on tablets, phones, and IFP
 */
const DragDrop = {
    active: null,
    clone: null,
    offX: 0, offY: 0,
    _move: null, _end: null,

    makeDraggable(el, cb = {}) {
        el.addEventListener('pointerdown', e => this._start(e, el, cb));
    },

    makeDropZone(el) { el.setAttribute('data-drop', 'true'); },

    _start(e, el, cb) {
        if (el.classList.contains('placed') || el.classList.contains('disabled')) return;
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
        this._position(e);
        document.body.appendChild(this.clone);

        el.classList.add('dragging');
        this.active = { el, cb };
        Sound.click();

        this._move = e => this._moveFn(e);
        this._end = e => this._endFn(e);
        document.addEventListener('pointermove', this._move);
        document.addEventListener('pointerup', this._end);
        document.addEventListener('pointercancel', this._end);
        // Prevent scrolling while dragging on touch
        document.body.style.overflow = 'hidden';
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

        // Detect drop target
        this.clone.style.display = 'none';
        const below = document.elementFromPoint(e.clientX, e.clientY);
        this.clone.style.display = '';
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        if (below) {
            const t = below.closest('[data-drop]');
            if (t) t.classList.add('drag-over');
        }
    },

    _endFn(e) {
        if (!this.active) return;
        document.body.style.overflow = '';

        this.clone.style.display = 'none';
        const below = document.elementFromPoint(e.clientX, e.clientY);
        this.clone.style.display = '';

        let dropTarget = null;
        if (below) dropTarget = below.closest('[data-drop]');

        document.removeEventListener('pointermove', this._move);
        document.removeEventListener('pointerup', this._end);
        document.removeEventListener('pointercancel', this._end);
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

        this.active.el.classList.remove('dragging');

        if (dropTarget) {
            if (this.active.cb.onDrop) this.active.cb.onDrop(dropTarget, this.active.el);
            Sound.drop();
        } else if (this.active.cb.onCancel) {
            this.active.cb.onCancel(this.active.el);
        }

        if (this.clone) { this.clone.remove(); this.clone = null; }
        this.active = null;
    }
};
