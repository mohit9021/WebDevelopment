console.log("lets write javascript");

let currentSong = new Audio();
const play = document.getElementById("play"); // Ensure this matches your play button's ID

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = "/songs/" + track;

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    // Clean up filename (remove .mp3 and trim spaces)
    let cleanName = decodeURI(track)
        .replace(".mp3", "")
        .replaceAll("-", " ")
        .trim();

    document.querySelector(".songinfo").innerHTML = cleanName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main() {
    let songs = await getSongs();
    playMusic(songs[0].replace("http://127.0.0.1:3000/songs/", ""), true);

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];

    
    for (const song of songs) {
        let nameOnly = song.replace("http://127.0.0.1:3000/songs/", "").replace(".mp3", "").replaceAll("-", " ").trim();
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

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let songTitle = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songTitle + ".mp3");
        });
    });

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Update time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar Click to Seek
    // Seekbar Click to Seek
    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");
    let isDragging = false;

    seekbar.addEventListener("click", e => {
        // Don't trigger click seek if we were just dragging the circle
        if (isDragging) return;

        let percent = (e.offsetX / seekbar.clientWidth) * 100;
        percent = Math.min(Math.max(percent, 0), 100); // clamp 0-100

        circle.style.left = percent + "%";
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    // Dragging the Circle
    circle.addEventListener("mousedown", (e) => {
        isDragging = true;
        e.stopPropagation(); // prevent seekbar click during drag
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) isDragging = false;
    });

    document.addEventListener("mousemove", e => {
        if (!isDragging) return;

        const rect = seekbar.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        let percent = (offsetX / seekbar.clientWidth) * 100;
        percent = Math.min(Math.max(percent, 0), 100); // clamp 0-100

        circle.style.left = percent + "%";
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    //add an event listner for hamburger

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    //add eventlistner for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //add an event listner to previous and next
    previous.addEventListener("click",()=>{
        console.log("previous clicked")
        console.log(currentSong.src);
        
    })
    
    next.addEventListener("click",()=>{
        console.log("next clicked")
        console.log(currentSong.src);
    })


}

main();
