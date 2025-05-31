console.log("lets write javascript");

let currentSong = new Audio();
let songs;
let currfolder;
let currentSongIndex = 0;
const play = document.getElementById("play");

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currfolder = folder; // e.g., "ncs"
    let a = await fetch(`http://127.0.0.1:3000/songs/${currfolder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let track = decodeURI(element.href.split(`/songs/${currfolder}/`)[1]);
            songs.push(track); // only the filename
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    for (const song of songs) {
        let nameOnly = song.replace(".mp3", "").replaceAll("-", " ").trim();
        songUL.innerHTML += `<li>
            <img class="invert" src="image/music.svg" alt="">
            <div class="info">
                <div>${nameOnly}</div>
                <div>Harry</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="image/play2.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

}

const playMusic = (track, pause = false) => {
    currentSong.src = encodeURI(`/songs/${currfolder}/${track}`); // ✅ FIXED: correct file path

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    let cleanName = decodeURI(track)
        .replace(".mp3", "")
        .replaceAll("-", " ")
        .trim();

    document.querySelector(".songinfo").innerHTML = cleanName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    currentSongIndex = songs.indexOf(track); // ✅ use filename, not full URL
};

async function main() {
 
    await getSongs("cs");

    playMusic(songs[0], true);

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");
    let isDragging = false;

    seekbar.addEventListener("click", e => {
        if (isDragging) return;

        let percent = (e.offsetX / seekbar.clientWidth) * 100;
        percent = Math.min(Math.max(percent, 0), 100);

        circle.style.left = percent + "%";
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    circle.addEventListener("mousedown", (e) => {
        isDragging = true;
        e.stopPropagation();
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) isDragging = false;
    });

    document.addEventListener("mousemove", e => {
        if (!isDragging) return;

        const rect = seekbar.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        let percent = (offsetX / seekbar.clientWidth) * 100;
        percent = Math.min(Math.max(percent, 0), 100);

        circle.style.left = percent + "%";
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        if ((currentSongIndex - 1) >= 0) {
            playMusic(songs[currentSongIndex - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        if ((currentSongIndex + 1) < songs.length) {
            playMusic(songs[currentSongIndex + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    //load  the playlist whenever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

        })
    });
}

main();

