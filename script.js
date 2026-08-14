const audio = document.getElementById("audioPlayer");

console.log("Lifmar Musik V2 — Supabase connected");


/* =========================
   SUPABASE CONFIG
========================= */

const SUPABASE_URL =
    "https://ibsobqdicrjwpqwinsjk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_wnizDCQ62Ec8KOrzswxEYA_RD2bT2H_";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================
   GLOBAL DATA
========================= */

let songs = [];
let playlists = [];

let currentIndex = -1;
let currentPlaylist = null;

let shuffle = false;
let repeat = false;


/* =========================
   LOAD DATA FROM SUPABASE
========================= */

async function loadData() {

    try {

        /* =========================
           LOAD PLAYLISTS
        ========================= */

        const {
            data: playlistData,
            error: playlistError
        } = await supabaseClient
            .from("playlists")
            .select("*")
            .order("id", {
                ascending: true
            });


        if (playlistError) {

            console.error(
                "Gagal mengambil playlists:",
                playlistError
            );

            return;
        }


        /* =========================
           LOAD SONGS
        ========================= */

        const {
            data: songData,
            error: songError
        } = await supabaseClient
            .from("songs")
            .select("*")
            .order("id", {
                ascending: true
            });


        if (songError) {

            console.error(
                "Gagal mengambil songs:",
                songError
            );

            return;
        }


        playlists =
            playlistData || [];

        songs =
            songData || [];


        console.log(
            "Playlists loaded:",
            playlists
        );

        console.log(
            "Songs loaded:",
            songs
        );


        /* =========================
           DEFAULT PLAYLIST
        ========================= */

        if (playlists.length === 0) {

            const {
                data: newPlaylist,
                error
            } = await supabaseClient
                .from("playlists")
                .insert([
                    {
                        name: "My Favorites",
                        description:
                            "Your favorite songs",
                        cover: null
                    }
                ])
                .select()
                .single();


            if (error) {

                console.error(
                    "Gagal membuat playlist:",
                    error
                );

            } else {

                playlists.push(
                    newPlaylist
                );

            }
        }


        /* =========================
           RENDER
        ========================= */

        renderPlaylists();

        renderRecentSongs();

        renderFavorites();


    } catch (error) {

        console.error(
            "Supabase error:",
            error
        );

    }
}


/* =========================
   FORMAT TIME
========================= */

function formatTime(seconds) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "0:00";
    }


    const minutes =
        Math.floor(seconds / 60);


    const secs =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");


    return `${minutes}:${secs}`;
}


/* =========================
   PLAYLIST RENDER
========================= */

function renderPlaylists() {

    const list =
        document.getElementById(
            "playlistList"
        );

    const cards =
        document.getElementById(
            "playlistCards"
        );


    if (!list || !cards) return;


    list.innerHTML = "";

    cards.innerHTML = "";


    playlists.forEach(playlist => {


        /* =========================
           SIDEBAR ITEM
        ========================= */

        const item =
            document.createElement("div");


        item.className =
            "playlist-item";


        item.textContent =
            playlist.name;


        item.onclick = () =>
            openPlaylist(
                playlist.id
            );


        list.appendChild(item);


        /* =========================
           PLAYLIST CARD
        ========================= */

        const card =
            document.createElement("div");


        card.className =
            "playlist-card";


        card.onclick = () =>
            openPlaylist(
                playlist.id
            );


        let coverHTML = "♫";


        if (playlist.cover) {

            coverHTML =
                `<img src="${escapeHTML(
                    playlist.cover
                )}" alt="Cover">`;

        }


        card.innerHTML = `

            <div class="playlist-card-cover">
                ${coverHTML}
            </div>

            <h3>
                ${escapeHTML(
                    playlist.name
                )}
            </h3>

            <p>
                ${
                    getPlaylistSongs(
                        playlist.id
                    ).length
                } songs
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
        document.getElementById(
            "songPlaylist"
        );


    if (!select) return;


    select.innerHTML = "";


    playlists.forEach(playlist => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            playlist.id;


        option.textContent =
            playlist.name;


        select.appendChild(
            option
        );

    });
}


/* =========================
   GET PLAYLIST SONGS
========================= */

function getPlaylistSongs(
    playlistId
) {

    return songs.filter(
        song =>
            String(song.playlistId) ===
            String(playlistId)
    );
}


/* =========================
   SONG RENDER
========================= */

function renderSongs(
    songArray,
    container
) {

    if (!container) return;


    container.innerHTML = "";


    if (
        !songArray ||
        songArray.length === 0
    ) {

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


    songArray.forEach(
        (song, index) => {


            const originalIndex =
                songs.findIndex(
                    item =>
                        item.id ===
                        song.id
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "song-row";


            row.innerHTML = `

                <span class="song-number">
                    ${index + 1}
                </span>


                <div class="song-main">

                    ${
                        song.cover
                        ? `
                            <img
                                class="song-cover"
                                src="${escapeHTML(
                                    song.cover
                                )}"
                                alt="Cover"
                            >
                        `
                        : ""
                    }


                    <div>

                        <strong>
                            ${escapeHTML(
                                song.title || ""
                            )}
                        </strong>


                        <span>
                            ${escapeHTML(
                                song.artist || ""
                            )}
                        </span>

                    </div>

                </div>


                <span class="song-time">

                    ${
                        song.duration || ""
                    }

                </span>


                <button
                    class="song-favorite ${
                        song.favorite
                            ? "active"
                            : ""
                    }"
                    data-song-id="${song.id}"
                >

                    ${
                        song.favorite
                            ? "♥"
                            : "♡"
                    }

                </button>

            `;


            /* =========================
               PLAY SONG
            ========================= */

            row.addEventListener(
                "click",
                () => {

                    playSong(
                        originalIndex
                    );

                }
            );


            /* =========================
               FAVORITE BUTTON
            ========================= */

            const favoriteButton =
                row.querySelector(
                    ".song-favorite"
                );


            if (favoriteButton) {

                favoriteButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        toggleFavorite(
                            song.id
                        );

                    }
                );

            }


            container.appendChild(
                row
            );

        }
    );
}


/* =========================
   RECENT SONGS
========================= */

function renderRecentSongs() {

    const container =
        document.getElementById(
            "recentSongs"
        );


    if (!container) return;


    renderSongs(
        songs
            .slice(-10)
            .reverse(),

        container
    );
}


/* =========================
   FAVORITES
========================= */

function renderFavorites() {

    const container =
        document.getElementById(
            "favoriteSongs"
        );


    if (!container) return;


    renderSongs(
        songs.filter(
            song => song.favorite
        ),

        container
    );
}


/* =========================
   TOGGLE FAVORITE
========================= */

async function toggleFavorite(id) {

    const song =
        songs.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!song) return;


    const newFavorite =
        !Boolean(
            song.favorite
        );


    const {
        error
    } = await supabaseClient
        .from("songs")
        .update({
            favorite:
                newFavorite
        })
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            "Gagal update favorite:",
            error
        );

        alert(
            "Gagal mengubah favorite."
        );

        return;
    }


    song.favorite =
        newFavorite;


    renderRecentSongs();

    renderFavorites();


    if (
        currentIndex !== -1 &&
        songs[currentIndex] &&
        String(
            songs[currentIndex].id
        ) === String(id)
    ) {

        updateFavoriteButton();

    }


    console.log(
        "Favorite berhasil diperbarui:",
        song.title,
        newFavorite
    );
}


/* =========================
   PLAY SONG
========================= */

function playSong(index) {

    if (!songs[index]) return;


    currentIndex =
        index;


    const song =
        songs[index];


    if (!song.audio) {

        alert(
            "File audio lagu ini belum tersedia."
        );

        return;
    }


    audio.src =
        song.audio;


    audio.load();


    audio.play()
        .catch(error => {

            console.error(
                "Gagal memutar lagu:",
                error
            );

        });


    document.getElementById(
        "currentTitle"
    ).textContent =
        song.title || "Unknown";


    document.getElementById(
        "currentArtist"
    ).textContent =
        song.artist || "Unknown";


    updateCurrentCover();

    updatePlayButton();

    updateFavoriteButton();
}


/* =========================
   PLAYER BUTTON
========================= */

document.getElementById(
    "playBtn"
).addEventListener(
    "click",
    () => {


        if (
            currentIndex === -1
        ) {

            if (songs.length) {

                playSong(0);

            }

            return;
        }


        if (audio.paused) {

            audio.play()
                .catch(error => {

                    console.error(
                        "Gagal play:",
                        error
                    );

                });

        } else {

            audio.pause();

        }


        updatePlayButton();

    }
);


/* =========================
   PLAY BUTTON UPDATE
========================= */

function updatePlayButton() {

    const button =
        document.getElementById(
            "playBtn"
        );


    if (!button) return;


    button.textContent =
        audio.paused
            ? "▶"
            : "Ⅱ";
}


/* =========================
   NEXT SONG
========================= */

document.getElementById(
    "nextBtn"
).addEventListener(
    "click",
    nextSong
);


function nextSong() {

    if (!songs.length) return;


    let next;


    if (shuffle) {

        next =
            Math.floor(
                Math.random() *
                songs.length
            );

    } else {

        next =
            currentIndex + 1;


        if (
            next >= songs.length
        ) {

            next = 0;

        }

    }


    playSong(next);
}


/* =========================
   PREVIOUS SONG
========================= */

document.getElementById(
    "previousBtn"
).addEventListener(
    "click",
    () => {


        if (!songs.length) return;


        let previous =
            currentIndex - 1;


        if (previous < 0) {

            previous =
                songs.length - 1;

        }


        playSong(
            previous
        );

    }
);


/* =========================
   AUDIO ENDED
========================= */

audio.addEventListener(
    "ended",
    () => {


        if (repeat) {

            audio.currentTime = 0;

            audio.play();

        } else {

            nextSong();

        }

    }
);


/* =========================
   SHUFFLE
========================= */

document.getElementById(
    "shuffleBtn"
).addEventListener(
    "click",
    () => {


        shuffle =
            !shuffle;


        document.getElementById(
            "shuffleBtn"
        ).style.opacity =
            shuffle
                ? "1"
                : ".5";

    }
);


/* =========================
   REPEAT
========================= */

document.getElementById(
    "repeatBtn"
).addEventListener(
    "click",
    () => {


        repeat =
            !repeat;


        document.getElementById(
            "repeatBtn"
        ).style.opacity =
            repeat
                ? "1"
                : ".5";

    }
);


/* =========================
   PROGRESS
========================= */

audio.addEventListener(
    "timeupdate",
    () => {


        if (!audio.duration)
            return;


        const progress =
            (
                audio.currentTime /
                audio.duration
            ) * 100;


        const progressBar =
            document.getElementById(
                "progressBar"
            );


        if (progressBar) {

            progressBar.value =
                progress;

        }


        const currentTime =
            document.getElementById(
                "currentTime"
            );


        if (currentTime) {

            currentTime.textContent =
                formatTime(
                    audio.currentTime
                );

        }

    }
);


/* =========================
   AUDIO METADATA
========================= */

audio.addEventListener(
    "loadedmetadata",
    () => {


        const duration =
            document.getElementById(
                "duration"
            );


        if (duration) {

            duration.textContent =
                formatTime(
                    audio.duration
                );

        }

    }
);


/* =========================
   PROGRESS BAR
========================= */

document.getElementById(
    "progressBar"
).addEventListener(
    "input",
    event => {


        if (!audio.duration)
            return;


        audio.currentTime =
            (
                event.target.value /
                100
            ) *
            audio.duration;

    }
);


/* =========================
   VOLUME
========================= */

document.getElementById(
    "volumeBar"
).addEventListener(
    "input",
    event => {

        audio.volume =
            event.target.value;

    }
);


/* =========================
   CURRENT COVER
========================= */

function updateCurrentCover() {

    const container =
        document.getElementById(
            "currentCover"
        );


    if (!container)
        return;


    const song =
        songs[currentIndex];


    if (
        !song ||
        !song.cover
    ) {

        container.innerHTML =
            "♫";

        return;

    }


    container.innerHTML = `

        <img
            src="${escapeHTML(
                song.cover
            )}"
            alt="Cover"
        >

    `;
}


/* =========================
   CURRENT FAVORITE
========================= */

function updateFavoriteButton() {

    const button =
        document.getElementById(
            "favoriteCurrent"
        );


    if (!button) return;


    if (
        currentIndex === -1 ||
        !songs[currentIndex]
    ) {

        button.textContent =
            "♡";

        return;
    }


    button.textContent =
        songs[currentIndex].favorite
            ? "♥"
            : "♡";
}


/* =========================
   CURRENT FAVORITE BUTTON
========================= */

document.getElementById(
    "favoriteCurrent"
).addEventListener(
    "click",
    () => {


        if (
            currentIndex === -1
        )
            return;


        toggleFavorite(
            songs[currentIndex].id
        );

    }
);


/* =========================
   CREATE PLAYLIST MODAL
========================= */

function openPlaylistModal() {

    document
        .getElementById(
            "playlistModal"
        )
        .classList.add("show");
}


document.getElementById(
    "addPlaylistBtn"
).addEventListener(
    "click",
    openPlaylistModal
);


document.getElementById(
    "createPlaylistBtn"
).addEventListener(
    "click",
    openPlaylistModal
);


/* =========================
   CREATE PLAYLIST
========================= */

document.getElementById(
    "playlistForm"
).addEventListener(
    "submit",
    async event => {


        event.preventDefault();


        const name =
            document.getElementById(
                "playlistName"
            )
            .value
            .trim();


        const description =
            document.getElementById(
                "playlistDescriptionInput"
            )
            .value
            .trim();


        const coverFile =
            document.getElementById(
                "playlistCoverInput"
            )
            .files[0];


        if (!name) {

            alert(
                "Nama playlist wajib diisi."
            );

            return;
        }


        let cover = null;


        /* =========================
           UPLOAD PLAYLIST COVER
        ========================= */

        try {

            if (coverFile) {

                cover =
                    await uploadFile(
                        coverFile,
                        "covers",
                        "playlists"
                    );

            }

        } catch (error) {

            console.error(
                "Gagal upload cover playlist:",
                error
            );

            alert(
                "Gagal upload cover playlist. Cek Console."
            );

            return;
        }


        /* =========================
           INSERT PLAYLIST
        ========================= */

              const {
          data,
          error
      } = await supabaseClient
          .from("playlists")
          .insert([
              {
                  name: name,
                  description: description,
                  cover_url: cover,
                  is_public: true
              }
          ])
          .select()
          .single();


        if (error) {

            console.error(
                "Gagal membuat playlist:",
                error
            );

            alert(
                "Gagal membuat playlist. Cek Console."
            );

            return;
        }


        playlists.push(
            data
        );


        renderPlaylists();


        closeModal(
            "playlistModal"
        );


        event.target.reset();


        console.log(
            "Playlist berhasil dibuat:",
            data
        );

    }
);


/* =========================
   ADD SONG MODAL
========================= */

document.getElementById(
    "addSongBtn"
).addEventListener(
    "click",
    () => {


        updatePlaylistSelect();


        document
            .getElementById(
                "songModal"
            )
            .classList.add("show");

    }
);


/* =========================
   ADD SONG
========================= */

document.getElementById(
    "songForm"
).addEventListener(
    "submit",
    async event => {


        event.preventDefault();


        const title =
            document.getElementById(
                "songTitle"
            )
            .value
            .trim();


        const artist =
            document.getElementById(
                "songArtist"
            )
            .value
            .trim();


        const coverFile =
            document.getElementById(
                "songCover"
            )
            .files[0];


        const audioFile =
            document.getElementById(
                "songAudio"
            )
            .files[0];


        const playlistId =
            document.getElementById(
                "songPlaylist"
            )
            .value;


        if (!title) {

            alert(
                "Judul lagu wajib diisi."
            );

            return;
        }


        if (!artist) {

            alert(
                "Nama artis wajib diisi."
            );

            return;
        }


        if (!audioFile) {

            alert(
                "File audio wajib dipilih."
            );

            return;
        }


        let cover = null;

        let audioURL = null;


        /* =========================
           UPLOAD FILE
        ========================= */

        try {


            /* =========================
               COVER
            ========================= */

            if (coverFile) {

                cover =
                    await uploadFile(
                        coverFile,
                        "covers",
                        "songs"
                    );

            }


            /* =========================
               AUDIO
            ========================= */

            audioURL =
                await uploadFile(
                    audioFile,
                    "music",
                    "songs"
                );


        } catch (error) {

            console.error(
                "Gagal upload file:",
                error
            );

            alert(
                "Gagal upload file. Cek Console."
            );

            return;
        }


        /* =========================
           SAVE SONG
        ========================= */

        const {
    data: newSong,
    error: songError
} = await supabaseClient
    .from("songs")
    .insert([
        {
            title: title,
            artist: artist,
            cover_url: cover,
            audio_url: audioURL,
            playlist_id: playlistId,
            favorite: false,
            duration: ""
        }
    ])
    .select()
    .single();


        if (songError) {

            console.error(
                "Gagal menyimpan lagu ke Supabase:",
                songError
            );

            alert(
                "Gagal menyimpan lagu ke Supabase. Cek Console."
            );

            return;
        }


        /* =========================
           UPDATE LOCAL DATA
        ========================= */

        songs.push(
            newSong
        );


        renderRecentSongs();

        renderPlaylists();


        closeModal(
            "songModal"
        );


        event.target.reset();


        console.log(
            "Lagu berhasil ditambahkan:",
            newSong
        );

    }
);


/* =========================
   SUPABASE STORAGE UPLOAD
========================= */

async function uploadFile(
    file,
    bucket,
    folder = ""
) {

    if (!file)
        return null;


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const fileName =
        `${crypto.randomUUID()}.${extension}`;


    const filePath =
        folder
            ? `${folder}/${fileName}`
            : fileName;


    console.log(
        "Uploading:",
        bucket,
        filePath
    );


    const {
        error
    } = await supabaseClient
        .storage
        .from(bucket)
        .upload(
            filePath,
            file,
            {
                cacheControl:
                    "3600",

                upsert:
                    false
            }
        );


    if (error) {

        console.error(
            `Gagal upload ke ${bucket}:`,
            error
        );

        throw error;
    }


    const {
        data
    } =
        supabaseClient
            .storage
            .from(bucket)
            .getPublicUrl(
                filePath
            );


    console.log(
        "File uploaded:",
        data.publicUrl
    );


    return data.publicUrl;
}


/* =========================
   OPEN PLAYLIST
========================= */

function openPlaylist(id) {

    const playlist =
        playlists.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!playlist)
        return;


    currentPlaylist =
        id;


    document.getElementById(
        "homePage"
    )
        .classList
        .remove("active");


    document.getElementById(
        "favoritesPage"
    )
        .classList
        .remove("active");


    document.getElementById(
        "playlistPage"
    )
        .classList
        .add("active");


    document.getElementById(
        "playlistTitle"
    )
        .textContent =
        playlist.name;


    document.getElementById(
        "playlistDescription"
    )
        .textContent =
        playlist.description ||
        "Your playlist";


    const cover =
        document.getElementById(
            "playlistCover"
        );


   if (playlist.cover_url) {

    cover.innerHTML = `

        <img
            src="${escapeHTML(
                playlist.cover_url
            )}"
            alt="Cover"
        >

    `;

} else {

    cover.innerHTML =
        "♫";

}

    renderSongs(
        getPlaylistSongs(id),
        document.getElementById(
            "playlistSongs"
        )
    );
}


/* =========================
   PLAY PLAYLIST
========================= */

document.getElementById(
    "playPlaylistBtn"
).addEventListener(
    "click",
    () => {


        if (
            currentPlaylist === null
        )
            return;


        const playlistSongs =
            getPlaylistSongs(
                currentPlaylist
            );


        if (
            !playlistSongs.length
        )
            return;


        const firstSong =
            songs.findIndex(
                song =>
                    song.id ===
                    playlistSongs[0].id
            );


        if (
            firstSong !== -1
        ) {

            playSong(
                firstSong
            );

        }

    }
);


/* =========================
   DELETE PLAYLIST
========================= */

document.getElementById(
    "deletePlaylistBtn"
).addEventListener(
    "click",
    async () => {


        if (
            currentPlaylist === null
        )
            return;


        if (
            playlists.length <= 1
        ) {

            alert(
                "Minimal harus ada satu playlist."
            );

            return;
        }


        const playlist =
            playlists.find(
                item =>
                    String(item.id) ===
                    String(currentPlaylist)
            );


        if (!playlist)
            return;


        if (
            !confirm(
                `Hapus playlist "${playlist.name}"?`
            )
        )
            return;


        /* =========================
           DELETE SONGS
        ========================= */

        const {
            error: songDeleteError
        } = await supabaseClient
            .from("songs")
            .delete()
            .eq(
                "playlistId",
                currentPlaylist
            );


        if (songDeleteError) {

            console.error(
                "Gagal menghapus songs:",
                songDeleteError
            );

            alert(
                "Gagal menghapus lagu dari playlist."
            );

            return;
        }


        /* =========================
           DELETE PLAYLIST
        ========================= */

        const {
            error: playlistDeleteError
        } = await supabaseClient
            .from("playlists")
            .delete()
            .eq(
                "id",
                currentPlaylist
            );


        if (playlistDeleteError) {

            console.error(
                "Gagal menghapus playlist:",
                playlistDeleteError
            );

            alert(
                "Gagal menghapus playlist."
            );

            return;
        }


        /* =========================
           UPDATE LOCAL DATA
        ========================= */

        songs =
            songs.filter(
                song =>
                    String(
                        song.playlistId
                    ) !==
                    String(
                        currentPlaylist
                    )
            );


        playlists =
            playlists.filter(
                playlist =>
                    String(
                        playlist.id
                    ) !==
                    String(
                        currentPlaylist
                    )
            );


        currentPlaylist =
            null;


        renderPlaylists();

        renderRecentSongs();


        showPage(
            "home"
        );


        console.log(
            "Playlist berhasil dihapus."
        );

    }
);


/* =========================
   BACK HOME
========================= */

document.getElementById(
    "backHome"
).addEventListener(
    "click",
    () => {

        showPage(
            "home"
        );

    }
);


/* =========================
   NAVIGATION
========================= */

document.querySelectorAll(
    ".nav-item"
).forEach(
    button => {


        button.addEventListener(
            "click",
            () => {


                const page =
                    button.dataset.page;


                showPage(
                    page
                );

            }
        );

    }
);


/* =========================
   SHOW PAGE
========================= */

function showPage(page) {


    document.querySelectorAll(
        ".page"
    ).forEach(
        pageElement => {

            pageElement
                .classList
                .remove("active");

        }
    );


    if (
        page === "home"
    ) {

        document.getElementById(
            "homePage"
        )
            .classList
            .add("active");

    }


    if (
        page === "favorites"
    ) {

        document.getElementById(
            "favoritesPage"
        )
            .classList
            .add("active");


        renderFavorites();

    }


    if (
        page === "playlist"
    ) {

        document.getElementById(
            "playlistPage"
        )
            .classList
            .add("active");

    }


    document.querySelectorAll(
        ".nav-item"
    ).forEach(
        button => {


            button.classList.toggle(
                "active",
                button.dataset.page ===
                    page
            );

        }
    );
}


/* =========================
   SEARCH
========================= */

document.getElementById(
    "searchInput"
).addEventListener(
    "input",
    event => {


        const query =
            event.target.value
                .toLowerCase()
                .trim();


        const results =
            songs.filter(
                song => {


                    const title =
                        String(
                            song.title ||
                            ""
                        )
                        .toLowerCase();


                    const artist =
                        String(
                            song.artist ||
                            ""
                        )
                        .toLowerCase();


                    return (
                        title.includes(
                            query
                        ) ||
                        artist.includes(
                            query
                        )
                    );

                }
            );


        renderSongs(
            results,
            document.getElementById(
                "recentSongs"
            )
        );

    }
);


/* =========================
   MODAL CLOSE BUTTON
========================= */

document.querySelectorAll(
    ".close-modal"
).forEach(
    button => {


        button.addEventListener(
            "click",
            () => {


                closeModal(
                    button.dataset.close
                );

            }
        );

    }
);


/* =========================
   MODAL BACKDROP
========================= */

document.querySelectorAll(
    ".modal"
).forEach(
    modal => {


        modal.addEventListener(
            "click",
            event => {


                if (
                    event.target ===
                    modal
                ) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }
);


/* =========================
   CLOSE MODAL
========================= */

function closeModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal)
        return;


    modal.classList.remove(
        "show"
    );
}


/* =========================
   MOBILE MENU
========================= */

const sidebar =
    document.querySelector(
        ".sidebar"
    );


const mobileMenuBtn =
    document.getElementById(
        "mobileMenuBtn"
    );


if (
    mobileMenuBtn &&
    sidebar
) {


    mobileMenuBtn.addEventListener(
        "click",
        event => {


            event.stopPropagation();


            sidebar.classList.toggle(
                "open"
            );

        }
    );


    /* =========================
       NAV CLICK
    ========================= */

    document.querySelectorAll(
        ".nav-item"
    ).forEach(
        button => {


            button.addEventListener(
                "click",
                () => {

                    sidebar.classList.remove(
                        "open"
                    );

                }
            );

        }
    );


    /* =========================
       PLAYLIST CLICK
    ========================= */

    const playlistList =
        document.getElementById(
            "playlistList"
        );


    if (playlistList) {

        playlistList.addEventListener(
            "click",
            () => {

                sidebar.classList.remove(
                    "open"
                );

            }
        );

    }


    /* =========================
       OUTSIDE CLICK
    ========================= */

    document.addEventListener(
        "click",
        event => {


            if (
                sidebar.classList.contains(
                    "open"
                ) &&
                !sidebar.contains(
                    event.target
                ) &&
                !mobileMenuBtn.contains(
                    event.target
                )
            ) {

                sidebar.classList.remove(
                    "open"
                );

            }

        }
    );

}


/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

    return String(
        text ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================
   AUDIO ERROR
========================= */

audio.addEventListener(
    "error",
    () => {

        console.error(
            "Audio gagal dimuat:",
            audio.src
        );

    }
);


/* =========================
   AUDIO PLAY
========================= */

audio.addEventListener(
    "play",
    () => {

        updatePlayButton();

    }
);


/* =========================
   AUDIO PAUSE
========================= */

audio.addEventListener(
    "pause",
    () => {

        updatePlayButton();

    }
);


/* =========================
   INITIAL
========================= */

audio.volume = 0.8;

loadData();
