const audio = document.getElementById("audioPlayer");

console.log("Lifmar Musik V2 — Supabase connected");

const SUPABASE_URL = "https://ibsobqdicrjwpqwinsjk.supabase.co";
const SUPABASE_KEY = "sb_publishable_KEY_KAMU";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let songs = JSON.parse(localStorage.getItem("mySongs")) || [];
let playlists = JSON.parse(localStorage.getItem("myPlaylists")) || [];

let currentIndex = -1;
let currentPlaylist = null;

let shuffle = false;
let repeat = false;


/* =========================
   INITIAL DATA
========================= */

if (playlists.length === 0) {

    playlists.push({
        id: crypto.randomUUID(),
        name: "My Favorites",
        description: "Your favorite songs",
        cover: null
    });

    saveData();
}


/* =========================
   STORAGE
========================= */

function saveData() {

    localStorage.setItem(
        "mySongs",
        JSON.stringify(songs)
    );

    localStorage.setItem(
        "myPlaylists",
        JSON.stringify(playlists)
    );
}


/* =========================
   FORMAT TIME
========================= */

function formatTime(seconds) {

    if (!seconds || isNaN(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${secs}`;
}


/* =========================
   PLAYLIST RENDER
========================= */

function renderPlaylists() {

    const list =
        document.getElementById("playlistList");

    const cards =
        document.getElementById("playlistCards");

    list.innerHTML = "";
    cards.innerHTML = "";

    playlists.forEach(playlist => {

        const item =
            document.createElement("div");

        item.className = "playlist-item";

        item.textContent = playlist.name;

        item.onclick = () =>
            openPlaylist(playlist.id);

        list.appendChild(item);


        const card =
            document.createElement("div");

        card.className = "playlist-card";

        card.onclick = () =>
            openPlaylist(playlist.id);

        const cover =
            playlist.cover
                ? `<img src="${playlist.cover}">`
                : "♫";

        card.innerHTML = `

            <div class="playlist-card-cover">
                ${cover}
            </div>

            <h3>${escapeHTML(playlist.name)}</h3>

            <p>
                ${getPlaylistSongs(playlist.id).length} songs
            </p>
        `;

        cards.appendChild(card);

    });

    updatePlaylistSelect();
}


/* =========================
   PLAYLIST SELECT
========================= */

function updatePlaylistSelect() {

    const select =
        document.getElementById("songPlaylist");

    select.innerHTML = "";

    playlists.forEach(playlist => {

        const option =
            document.createElement("option");

        option.value = playlist.id;
        option.textContent = playlist.name;

        select.appendChild(option);

    });
}


/* =========================
   GET PLAYLIST SONGS
========================= */

function getPlaylistSongs(playlistId) {

    return songs.filter(song =>
        song.playlistId === playlistId
    );
}


/* =========================
   SONG RENDER
========================= */

function renderSongs(songArray, container) {

    container.innerHTML = "";

    if (songArray.length === 0) {

        container.innerHTML = `
            <div style="
                padding:40px;
                text-align:center;
                color:#777;
            ">
                No songs yet.
            </div>
        `;

        return;
    }


    songArray.forEach((song, index) => {

        const originalIndex =
            songs.findIndex(
                item => item.id === song.id
            );

        const row =
            document.createElement("div");

        row.className = "song-row";

        row.innerHTML = `

            <span class="song-number">
                ${index + 1}
            </span>

            <div class="song-main">

                ${
                    song.cover
                    ? `<img class="song-cover" src="${song.cover}">`
                    : ""
                }

                <div>

                    <strong>
                        ${escapeHTML(song.title)}
                    </strong>

                    <span>
                        ${escapeHTML(song.artist)}
                    </span>

                </div>

            </div>

            <span class="song-time">
                ${song.duration || ""}
            </span>

            <button
                class="song-favorite ${
                    song.favorite ? "active" : ""
                }"
                onclick="toggleFavorite('${song.id}')"
            >
                ${song.favorite ? "♥" : "♡"}
            </button>
        `;


        row.addEventListener("dblclick", () => {

            playSong(originalIndex);

        });


        container.appendChild(row);

    });
}


/* =========================
   RECENT SONGS
========================= */

function renderRecentSongs() {

    const container =
        document.getElementById("recentSongs");

    renderSongs(
        songs.slice(-10).reverse(),
        container
    );
}


/* =========================
   FAVORITES
========================= */

function renderFavorites() {

    const container =
        document.getElementById("favoriteSongs");

    renderSongs(
        songs.filter(song => song.favorite),
        container
    );
}


function toggleFavorite(id) {

    const song =
        songs.find(item => item.id === id);

    if (!song) return;

    song.favorite = !song.favorite;

    saveData();

    renderRecentSongs();
    renderFavorites();

    if (currentIndex !== -1 &&
        songs[currentIndex].id === id) {

        updateFavoriteButton();
    }
}


/* =========================
   PLAY SONG
========================= */

function playSong(index) {

    if (!songs[index]) return;

    currentIndex = index;

    const song = songs[index];

    audio.src = song.audio;

    audio.play();

    document.getElementById("currentTitle")
        .textContent = song.title;

    document.getElementById("currentArtist")
        .textContent = song.artist;

    updateCurrentCover();

    updatePlayButton();

    updateFavoriteButton();
}


/* =========================
   PLAYER BUTTON
========================= */

document.getElementById("playBtn")
    .addEventListener("click", () => {

        if (currentIndex === -1) {

            if (songs.length) {
                playSong(0);
            }

            return;
        }

        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }

        updatePlayButton();

    });


function updatePlayButton() {

    document.getElementById("playBtn")
        .textContent =
        audio.paused ? "▶" : "Ⅱ";
}


/* =========================
   NEXT
========================= */

document.getElementById("nextBtn")
    .addEventListener("click", nextSong);


function nextSong() {

    if (!songs.length) return;

    let next;

    if (shuffle) {

        next =
            Math.floor(
                Math.random() * songs.length
            );

    } else {

        next =
            currentIndex + 1;

        if (next >= songs.length) {
            next = 0;
        }

    }

    playSong(next);
}


/* =========================
   PREVIOUS
========================= */

document.getElementById("previousBtn")
    .addEventListener("click", () => {

        if (!songs.length) return;

        let previous =
            currentIndex - 1;

        if (previous < 0) {
            previous = songs.length - 1;
        }

        playSong(previous);

    });


/* =========================
   AUDIO END
========================= */

audio.addEventListener("ended", () => {

    if (repeat) {

        audio.currentTime = 0;

        audio.play();

    } else {

        nextSong();

    }

});


/* =========================
   SHUFFLE
========================= */

document.getElementById("shuffleBtn")
    .addEventListener("click", () => {

        shuffle = !shuffle;

        document.getElementById("shuffleBtn")
            .style.opacity =
            shuffle ? "1" : ".5";

    });


/* =========================
   REPEAT
========================= */

document.getElementById("repeatBtn")
    .addEventListener("click", () => {

        repeat = !repeat;

        document.getElementById("repeatBtn")
            .style.opacity =
            repeat ? "1" : ".5";

    });


/* =========================
   PROGRESS
========================= */

audio.addEventListener("timeupdate", () => {

    if (!audio.duration) return;

    const progress =
        (audio.currentTime / audio.duration) * 100;

    document.getElementById("progressBar")
        .value = progress;

    document.getElementById("currentTime")
        .textContent =
        formatTime(audio.currentTime);

});


audio.addEventListener("loadedmetadata", () => {

    document.getElementById("duration")
        .textContent =
        formatTime(audio.duration);

});


document.getElementById("progressBar")
    .addEventListener("input", e => {

        if (!audio.duration) return;

        audio.currentTime =
            (e.target.value / 100) *
            audio.duration;

    });


/* =========================
   VOLUME
========================= */

document.getElementById("volumeBar")
    .addEventListener("input", e => {

        audio.volume = e.target.value;

    });


/* =========================
   CURRENT COVER
========================= */

function updateCurrentCover() {

    const container =
        document.getElementById("currentCover");

    const song = songs[currentIndex];

    if (!song.cover) {

        container.innerHTML = "♫";

        return;
    }

    container.innerHTML =
        `<img src="${song.cover}">`;
}


function updateFavoriteButton() {

    const button =
        document.getElementById("favoriteCurrent");

    if (currentIndex === -1) {

        button.textContent = "♡";

        return;
    }

    button.textContent =
        songs[currentIndex].favorite
        ? "♥"
        : "♡";
}


document.getElementById("favoriteCurrent")
    .addEventListener("click", () => {

        if (currentIndex === -1) return;

        toggleFavorite(
            songs[currentIndex].id
        );

    });


/* =========================
   CREATE PLAYLIST
========================= */

function openPlaylistModal() {

    document
        .getElementById("playlistModal")
        .classList.add("show");

}


document.getElementById("addPlaylistBtn")
    .addEventListener(
        "click",
        openPlaylistModal
    );


document.getElementById("createPlaylistBtn")
    .addEventListener(
        "click",
        openPlaylistModal
    );


document.getElementById("playlistForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        const name =
            document.getElementById("playlistName")
                .value;

        const description =
            document.getElementById(
                "playlistDescriptionInput"
            ).value;

        const coverFile =
            document.getElementById(
                "playlistCoverInput"
            ).files[0];

        let cover = null;

        if (coverFile) {
            cover =
                await fileToDataURL(coverFile);
        }

        playlists.push({

            id: crypto.randomUUID(),

            name,

            description,

            cover

        });

        saveData();

        renderPlaylists();

        closeModal("playlistModal");

        e.target.reset();

    });


/* =========================
   ADD SONG
========================= */

document.getElementById("addSongBtn")
    .addEventListener("click", () => {

        updatePlaylistSelect();

        document
            .getElementById("songModal")
            .classList.add("show");

    });


document.getElementById("songForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        const title =
            document.getElementById("songTitle")
                .value;

        const artist =
            document.getElementById("songArtist")
                .value;

        const coverFile =
            document.getElementById("songCover")
                .files[0];

        const audioFile =
            document.getElementById("songAudio")
                .files[0];

        const playlistId =
            document.getElementById("songPlaylist")
                .value;


        let cover = null;

        if (coverFile) {

            cover =
                await fileToDataURL(coverFile);

        }


        const audioURL =
            URL.createObjectURL(audioFile);


        const song = {

            id: crypto.randomUUID(),

            title,

            artist,

            cover,

            audio: audioURL,

            playlistId,

            favorite: false,

            duration: ""

        };


        songs.push(song);

        saveData();

        renderRecentSongs();
        renderPlaylists();

        closeModal("songModal");

        e.target.reset();

    });


/* =========================
   FILE READER
========================= */

function fileToDataURL(file) {

    return new Promise(resolve => {

        const reader =
            new FileReader();

        reader.onload =
            () => resolve(reader.result);

        reader.readAsDataURL(file);

    });

}


/* =========================
   OPEN PLAYLIST
========================= */

function openPlaylist(id) {

    const playlist =
        playlists.find(
            item => item.id === id
        );

    if (!playlist) return;

    currentPlaylist = id;

    document.getElementById("homePage")
        .classList.remove("active");

    document.getElementById("favoritesPage")
        .classList.remove("active");

    document.getElementById("playlistPage")
        .classList.add("active");


    document.getElementById("playlistTitle")
        .textContent = playlist.name;

    document.getElementById("playlistDescription")
        .textContent =
        playlist.description ||
        "Your playlist";


    const cover =
        document.getElementById("playlistCover");

    if (playlist.cover) {

        cover.innerHTML =
            `<img src="${playlist.cover}">`;

    } else {

        cover.innerHTML = "♫";

    }


    renderSongs(
        getPlaylistSongs(id),
        document.getElementById("playlistSongs")
    );

}


/* =========================
   PLAY PLAYLIST
========================= */

document.getElementById("playPlaylistBtn")
    .addEventListener("click", () => {

        if (!currentPlaylist) return;

        const playlistSongs =
            getPlaylistSongs(currentPlaylist);

        if (!playlistSongs.length) return;

        const firstSong =
            songs.findIndex(
                song =>
                    song.id === playlistSongs[0].id
            );

        playSong(firstSong);

    });


/* =========================
   DELETE PLAYLIST
========================= */

document.getElementById("deletePlaylistBtn")
    .addEventListener("click", () => {

        if (!currentPlaylist) return;

        if (playlists.length <= 1) {

            alert(
                "Minimal harus ada satu playlist."
            );

            return;
        }

        const playlist =
            playlists.find(
                item => item.id === currentPlaylist
            );

        if (!confirm(
            `Hapus playlist "${playlist.name}"?`
        )) return;


        songs =
            songs.filter(
                song =>
                    song.playlistId !== currentPlaylist
            );


        playlists =
            playlists.filter(
                item =>
                    item.id !== currentPlaylist
            );


        saveData();

        renderPlaylists();

        showPage("home");

    });


/* =========================
   BACK
========================= */

document.getElementById("backHome")
    .addEventListener("click", () => {

        showPage("home");

    });


/* =========================
   NAVIGATION
========================= */

document.querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener("click", () => {

            const page =
                button.dataset.page;

            showPage(page);

        });

    });


function showPage(page) {

    document.querySelectorAll(".page")
        .forEach(p =>
            p.classList.remove("active")
        );


    if (page === "home") {

        document.getElementById("homePage")
            .classList.add("active");

    }


    if (page === "favorites") {

        document.getElementById("favoritesPage")
            .classList.add("active");

        renderFavorites();

    }


    document.querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });

}


/* =========================
   SEARCH
========================= */

document.getElementById("searchInput")
    .addEventListener("input", e => {

        const query =
            e.target.value.toLowerCase().trim();

        const results =
            songs.filter(song =>

                song.title
                    .toLowerCase()
                    .includes(query)

                ||

                song.artist
                    .toLowerCase()
                    .includes(query)

            );

        renderSongs(
            results,
            document.getElementById("recentSongs")
        );

    });


/* =========================
   MODAL
========================= */

document.querySelectorAll(".close-modal")
    .forEach(button => {

        button.addEventListener("click", () => {

            closeModal(
                button.dataset.close
            );

        });

    });


document.querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener("click", e => {

            if (e.target === modal) {

                modal.classList.remove("show");

            }

        });

    });


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("show");

}


/* =========================
   MOBILE MENU
========================= */

const sidebar = document.querySelector(".sidebar");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");

mobileMenuBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    sidebar.classList.toggle("open");

});


/* Klik menu navigasi → tutup sidebar */

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {

        sidebar.classList.remove("open");

    });

});


/* Klik playlist → tutup sidebar */

document.getElementById("playlistList")
    .addEventListener("click", () => {

        sidebar.classList.remove("open");

    });


/* Klik area di luar sidebar → tutup */

document.addEventListener("click", (e) => {

    if (
        sidebar.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        !mobileMenuBtn.contains(e.target)
    ) {

        sidebar.classList.remove("open");

    }

});


/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   INITIAL RENDER
========================= */

renderPlaylists();

renderRecentSongs();

audio.volume = 0.8;
