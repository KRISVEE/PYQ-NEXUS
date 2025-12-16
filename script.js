
const db = {
    JUT: {
        name: "JUT PYQ",
        branches: {
            CSE: {
                2024: {
                    "Semester 1": [
                        { name: "All Subjects", link: "https://drive.google.com/file/d/17pB8OX1IvU2j2o469omUiTVmhZ7eVEs8/view?usp=drivesdk" },
                        { name: "Physics", link: "https://drive.google.com/file/d/17pB8OX1IvU2j2o469omUiTVmhZ7eVEs8/view?usp=drivesdk" }
                    ],
                    "Semester 2": [ { name: "Programming", link: "#" } ]
                },
                2023: {
                    "Semester 1": [ { name: "Mathematics", link: "https://drive.google.com/file/d/1Ao9gvwFXeB5fsp1huf-APdnQhAD5dytd/view?usp=drivesdk" } ],
                    "Semester 2": [ { name: "Coming Soon", link: "#" } ]
                }
            },
            ECE: {
                2024: {
                    "Semester 1": [ { name: "Physics", link: "https://drive.google.com/file/d/17pB8OX1IvU2j2o469omUiTVmhZ7eVEs8/view?usp=drivesdk" } ]
                }
            }
        }
    },
    Chaibasa: {
        name: "Chaibasa Eng College",
        branches: {
            CSE: {
                2024: {
                    "Semester 1": [
                        { name: "1st Mid Sem", link: "https://drive.google.com/file/d/1ALPsKqNAdbiPuGEgDzwWst-L_wCtzA97/view?usp=drivesdk" },
                        { name: "2nd Mid Sem", link: "https://drive.google.com/file/d/1ADV9m73iSNzR8v-ijp5WogTT2C8dCa7R/view?usp=drivesdk" }
                    ]
                }
            }
        }
    }
};


const sysAudio = {
    ctx: null,
    enabled: true,
    
    init: function() {
        if(!this.ctx) {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if(this.ctx.state === 'suspended') this.ctx.resume();
    },

    playTone: function(freq, type, duration, vol=0.05) {
        if(!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // Achievement Chords
    playChord: function(notes) {
        if(!this.enabled || !this.ctx) return;
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(0, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.5);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.0);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 2.0);
            }, i * 60);
        });
    },

    // Profile Open "Whoosh"
    openPanel: function() {
        if(!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },

    hover: function() { this.playTone(800, 'sine', 0.1, 0.02); },
    click: function() { this.playTone(1200, 'square', 0.1, 0.03); },
    achieve1: function() { this.playChord([440, 554, 659]); },
    achieveComplete: function() { this.playChord([261, 329, 392, 523, 1046]); }
};


const achievements = {
    list: ['init','college','branch','year','sem','file'],
    unlock: function(id) {
        // Notification UI
        const zone = document.getElementById('notification-zone');
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        const msgs = {
            'college': 'INSTITUTION LOCKED',
            'branch': 'BRANCH NODE SYNCED',
            'year': 'TIMELINE ACCESSED',
            'file': 'ARCHIVE UNLOCKED'
        };
        if(msgs[id]) {
            toast.innerText = "> " + msgs[id];
            zone.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        // Audio Effect
        sysAudio.init();
        if(id === 'file') sysAudio.achieveComplete();
        else sysAudio.achieve1();
        
        // Visual Effect
        if(typeof updateCoreState === 'function') updateCoreState(id);
    }
};


let currentStep = 1;
let selections = { college: null, branch: null, year: null, semester: null };
const stepContainer = document.getElementById('stepContent');
const backBtn = document.getElementById('backBtn');
const statusText = document.getElementById('statusText');
const crumbs = document.querySelectorAll('.crumb');
const vizTitle = document.getElementById('visualizerTitle');
const vizSub = document.getElementById('visualizerSub');

function renderStep(step) {
    // Breadcrumbs
    crumbs.forEach((c, index) => {
        if(index + 1 < step) {
            c.className = 'crumb completed';
            c.innerHTML = '&#10003; ' + c.dataset.label; 
        } else if(index + 1 === step) {
            c.className = 'crumb active';
            c.innerText = c.dataset.label;
        } else {
            c.className = 'crumb';
            c.innerText = c.dataset.label;
        }
    });

    stepContainer.innerHTML = ''; 
    const grid = document.createElement('div');
    grid.className = 'options-grid';
    let titleText = "";

    // Step 1: College
    if (step === 1) {
        titleText = "Select Institution";
        Object.keys(db).forEach(key => {
            grid.appendChild(createBtn(db[key].name, () => {
                selections.college = key;
                achievements.unlock('college');
                nextStep();
            }));
        });
        updateVisualizer("INITIALIZE", "Select institution node.");
    }
    // Step 2: Branch
    else if (step === 2) {
        titleText = "Select Branch";
        Object.keys(db[selections.college].branches).forEach(key => {
            grid.appendChild(createBtn(key, () => {
                selections.branch = key;
                achievements.unlock('branch');
                nextStep();
            }));
        });
        updateVisualizer(selections.college, "Targeting department...");
    }
    // Step 3: Year
    else if (step === 3) {
        titleText = "Select Year";
        Object.keys(db[selections.college].branches[selections.branch]).sort().reverse().forEach(key => {
            grid.appendChild(createBtn(key, () => {
                selections.year = key;
                achievements.unlock('year');
                nextStep();
            }));
        });
        updateVisualizer(selections.branch, "Filtering temporal layers...");
    }
    // Step 4: Semester
    else if (step === 4) {
        titleText = "Select Semester";
        Object.keys(db[selections.college].branches[selections.branch][selections.year]).forEach(key => {
            grid.appendChild(createBtn(key, () => {
                selections.semester = key;
                achievements.unlock('sem');
                nextStep();
            }));
        });
        updateVisualizer(selections.year, "Narrowing data scope...");
    }
    
    else if (step === 5) {
        titleText = "Download Files";
        const subjects = db[selections.college].branches[selections.branch][selections.year][selections.semester];
        
        subjects.forEach(sub => {
            const link = document.createElement('a');
            link.className = 'option-btn link-btn';
            link.href = sub.link;
            
            link.innerHTML = `
                <div class="file-info"><span class="file-name">${sub.name}</span> <span class="file-tag">SECURE PDF</span></div>
                <div class="download-icon">⬇</div>
            `;
            link.addEventListener('mouseenter', () => sysAudio.hover());
            
            // DELAY LOGIC: Play sound/anim first, then open link
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Stop instant redirect
                
                sysAudio.click();
                achievements.unlock('file'); // Trigger Shockwave & Sound
                
                updateVisualizer("DECRYPTING...", "Unlocking secure file...");
                link.style.borderColor = "#0aff0a"; 
                link.style.background = "rgba(10, 255, 10, 0.1)";

                // Wait 1.5s then open
                setTimeout(() => {
                    window.open(sub.link, '_blank');
                    updateVisualizer("ACCESS GRANTED", "File downloaded.");
                }, 1500);
            });
            grid.appendChild(link);
        });
        updateVisualizer("ACCESS GRANTED", "Secure channel established.");
    }

    const h2 = document.createElement('h2');
    h2.innerText = titleText;
    stepContainer.appendChild(h2);
    stepContainer.appendChild(grid);
    backBtn.disabled = step === 1;
}

function createBtn(text, onClick) {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = text;
    btn.addEventListener('mouseenter', () => sysAudio.hover());
    btn.addEventListener('click', (e) => {
        sysAudio.click();
        onClick(e);
    });
    return btn;
}

function nextStep() {
    currentStep++;
    renderStep(currentStep);
}

backBtn.addEventListener('click', () => {
    sysAudio.click();
    if(currentStep > 1) {
        currentStep--;
        renderStep(currentStep);
    }
});

function updateVisualizer(title, sub) {
    if(vizTitle) vizTitle.innerText = title;
    if(vizSub) vizSub.innerText = sub;
    if(statusText) statusText.innerText = "SYS.STATUS: " + title;
}

// Audio Toggle Button
const soundBtn = document.getElementById('soundToggle');
soundBtn.addEventListener('click', () => {
    sysAudio.init();
    sysAudio.enabled = !sysAudio.enabled;
    if(sysAudio.enabled) {
        soundBtn.innerHTML = "🔊 AUDIO";
        soundBtn.classList.remove('muted');
        sysAudio.click();
    } else {
        soundBtn.innerHTML = "🔇 MUTED";
        soundBtn.classList.add('muted');
    }
});

const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profile-modal');
const closeProfile = document.getElementById('closeProfile');

// Open
if(profileBtn && profileModal) {
    profileBtn.addEventListener('click', () => {
        sysAudio.init();
        sysAudio.click();
        setTimeout(() => sysAudio.openPanel(), 100); 
        profileModal.classList.add('active');
    });

    // Close Button
    closeProfile.addEventListener('click', () => {
        sysAudio.click();
        profileModal.classList.remove('active');
    });

    // Close on Outside Click
    profileModal.addEventListener('click', (e) => {
        if(e.target === profileModal) {
            profileModal.classList.remove('active');
        }
    });
    
    // Social Links Hover Sounds
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('mouseenter', () => sysAudio.hover());
        link.addEventListener('click', () => sysAudio.click());
    });
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Adjust Camera Z based on screen width
const isMobile = window.innerWidth < 900;
camera.position.z = isMobile ? 6 : 5; // Zoom out more on mobile

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Objects
const coreGeo = new THREE.IcosahedronGeometry(1.2, 0);
const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.3 });
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

const shellGeo = new THREE.IcosahedronGeometry(1.6, 1);
const shellMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.05 });
const shell = new THREE.Mesh(shellGeo, shellMat);
scene.add(shell);

const ringGeo = new THREE.TorusGeometry(3, 0.05, 16, 100);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x0aff0a, transparent: true, opacity: 0 });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2;
scene.add(ring);

const starsGeo = new THREE.BufferGeometry();
const starsCount = 600;
const starsArr = new Float32Array(starsCount * 3);
for(let i=0; i<starsCount*3; i++) starsArr[i] = (Math.random()-0.5) * 30;
starsGeo.setAttribute('position', new THREE.BufferAttribute(starsArr, 3));
const starsMat = new THREE.PointsMaterial({size: 0.03, color: 0xffffff, transparent:true, opacity:0.3});
const stars = new THREE.Points(starsGeo, starsMat);
scene.add(stars);

function animate() {
    requestAnimationFrame(animate);
    core.rotation.y += 0.002;
    core.rotation.x += 0.001;
    shell.rotation.y -= 0.001;
    stars.rotation.y -= 0.0002;
    renderer.render(scene, camera);
}
animate();

// Animation Trigger
function updateCoreState(id) {
    if(id === 'college') {
        gsap.to(core.scale, {x:1.1, y:1.1, z:1.1, duration:0.5});
        gsap.to(coreMat, {opacity: 0.5, duration:0.5});
    }
    if(id === 'branch') {
        gsap.to(shellMat, {opacity: 0.2, duration:0.5});
        gsap.to(core.rotation, {y: core.rotation.y + 1, duration:1.5});
    }
    if(id === 'file') {
        // Shockwave
        gsap.to(coreMat, {color: 0x0aff0a, duration: 0.5}); 
        gsap.fromTo(ring.scale, {x:0, y:0, z:0}, {x:2.5, y:2.5, z:2.5, duration: 1.5, ease: "power2.out"});
        gsap.fromTo(ringMat, {opacity: 1}, {opacity: 0, duration: 1.5, ease: "power2.out"});
    }
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Adjust zoom on resize
    const mobile = window.innerWidth < 900;
    camera.position.z = mobile ? 6 : 5;
});

// Start App
renderStep(1);



// 1. Block Right Click
document.addEventListener('contextmenu', (e) => { e.preventDefault(); alert("⚠️ SYSTEM ALERT: Restricted Access!"); });

// 2. Block Shortcuts
document.addEventListener('keydown', function(e) {
    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) || (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0))) {
        e.preventDefault(); alert("SYSTEM RESTRICTED: Chala Ja Bsdk!"); return false;
    }
});

// 3. Console Bomb
console.log('%c⚠️ CHALA JA BSDK ⚠️', 'color: #ff0000; font-size: 50px; font-weight: bold; background: #000; padding:20px;');

// 4. Debugger Trap
setInterval(() => {
    const start = new Date().getTime();
    debugger; 
    const end = new Date().getTime();
    if (end - start > 100) {
        document.body.innerHTML = `
            <div class="chala-ja-screen">
                <div class="chala-ja-text">CHALA JA BSDK</div>
                <p style="color:white; margin-top:20px;">System Security Triggered</p>
            </div>
        `;
        if(sysAudio.ctx) sysAudio.ctx.close();
    }
}, 1000);



const nodesToggle = document.getElementById('nodesToggle');
const nodesList = document.getElementById('nodesList');

if(nodesToggle && nodesList) {
    
    // Toggle Accordion
    nodesToggle.addEventListener('click', () => {
        const isActive = nodesList.classList.contains('active');
        
        if(isActive) {
            nodesList.classList.remove('active');
            nodesToggle.classList.remove('active');
            sysAudio.click(); // Standard click sound for close
        } else {
            nodesList.classList.add('active');
            nodesToggle.classList.add('active');
            sysAudio.openPanel(); // Reuse "Whoosh" sound for open
            
            // Trigger 3D Core Pulse
            if(typeof triggerNodePulse === 'function') triggerNodePulse();
        }
    });

    // Node Click Effects
    document.querySelectorAll('.node-card').forEach(node => {
        node.addEventListener('mouseenter', () => sysAudio.hover());
        
        node.addEventListener('click', () => {
            sysAudio.click();
            // Trigger 3D Connection Effect
            if(typeof triggerNodeConnection === 'function') triggerNodeConnection();
        });
    });
}



// 1. Pulse Core when opening section
function triggerNodePulse() {
    if(typeof gsap !== 'undefined' && typeof coreMat !== 'undefined') {
        // Flash core Cyan
        gsap.to(coreMat, { opacity: 0.8, duration: 0.1, yoyo: true, repeat: 1 });
        gsap.to(core.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
    }
}

// 2. Expand Ring when clicking a node link
function triggerNodeConnection() {
    if(typeof gsap !== 'undefined' && typeof ring !== 'undefined') {
        // Quick subtle expansion ring
        gsap.fromTo(ring.scale, {x:0, y:0, z:0}, {x:1.5, y:1.5, z:1.5, duration: 0.8, ease: "power2.out"});
        gsap.fromTo(ringMat, {opacity: 0.5}, {opacity: 0, duration: 0.8});
    }

}
