/**
 * App — main controller: navigation, star system, celebrations, modals
 */
const App = {
    screen:'splash', stars:{}, soundOn:true,

    GAMES:[
        {id:'dragCount',icon:'🧺',title:'Seret & Hitung',desc:'Seret benda ke keranjang sesuai angka',badge:'Hitung 1-10',color:'var(--red)'},
        {id:'matchNumber',icon:'🔢',title:'Cocokkan Jumlah',desc:'Hubungkan benda dengan angka yang tepat',badge:'Benda ↔ Angka',color:'var(--blue)'},
        {id:'numberTrain',icon:'🚂',title:'Kereta Angka',desc:'Urutkan angka 1-10 di kereta',badge:'Urutkan',color:'var(--green)'},
        {id:'addition',icon:'➕',title:'Gabung & Hitung',desc:'Gabungkan dua kelompok benda',badge:'Penjumlahan ≤ 5',color:'var(--orange)'},
        {id:'tracing',icon:'✏️',title:'Jejak Angka',desc:'Telusuri dan tulis angka 1-10',badge:'Tulis Angka',color:'var(--purple)'},
    ],

    init(){
        this.loadProgress();
        this.renderMenu();
        this.showScreen('splash');
        document.addEventListener('pointerdown',()=>Sound.init(),{once:true});
    },

    renderMenu(){
        const c=document.getElementById('menuGames');
        c.innerHTML='';
        this.GAMES.forEach(g=>{
            const card=document.createElement('div');
            card.className='game-card'; card.dataset.game=g.id;
            card.style.setProperty('--card-color',g.color);
            card.innerHTML=`
                <div class="card-icon">${g.icon}</div>
                <h2>${g.title}</h2>
                <p>${g.desc}</p>
                <div class="card-badge">${g.badge}</div>
                <div class="card-stars" id="stars-${g.id}"></div>`;
            card.addEventListener('click',()=>this.openGame(g.id));
            c.appendChild(card);
        });
        // Info card
        const info=document.createElement('div');
        info.className='game-card info-card';
        info.innerHTML=`<div class="card-icon">📖</div><h2>Cara Bermain</h2><p>Petunjuk dan tips belajar</p><div class="card-badge">Panduan</div><div class="card-stars"></div>`;
        info.addEventListener('click',()=>this.showInfo());
        c.appendChild(info);
        // Parse emoji (wrapped in try-catch for safety)
        try{if(window.twemoji) twemoji.parse(c,TWEMOJI_CFG);}catch(e){}
        this.updateStars();
    },

    start(){ Sound.init(); Sound.pop(); this.showScreen('menu'); },

    showScreen(id){
        // CRITICAL: Clear all pending game timers when switching screens
        // prevents stale setTimeout callbacks from skipping rounds or
        // showing celebrations on wrong screens
        if(typeof GameTimers!=='undefined') GameTimers.clear();
        document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
        const el=document.getElementById(id)||document.getElementById('game-'+id);
        if(el){el.classList.add('active');this.screen=id;}
    },

    openGame(id){
        Sound.init(); Sound.click();
        this.showScreen('game-'+id);
        const init={dragCount:()=>DragCountGame.init(),matchNumber:()=>MatchNumberGame.init(),numberTrain:()=>NumberTrainGame.init(),addition:()=>AdditionGame.init(),tracing:()=>TracingGame.init()};
        if(init[id]) GameTimers.set(()=>init[id](),120);
    },

    backToMenu(){ Sound.click(); this.showScreen('menu'); this.updateStars(); },

    // ===== Stars =====
    addStar(game){
        this.stars[game]=(this.stars[game]||0)+1;
        this.saveProgress(); this.updateStars(); Sound.star();
    },

    updateStars(){
        let total=0; Object.values(this.stars).forEach(v=>total+=v);
        const sc=document.getElementById('starCount'); if(sc) sc.textContent=total;
        ['dragCount','matchNumber','numberTrain','addition','tracing'].forEach(id=>{
            const el=document.getElementById('stars-'+id); if(!el)return;
            const c=this.stars[id]||0; const max=5; const filled=Math.min(c,max);
            let s=''; for(let i=0;i<filled;i++)s+='⭐';
            if(c>max) el.innerHTML=s+` <span style="font-size:.75rem;color:#999">(+${c-max})</span>`;
            else el.textContent=s||'';
            try{if(window.twemoji) twemoji.parse(el,TWEMOJI_CFG);}catch(e){}
        });
    },

    saveProgress(){ try{localStorage.setItem('mathGame_stars',JSON.stringify(this.stars));}catch(e){} },
    loadProgress(){ try{const s=localStorage.getItem('mathGame_stars');if(s)this.stars=JSON.parse(s);}catch(e){this.stars={};} },

    resetProgress(){ document.getElementById('resetModal').classList.add('active'); },
    cancelReset(){ document.getElementById('resetModal').classList.remove('active'); },
    confirmReset(){ this.stars={}; this.saveProgress(); this.updateStars(); document.getElementById('resetModal').classList.remove('active'); Sound.pop(); },

    toggleSound(){
        this.soundOn=Sound.toggle();
        document.getElementById('soundToggle').textContent=this.soundOn?'🔊':'🔇';
        try{if(window.twemoji) twemoji.parse(document.getElementById('soundToggle'),TWEMOJI_CFG);}catch(e){}
    },

    showInfo(){ Sound.click(); document.getElementById('infoModal').classList.add('active');
        try{if(window.twemoji) twemoji.parse(document.getElementById('infoModal'),TWEMOJI_CFG);}catch(e){}
    },
    closeInfo(){ document.getElementById('infoModal').classList.remove('active'); },

    celebrate(title,msg,stars=1){
        document.getElementById('cele-title').textContent=title;
        document.getElementById('cele-message').textContent=msg;
        const se=document.getElementById('cele-stars'); se.innerHTML='';
        for(let i=0;i<stars;i++){const s=document.createElement('span');s.className='star-earned';s.textContent='⭐';s.style.animationDelay=(i*.2)+'s';se.appendChild(s);}
        const emojis=['🎉','🎊','🏆','⭐','🌟','🎈','🥳'];
        document.getElementById('cele-emoji').textContent=pick(emojis);
        const ov=document.getElementById('celebration');
        ov.classList.add('active');
        try{if(window.twemoji) twemoji.parse(ov,TWEMOJI_CFG);}catch(e){}
        Sound.celebrate(); this.confetti();
    },

    closeCelebration(){ document.getElementById('celebration').classList.remove('active'); Sound.click(); },

    confetti(){
        const c=document.getElementById('confetti'); c.innerHTML='';
        const colors=['#FF6B6B','#FF9F43','#FECA57','#6BCB77','#4ECDC4','#4D96FF','#9B72CF','#FF8FAB'];
        for(let i=0;i<45;i++){
            const p=document.createElement('div'); p.className='confetti-piece';
            p.style.left=Math.random()*100+'%';
            p.style.background=colors[Math.floor(Math.random()*colors.length)];
            p.style.animationDuration=(Math.random()*2+2)+'s';
            p.style.animationDelay=(Math.random()*.5)+'s';
            if(Math.random()>.5) p.style.borderRadius='50%';
            const sz=Math.random()*8+6; p.style.width=sz+'px'; p.style.height=sz+'px';
            c.appendChild(p);
        }
        setTimeout(()=>c.innerHTML='',5000);
    }
};

window.addEventListener('DOMContentLoaded',()=>{
    App.init();
    // Parse splash emoji (wrapped in try-catch for safety)
    try{if(window.twemoji) twemoji.parse(document.getElementById('splash'),TWEMOJI_CFG);}catch(e){}
});

// Global error handler — prevents silent failures on mobile where console is hidden
window.addEventListener('error',function(e){
    console.warn('Game error:',e.message);
    // Prevent uncaught errors from breaking the UI
    return true;
});
// Catch unhandled promise rejections (e.g., AudioContext.resume())
window.addEventListener('unhandledrejection',function(e){
    console.warn('Unhandled promise:',e.reason);
    e.preventDefault();
});
