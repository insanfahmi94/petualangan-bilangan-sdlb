/**
 * Games — 5 permainan berdasarkan TP1–TP5 RPM Matematika Bilangan Kelas I SDLB
 * Uses Twemoji for consistent cross-platform emoji images
 */

// ===== Concrete objects (emoji = non-licensed, universally understood) =====
const OBJECTS = [
    { e:'🍎', n:'apel' }, { e:'🍊', n:'jeruk' }, { e:'🎈', n:'balon' },
    { e:'⭐', n:'bintang' }, { e:'🐟', n:'ikan' }, { e:'🍪', n:'kue' },
    { e:'🌸', n:'bunga' }, { e:'🚗', n:'mobil' }, { e:'🧱', n:'balok' },
    { e:'🍓', n:'stroberi' }, { e:'🦋', n:'kupu-kupu' }, { e:'🍌', n:'pisang' },
    { e:'🍇', n:'anggur' }, { e:'🍒', n:'ceri' }, { e:'🐞', n:'kumbang' },
    { e:'🎀', n:'pita' },
];

const NUM_WORDS = ['satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh'];

// ===== Helpers =====
const ri = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = a => a[Math.floor(Math.random()*a.length)];
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}

/** Global Twemoji config — SVG for crisp rendering on all screens */
const TWEMOJI_CFG = {
    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
    ext: '.svg', size: 'svg', className: 'emoji'
};

/** Convert emoji text to Twemoji images within an element (wrapped in try-catch) */
function renderEmoji(el) {
    try { if (window.twemoji) twemoji.parse(el, TWEMOJI_CFG); }
    catch(e) { /* twemoji parse error — emoji shown as text fallback */ }
}

/** Centralized timer management — prevents stale setTimeout callbacks
 *  from firing after user navigates away from a game (critical bug fix) */
const GameTimers = {
    _timers: [],
    set(fn, ms) { const id = setTimeout(fn, ms); this._timers.push(id); return id; },
    clear() { this._timers.forEach(id => clearTimeout(id)); this._timers = []; }
};
/** Create a span with emoji image */
function emojiSpan(emoji) {
    const s = document.createElement('span');
    s.textContent = emoji;
    renderEmoji(s);
    return s;
}


// ================================================================
// GAME 1 — SERET & HITUNG (TP1: membilang benda konkret 1-10)
// ================================================================
const DragCountGame = {
    round:0, max:5, target:0, obj:null, items:[],

    init(){
        // Clear any stale timers from previous game session
        GameTimers.clear();
        // Ensure basket is a proper drop zone with touch-action:none (Android fix)
        DragDrop.makeDropZone(document.getElementById('dc-basket'));
        this.round=0; this.next();
    },

    next(){
        this.round++;
        if(this.round>this.max){ App.celebrate('Semua selesai!','Kamu hebat berhitung!',3); App.backToMenu(); return; }
        document.getElementById('dc-round').textContent=this.round;
        this.target=ri(1,10);
        this.obj=pick(OBJECTS);
        this.items=[];

        const el=document.getElementById('dc-instruction');
        el.innerHTML = `Seret <strong style="color:var(--red);font-size:1.3em">${this.target}</strong> ${this.obj.e} ${this.obj.n} ke keranjang!`;
        renderEmoji(el);

        document.getElementById('dc-target').textContent=this.target;
        document.getElementById('dc-count').textContent=0;
        const fb=document.getElementById('dc-feedback'); fb.textContent=''; fb.className='game-feedback';

        this.renderBasket();
        const poolSize=Math.max(this.target+ri(2,5),8);
        this.renderPool(poolSize);
    },

    renderPool(count){
        const pool=document.getElementById('dc-pool');
        pool.innerHTML='';
        for(let i=0;i<count;i++) this._addPoolItem('pool-'+i);
        renderEmoji(pool);
    },

    _addPoolItem(id){
        const pool=document.getElementById('dc-pool');
        const item=document.createElement('div');
        item.className='obj-item';
        item.textContent=this.obj.e;
        item.dataset.id=id;
        DragDrop.makeDraggable(item,{
            onDrop:(t,el)=>{
                if(t.id==='dc-basket'||t.closest('#dc-basket')){
                    el.remove();
                    this.items.push({e:this.obj.e,id:el.dataset.id});
                    this.renderBasket();
                    Sound.count();
                }
            }
        });
        pool.appendChild(item);
    },

    removeFromBasket(i){
        const item=this.items[i];
        this.items.splice(i,1);
        this._addPoolItem(item.id);
        renderEmoji(document.getElementById('dc-pool'));
        this.renderBasket();
        Sound.pop();
    },

    renderBasket(){
        const c=document.getElementById('dc-basket-items');
        c.innerHTML='';
        this.items.forEach((item,i)=>{
            const el=document.createElement('div');
            el.className='obj-item';
            el.textContent=item.e;
            el.title='Klik untuk keluarkan';
            el.addEventListener('click',()=>this.removeFromBasket(i));
            c.appendChild(el);
        });
        renderEmoji(c);
        const cnt=this.items.length;
        const ce=document.getElementById('dc-count');
        ce.textContent=cnt;
        ce.classList.toggle('target-met',cnt===this.target);
    },

    check(){
        const cnt=this.items.length;
        const basket=document.getElementById('dc-basket');
        const fb=document.getElementById('dc-feedback');
        if(cnt===this.target){
            basket.classList.add('correct-flash');
            GameTimers.set(()=>basket.classList.remove('correct-flash'),600);
            fb.textContent=`🎉 Hebat! ${cnt} ${this.obj?this.obj.n:'benda'} sudah benar!`;
            fb.className='game-feedback feedback-correct';
            Sound.correct();
            App.addStar('dragCount');
            GameTimers.set(()=>this.next(),1800);
        } else {
            basket.classList.add('wrong-flash');
            GameTimers.set(()=>basket.classList.remove('wrong-flash'),600);
            fb.textContent=cnt<this.target
                ?`🤔 Kurang ${this.target-cnt} lagi. Seret lebih banyak!`
                :`🤔 Kelebihan ${cnt-this.target}. Klik benda untuk keluarkan!`;
            fb.className='game-feedback feedback-wrong';
            Sound.wrong();
        }
    },

    reset(){
        this.items=[];
        this.renderBasket();
        this.renderPool(Math.max(this.target+ri(2,5),8));
        const fb=document.getElementById('dc-feedback'); fb.textContent=''; fb.className='game-feedback';
    }
};


// ================================================================
// GAME 2 — COCOKKAN JUMLAH (TP2: hubungkan jumlah benda ↔ angka)
// ================================================================
const MatchNumberGame = {
    round:0, max:5, rows:[],

    init(){ GameTimers.clear(); this.round=0; this.next(); },

    next(){
        this.round++;
        if(this.round>this.max){ App.celebrate('Semua cocok!','Kamu jago mencocokkan!',3); App.backToMenu(); return; }
        document.getElementById('mn-round').textContent=this.round;
        const fb=document.getElementById('mn-feedback'); fb.textContent=''; fb.className='game-feedback';

        const qs=[];
        while(qs.length<3){const q=ri(1,10); if(!qs.includes(q)) qs.push(q);}
        this.rows=qs.map(q=>{const o=pick(OBJECTS);return{q,e:o.e,n:o.n,done:false}});
        this.render();
    },

    render(){
        const area=document.getElementById('mn-match-area');
        area.innerHTML='';
        this.rows.forEach((r,i)=>{
            const row=document.createElement('div'); row.className='match-row';
            const objs=document.createElement('div'); objs.className='match-objects';
            for(let j=0;j<r.q;j++) objs.appendChild(emojiSpan(r.e));
            row.appendChild(objs);
            const slot=document.createElement('div');
            slot.className='match-slot'; slot.id='mn-slot-'+i;
            slot.setAttribute('data-drop','true');
            slot.dataset.idx=i; slot.dataset.exp=r.q;
            row.appendChild(slot);
            area.appendChild(row);
        });
        renderEmoji(area);

        // Number bank: correct answers + distractors
        const nums=[...this.rows.map(r=>r.q)];
        while(nums.length<5){const d=ri(1,10);if(!nums.includes(d))nums.push(d);}
        const bank=document.getElementById('mn-number-bank');
        bank.innerHTML='';
        shuffle(nums).forEach(n=>{
            const c=document.createElement('div');
            c.className='num-card'; c.textContent=n; c.dataset.number=n;
            c.dataset.id='mn-'+n+'-'+Math.random().toString(36).slice(2,7);
            DragDrop.makeDraggable(c,{
                onDrop:(t,el)=>{
                    if(t.classList.contains('match-slot')&&!t.classList.contains('filled'))
                        this.place(t,el);
                }
            });
            bank.appendChild(c);
        });
    },

    place(slot,card){
        const num=parseInt(card.dataset.number)||0;
        const exp=parseInt(slot.dataset.exp)||0;
        const idx=parseInt(slot.dataset.idx)||0;
        if(!card.dataset.number||isNaN(num)||isNaN(exp)){return;} // Guard against missing data
        slot.textContent=num; slot.classList.add('filled'); card.classList.add('placed');
        const fb=document.getElementById('mn-feedback');

        if(num===exp){
            slot.classList.add('correct');
            if(this.rows[idx]) this.rows[idx].done=true;
            Sound.correct(); App.addStar('matchNumber');
            if(this.rows.every(r=>r.done)){
                fb.textContent='🎉 Semua benar! Hebat sekali!';
                fb.className='game-feedback feedback-correct';
                GameTimers.set(()=>this.next(),1800);
            }
        } else {
            slot.classList.add('wrong');
            Sound.wrong();
            fb.textContent='😅 Coba hitung lagi. Apakah jumlahnya '+num+'?';
            fb.className='game-feedback feedback-wrong';
            GameTimers.set(()=>{
                slot.classList.remove('wrong','filled'); slot.textContent='';
                card.classList.remove('placed');
                fb.textContent=''; fb.className='game-feedback';
            },1600);
        }
    }
};


// ================================================================
// GAME 3 — KERETA ANGKA (TP3: mengurutkan bilangan 1-10)
// ================================================================
const NumberTrainGame = {
    filled:{}, empty:[], preFilled:{},

    init(){
        GameTimers.clear();
        this.filled={}; this.preFilled={};
        const hints=[]; const nh=ri(2,3);
        while(hints.length<nh){const p=ri(1,10);if(!hints.includes(p))hints.push(p);}
        hints.forEach(p=>{this.filled[p]=p;this.preFilled[p]=true;});
        this.empty=[];
        for(let i=1;i<=10;i++) if(!this.filled[i]) this.empty.push(i);
        this.render();
        const fb=document.getElementById('nt-feedback'); fb.textContent=''; fb.className='game-feedback';
    },

    render(){
        const cars=document.getElementById('nt-cars'); cars.innerHTML='';
        for(let i=1;i<=10;i++){
            const car=document.createElement('div'); car.className='train-car';
            const pos=document.createElement('div'); pos.className='car-position'; pos.textContent='#'+i;
            car.appendChild(pos);
            const slot=document.createElement('div'); slot.className='car-slot';
            slot.id='nt-slot-'+i; slot.dataset.pos=i;
            if(this.filled[i]){
                slot.textContent=this.filled[i]; slot.classList.add('filled');
                if(this.preFilled[i]){
                    slot.style.background='rgba(78,205,196,.12)';
                    slot.style.borderColor='var(--teal)'; slot.style.color='var(--teal)';
                }
            } else { DragDrop.makeDropZone(slot); }
            car.appendChild(slot); cars.appendChild(car);
        }

        const cc=document.getElementById('nt-cards'); cc.innerHTML='';
        shuffle(this.empty.slice()).forEach(n=>{
            const c=document.createElement('div');
            c.className='num-card'; c.textContent=n; c.dataset.number=n;
            c.dataset.id='nt-'+n;
            DragDrop.makeDraggable(c,{
                onDrop:(t,el)=>{
                    if(t.classList.contains('car-slot')&&!t.classList.contains('filled')){
                        const p=parseInt(t.dataset.pos)||0;
                        if(p&&!this.filled[p]) this.placeNum(p,t,el);
                    }
                }
            });
            cc.appendChild(c);
        });
    },

    placeNum(pos,slot,card){
        slot.textContent=card.dataset.number;
        slot.classList.add('filled');
        card.classList.add('placed');
        this.filled[pos]=parseInt(card.dataset.number)||0;
        Sound.drop();
    },

    check(){
        let all=true, correct=0;
        for(let i=1;i<=10;i++){
            const s=document.getElementById('nt-slot-'+i);
            s.classList.remove('correct','wrong');
            if(this.preFilled[i]) continue;
            if(this.filled[i]===i){s.classList.add('correct');correct++;}
            else{s.classList.add('wrong');all=false;}
        }
        const fb=document.getElementById('nt-feedback');
        if(all){
            fb.textContent='🎉 Kereta siap berangkat! Semua urutan benar!';
            fb.className='game-feedback feedback-correct';
            Sound.celebrate(); Sound.whistle();
            App.addStar('numberTrain'); App.addStar('numberTrain');
            GameTimers.set(()=>App.celebrate('Choo choo! 🚂','Kereta angka siap berangkat!',2),800);
        } else {
            fb.textContent=`🤔 Ada ${this.empty.length-correct} gerbong belum tepat. Coba lagi!`;
            fb.className='game-feedback feedback-wrong'; Sound.wrong();
        }
    },

    shuffle(){
        for(let i=1;i<=10;i++) if(!this.preFilled[i]) delete this.filled[i];
        this.render();
        const fb=document.getElementById('nt-feedback'); fb.textContent=''; fb.className='game-feedback';
    }
};


// ================================================================
// GAME 4 — GABUNG & HITUNG (TP5: penjumlahan hasil ≤ 5)
// ================================================================
const AdditionGame = {
    round:0, max:5,
    problems:[{a:1,b:1},{a:1,b:2},{a:2,b:2},{a:3,b:2},{a:4,b:1}],
    cur:null, answered:false,

    init(){ GameTimers.clear(); this.round=0; this.answered=false; this.next(); },

    next(){
        this.round++;
        if(this.round>this.max){ App.celebrate('Semua selesai!','Kamu jago menjumlahkan!',3); App.backToMenu(); return; }
        this.answered=false;
        this.cur=this.problems[this.round-1];
        document.getElementById('ad-round').textContent=this.round;
        const fb=document.getElementById('ad-feedback'); fb.textContent=''; fb.className='game-feedback';
        this.render();
    },

    render(){
        const {a,b}=this.cur; const o=pick(OBJECTS); const t=a+b;
        const area=document.getElementById('ad-area'); area.innerHTML='';

        const vis=document.createElement('div'); vis.className='addition-visual';

        const mkGroup=(label,count)=>{
            const g=document.createElement('div'); g.className='add-group';
            const l=document.createElement('div'); l.className='add-group-label'; l.textContent=label;
            const items=document.createElement('div'); items.className='add-group-items';
            for(let i=0;i<count;i++) items.appendChild(emojiSpan(o.e));
            g.appendChild(l); g.appendChild(items); return g;
        };

        const plus=document.createElement('div'); plus.className='add-plus'; plus.textContent='+';
        const eq=document.createElement('div'); eq.className='add-equals'; eq.textContent='=';
        const q=document.createElement('div'); q.className='add-question';
        q.innerHTML=`<span class="q-num">${a}</span> + <span class="q-num">${b}</span> = <span class="q-num">?</span>`;

        vis.appendChild(mkGroup('Kelompok 1',a));
        vis.appendChild(plus);
        vis.appendChild(mkGroup('Kelompok 2',b));
        vis.appendChild(eq);
        vis.appendChild(q);
        area.appendChild(vis);
        renderEmoji(area);

        const ch=document.getElementById('ad-choices'); ch.innerHTML='';
        const opts=[t];
        while(opts.length<3){const d=ri(1,6);if(!opts.includes(d))opts.push(d);}
        shuffle(opts).forEach(v=>{
            const btn=document.createElement('button');
            btn.className='answer-btn'; btn.textContent=v; btn.dataset.value=v;
            btn.addEventListener('click',()=>this.answer(v,btn));
            ch.appendChild(btn);
        });
    },

    answer(val,btn){
        if(this.answered) return;
        this.answered=true;
        const {a,b}=this.cur; const t=a+b;
        const fb=document.getElementById('ad-feedback');
        if(val===t){
            btn.classList.add('correct');
            fb.textContent=`🎉 Benar! ${a} + ${b} = ${t}`;
            fb.className='game-feedback feedback-correct';
            Sound.correct(); App.addStar('addition');
            document.querySelectorAll('#ad-choices .answer-btn').forEach(b=>b.style.pointerEvents='none');
            GameTimers.set(()=>this.next(),1800);
        } else {
            btn.classList.add('wrong');
            fb.textContent='😅 Coba hitung lagi. Gabungkan semua benda lalu hitung!';
            fb.className='game-feedback feedback-wrong'; Sound.wrong();
            GameTimers.set(()=>{btn.classList.remove('wrong');this.answered=false;fb.textContent='';fb.className='game-feedback';},1500);
        }
    }
};


// ================================================================
// GAME 5 — JEJAK ANGKA (TP4: menuliskan lambang bilangan 1-10)
// ================================================================
const TracingGame = {
    canvas:null, ctx:null, drawing:false, hasDrawn:false,
    curNum:null, lx:0, ly:0, _setup:false, _cssW:300, _cssH:300,

    init(){
        GameTimers.clear();
        this.canvas=document.getElementById('tr-canvas');
        this.ctx=this.canvas.getContext('2d');
        this._resizeCanvas();
        this.curNum=null; this.hasDrawn=false;
        const sel=document.getElementById('tr-selector'); if(sel)sel.innerHTML='';
        for(let i=1;i<=10;i++){
            const b=document.createElement('button');
            b.className='tracing-btn'; b.textContent=i;
            b.addEventListener('click',()=>this.select(i,b));
            sel.appendChild(b);
        }
        this.clearCanvas();
        const hint=document.getElementById('tr-hint'); if(hint)hint.style.display='block';
        const fb=document.getElementById('tr-feedback'); if(fb){fb.textContent='';fb.className='game-feedback';}
        this.setupDrawing();
    },

    /** Scale canvas for high-DPI screens (prevents blurry rendering on 3x phones) */
    _resizeCanvas(){
        if(!this.canvas||!this.ctx)return;
        const dpr=window.devicePixelRatio||1;
        const rect=this.canvas.getBoundingClientRect();
        const w=rect.width||300, h=rect.height||300;
        this.canvas.width=Math.round(w*dpr);
        this.canvas.height=Math.round(h*dpr);
        this.ctx.setTransform(1,0,0,1,0,0);
        this.ctx.scale(dpr,dpr);
        this._cssW=w; this._cssH=h;
    },

    setupDrawing(){
        if(this._setup) return; this._setup=true;
        const start=e=>{
            if(!this.curNum)return;
            e.preventDefault();
            this.drawing=true;
            if(typeof this.canvas.setPointerCapture==='function'){
                try{this.canvas.setPointerCapture(e.pointerId)}catch(err){}
            }
            const p=this.pos(e);this.lx=p.x;this.ly=p.y;
            const hint=document.getElementById('tr-hint'); if(hint)hint.style.display='none';
        };
        const draw=e=>{
            if(!this.drawing)return;
            e.preventDefault();const p=this.pos(e);
            const lw=Math.max(8,this._cssW*0.037);
            this.ctx.strokeStyle='#FF6B6B';this.ctx.lineWidth=lw;this.ctx.lineCap='round';this.ctx.lineJoin='round';
            this.ctx.beginPath();this.ctx.moveTo(this.lx,this.ly);this.ctx.lineTo(p.x,p.y);this.ctx.stroke();
            this.ctx.strokeStyle='rgba(255,159,67,.25)';this.ctx.lineWidth=lw*0.6;
            this.ctx.beginPath();this.ctx.moveTo(this.lx,this.ly);this.ctx.lineTo(p.x,p.y);this.ctx.stroke();
            this.lx=p.x;this.ly=p.y;this.hasDrawn=true;
        };
        const end=e=>{
            if(this.drawing){
                this.drawing=false;
                if(this.hasDrawn)Sound.pop();
                if(e&&e.pointerId!==undefined&&typeof this.canvas.releasePointerCapture==='function'){
                    try{this.canvas.releasePointerCapture(e.pointerId)}catch(err){}
                }
            }
        };
        this.canvas.addEventListener('pointerdown',start,{passive:false});
        this.canvas.addEventListener('pointermove',draw,{passive:false});
        this.canvas.addEventListener('pointerup',end,{passive:false});
        this.canvas.addEventListener('pointercancel',end,{passive:false});
    },

    /** Returns pointer position in CSS pixels (ctx is pre-scaled by DPR) */
    pos(e){
        const r=this.canvas.getBoundingClientRect();
        return{x:(e.clientX-r.left),y:(e.clientY-r.top)};
    },

    select(num,btn){
        this.curNum=num; this.hasDrawn=false;
        document.querySelectorAll('.tracing-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        this._resizeCanvas(); // Re-scale in case viewport changed
        this.clearCanvas(); this.drawGuide(num);
        const hint=document.getElementById('tr-hint'); if(hint)hint.style.display='none';
        Sound.click();
    },

    clearCanvas(){
        if(!this.ctx)return;
        this.ctx.fillStyle='#fff';
        this.ctx.fillRect(0,0,this._cssW,this._cssH);
        this.hasDrawn=false;
        if(this.curNum) this.drawGuide(this.curNum);
        else {const h=document.getElementById('tr-hint');if(h)h.style.display='block';}
    },

    drawGuide(num){
        if(!this.ctx)return;
        const ctx=this.ctx; const cx=this._cssW/2; const cy=this._cssH/2;
        const guideSize=Math.round(this._cssW*0.55);
        const hintSize=Math.max(14,Math.round(this._cssW*0.055));
        ctx.save();
        ctx.font=guideSize+'px Arial,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='rgba(200,200,200,.15)'; ctx.fillText(num.toString(),cx,cy);
        ctx.strokeStyle='rgba(180,180,180,.45)'; ctx.lineWidth=3; ctx.setLineDash([8,8]);
        ctx.strokeText(num.toString(),cx,cy); ctx.setLineDash([]);
        ctx.font=hintSize+'px Arial'; ctx.fillStyle='rgba(155,114,207,.35)';
        ctx.fillText('Telusuri mengikuti bentuk angka',cx,cy+this._cssH*0.33);
        ctx.restore();
    },

    clear(){ this.clearCanvas(); Sound.pop(); },

    save(){
        const fb=document.getElementById('tr-feedback');
        if(!this.curNum){fb.textContent='Pilih angka dulu, lalu telusuri!';fb.className='game-feedback feedback-wrong';return;}
        if(!this.hasDrawn){fb.textContent='Telusuri angka dulu dengan jari atau kursor!';fb.className='game-feedback feedback-wrong';return;}
        fb.textContent=`⭐ Karya angka ${this.curNum} disimpan! Bagus sekali!`;
        fb.className='game-feedback feedback-correct';
        Sound.star(); App.addStar('tracing');
    }
};
