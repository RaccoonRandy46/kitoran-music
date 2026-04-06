const html = `
<div class="audio-player">
    <audio class="js-audio"></audio>

    <div class="controls-left">
        <button class="skip-btn bw-btn" type="button">
            <span class="icon-mask"></span>
        </button>

        <button class="play-btn" type="button" aria-label="Play audio">
            <svg class="icon icon-play" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"></path>
            </svg>

            <svg class="icon icon-pause" viewBox="0 0 24 24">
                <path d="M6 5h4v14H6zm8 0h4v14h-4z"></path>
            </svg>
        </button>

        <button class="skip-btn fw-btn" type="button">
            <span class="icon-mask"></span>
        </button>
    </div>

    <input class="seek-bar" type="range" value="0" min="0" max="100">

    <div class="controls-right">
        <label class="volume-wrap">
            <span class="icon-mask"></span>
            <input class="volume-bar" type="range" min="0" max="1" step="0.01" value="1">
        </label>

        <span class="time">
            <span class="current-time">0:00</span> /
            <span class="duration">0:00</span>
        </span>
    </div>
</div>
`;

const templateCache = {
    css: null,
    loaded: null
};

async function loadAssets() {

    if (templateCache.loaded) return templateCache.loaded;

    templateCache.loaded = fetch("components/kit-audio/kit-audio.css")
        .then(res => {
            if (!res.ok) throw new Error("Failed to load kit-audio.css");
            return res.text();
        })
        .then(css => {
            templateCache.css = css;
        });

    return templateCache.loaded;

}

class KitAudio extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    async connectedCallback() {

        if (this.shadowRoot.children.length > 0) return;

        await loadAssets();

        this.shadowRoot.innerHTML = `
            <style>${templateCache.css}</style>
            ${html}
        `;

        this.setupPlayer();

    }

    setupPlayer() {

        const audio = this.shadowRoot.querySelector(".js-audio");
        const playBtn = this.shadowRoot.querySelector(".play-btn");
        const backBtn = this.shadowRoot.querySelector(".bw-btn");
        const forwardBtn = this.shadowRoot.querySelector(".fw-btn");
        const seekBar = this.shadowRoot.querySelector(".seek-bar");
        const volumeBar = this.shadowRoot.querySelector(".volume-bar");
        const currentTimeEl = this.shadowRoot.querySelector(".current-time");
        const durationEl = this.shadowRoot.querySelector(".duration");

        const src = this.getAttribute("src") || "";
        const initialVolume = Number(this.getAttribute("volume") ?? 1);
        const skipAmount = Number(this.getAttribute("skip") ?? 10);

        audio.src = src;
        audio.volume = Math.max(0, Math.min(1, initialVolume));
        volumeBar.value = audio.volume;

        const formatTime = (time) => {
            if (!Number.isFinite(time)) return "0:00";
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60)
                .toString()
                .padStart(2, "0");
            return `${minutes}:${seconds}`;
        };

        const updateProgress = (percent) => {
            seekBar.style.setProperty("--progress", `${percent}%`);
        };

        const updatePlayState = () => {
            const isPlaying = !audio.paused;
            playBtn.classList.toggle("is-playing", isPlaying);
        };

        const resetPlayer = () => {
            audio.pause();
            audio.currentTime = 0;
            seekBar.value = 0;
            currentTimeEl.textContent = "0:00";
            durationEl.textContent = formatTime(audio.duration);
            updateProgress(0);
            updatePlayState();
        };

        playBtn.addEventListener("click", async () => {
            if (audio.paused) {
                await audio.play();
            } else {
                audio.pause();
            }
        });

        backBtn.addEventListener("click", () => {
            audio.currentTime = Math.max(0, audio.currentTime - skipAmount);
        });

        forwardBtn.addEventListener("click", () => {
            const maxTime = Number.isFinite(audio.duration) ? audio.duration : audio.currentTime + skipAmount;
            audio.currentTime = Math.min(maxTime, audio.currentTime + skipAmount);
        });

        volumeBar.addEventListener("input", () => {
            audio.volume = Number(volumeBar.value);
        });

        seekBar.addEventListener("input", () => {
            if (!audio.duration) return;
            const percent = Number(seekBar.value);
            audio.currentTime = (percent / 100) * audio.duration;
            updateProgress(percent);
        });

        audio.addEventListener("loadedmetadata", () => {
            durationEl.textContent = formatTime(audio.duration);
        });

        audio.addEventListener("timeupdate", () => {
            currentTimeEl.textContent = formatTime(audio.currentTime);
            durationEl.textContent = formatTime(audio.duration);

            if (audio.duration) {
                const percent = (audio.currentTime / audio.duration) * 100;
                seekBar.value = percent;
                updateProgress(percent);
            }
        });

        audio.addEventListener("play", updatePlayState);
        audio.addEventListener("pause", updatePlayState);
        audio.addEventListener("ended", resetPlayer);

        resetPlayer();

    }
    
}

customElements.define("kit-audio", KitAudio);