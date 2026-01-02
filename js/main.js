const overlay = document.getElementById('tap');
      caption = document.getElementById('caption');
      audio   = document.getElementById('audio');
      textEl  = document.getElementById('promoText');

const PROMOS = {
    1: {
        text: 'Parastu Kandi — когда сладкое становится особенным!',
        audio: 'audio/PK_TTS_promo_vol_1.mp3',
        timings: [0, 450, 850, 1050, 1450, 1900, 2600]
    },
    2: {
        text: 'Parastu Kandi — радость в каждом кусочке',
        audio: 'audio/PK_TTS_promo_vol_2.mp3',
        timings: [0, 420, 780, 1000, 1450, 1700, 2050]
    }
};

const params = new URLSearchParams(window.location.search);
const promoId = params.get('promo') ?? '1';

if (!params.has('promo')) {
    history.replaceState(null, '', `${location.pathname}?promo=1`);
}

const promo = PROMOS[promoId] ?? PROMOS[1]; // Safe promo selection

textEl.textContent = promo.text;
audio.src = promo.audio;
const timings = promo.timings;

async function tryAutoplay() {
    audio.muted = true;

    try {
        await audio.play(); // try autoplay

        // Autoplay succeeded
        caption.classList.remove('blurred');
        overlay.classList.add('hidden');
        setTimeout(() => overlay.remove(), 300);

        audio.muted = false; // unmute for future playback

    } catch {
        // Autoplay blocked, leave overlay visible
        audio.muted = false;
    }
}

tryAutoplay();

let currentIndex = 0;

// Parse text into spans
const words = textEl.textContent.trim().match(/\S+/g);
textEl.textContent = '';

words.forEach(word => {
    const span = document.createElement('span');
    span.textContent = word + ' ';
    textEl.appendChild(span);
});

const spans = textEl.querySelectorAll('span');


function moveHighlightTo(index) {
    const word = spans[index];
    if (!word) return;

    currentIndex = index;

    const parentRect = textEl.getBoundingClientRect();
    const rect = word.getBoundingClientRect();

    const x = rect.left - parentRect.left;
    const y = rect.top - parentRect.top + rect.height * 0.65;

    textEl.style.setProperty('--hl-x', `${x}px`);
    textEl.style.setProperty('--hl-y', `${y}px`);
    textEl.style.setProperty('--hl-w', `${rect.width}px`);
}


overlay.addEventListener('click', () => {
    caption.classList.remove('blurred'); // remove blur first
    audio.play();                        // then play audio

    overlay.classList.add('hidden');
    setTimeout(() => overlay.remove(), 300);  // remove overlay
}, { once: true });

// Audio sync 
audio.addEventListener('play', () => {
    timings.forEach((t, i) => {
        setTimeout(() => moveHighlightTo(i), t);
    });
});

// Font load correction
document.fonts.ready.then(() => {
    moveHighlightTo(currentIndex);
});

// Resize handling (BEST PRACTICE)
const observer = new ResizeObserver(() => {
    moveHighlightTo(currentIndex);
});
observer.observe(textEl);
