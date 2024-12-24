console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;
// Mood Dialog Logic
const moodDialog = document.getElementById('moodDialog');
const closeDialog = document.getElementById('closeDialog');
const moodOptions = document.querySelectorAll('.mood-option');


// Mapping moods to playlists
const moodPlaylists = {
    angry: 'songs/relax',
    sad: 'songs/Chill',
    happy: 'songs/Soothing',
    bored: 'songs/Funky_(mood)',
    text: 'songs/custom'
};

// Handle mood selection
moodOptions.forEach(option => {
    option.addEventListener('click', () => {
        const mood = option.dataset.mood;

        // If user selects text, prompt for custom input
        if (mood === 'text') {
            const customMood = prompt("Enter your mood:");
            if (customMood) {
                alert(`Playing songs for your mood: ${customMood}`);
                playFolder('songs/custom'); // Custom playlist
            }
        } else {
            alert(`Playing songs for mood: ${mood}`);
            playFolder(moodPlaylists[mood]); // Play corresponding playlist
        }

        // Close the dialog after selecting a mood
        closeDialogBox();
    });
});

// Close dialog
closeDialog.addEventListener('click', closeDialogBox);

function closeDialogBox() {
    moodDialog.style.display = 'none'; // Hide the dialog box
}

// Play folder logic (uses your existing logic)
function playFolder(folder) {
    // Call your getSongs or playMusic function here
    getSongs(folder).then(() => {
        playMusic(songs[0]); // Play the first song in the folder
    });
}

// Show the dialog when the page loads
window.addEventListener('load', () => {
    moodDialog.style.display = 'flex'; // Show the dialog box
});

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

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
 


    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Harry</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" id="play2" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            


        })
    })

    return songs
}
const playMusic = (track, pause = false) => {
    // Find all song list items
    const allSongs = document.querySelectorAll(".songList li");

    // Find the current song's <li>
    const currentSongLi = Array.from(allSongs).find(li =>
        li.querySelector(".info div").textContent.trim() === decodeURI(track)
    );

    if (currentSongLi) {
        // If the current song is already playing, toggle pause
        if (currentSong.src.includes(track) && !currentSong.paused) {
            currentSong.pause();
            play.src = "img/play.svg"; // Update the play bar icon to play
            currentSongLi.querySelector(".playnow span").textContent = "Play Now"; // Update text
            currentSongLi.querySelector(".playnow img").src = "img/play.svg"; // Update icon
            return; // Exit the function to avoid replaying
        }
    }

    // Otherwise, play the song
    currentSong.src = `/${currFolder}/` + track;
    currentSong.play();
    play.src = "img/pause.svg"; // Update the play bar icon to pause

      // Update the song info on the play bar
      document.querySelector(".songinfo").textContent = decodeURI(track); // Ensure the song title is displayed


    // Update the UI for all songs
    allSongs.forEach(song => {
        song.classList.remove("active"); // Remove active class
        const playNowSpan = song.querySelector(".playnow span");
        const playNowIcon = song.querySelector(".playnow img");
        playNowSpan.textContent = "Play Now"; // Reset text
        playNowIcon.src = "img/play.svg"; // Reset icon
    });

    // Highlight the current song
    if (currentSongLi) {
        currentSongLi.classList.add("active");
        currentSongLi.querySelector(".playnow span").textContent = "Playing"; // Update text
        currentSongLi.querySelector(".playnow img").src = "img/pause.svg"; // Update icon
    }
};


async function displayAlbums() {
    console.log("displaying albums");
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    // Create a mapping for different categories
    const categoryMap = {};

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[1];

            // Fetch metadata for the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();

            // Determine the category for the folder (e.g., by mood or other criteria)
            let category = response.category || "Others"; // Default to 'Others' if no category

            // Add the folder to the appropriate category in the map
            if (!categoryMap[category]) {
                categoryMap[category] = [];
            }
            categoryMap[category].push({
                folder,
                title: response.title,
                description: response.description,
            });
        }
    }

    // Render the categories and their respective folders
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; // Clear existing content

    for (const [category, folders] of Object.entries(categoryMap)) {
        // Create a container for the category
        let categoryDiv = document.createElement("div");
        categoryDiv.className = "category";
        categoryDiv.innerHTML = `<div><h2>${category}</h2></div><div class="categoryCards"></div>`;
        cardContainer.appendChild(categoryDiv);

        let categoryCards = categoryDiv.querySelector(".categoryCards");

        // Add the folders to this category
        for (const { folder, title, description } of folders) {
            categoryCards.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${title}</h2>
                    <p>${description}</p>
                </div>`;
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}

async function main() {
    // Get the list of all the songs
    // await getSongs("songs/Angry_(mood)")
    // playMusic(songs[0], true)
    // console.log("reached main angry");
    
    // Display all the albums on the page
    await displayAlbums()


    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

}

// Search functionality for filtering categories and songs
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase().trim(); // Get search query in lowercase

    // Filter categories
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        const categoryTitle = category.querySelector('h2').textContent.toLowerCase(); // Category title
        const categoryDescription = category.querySelector('p')?.textContent.toLowerCase(); // Category description (if present)

        // Check if the query matches the title or description
        if (categoryTitle.includes(query) || (categoryDescription && categoryDescription.includes(query))) {
            category.style.display = 'block'; // Show the category
        } else {
            category.style.display = 'none'; // Hide the category
        }
    });

    // Filter songs within categories (if needed)
    const songs = document.querySelectorAll('.songList li');
    songs.forEach(song => {
        const songTitle = song.querySelector('.info div').textContent.toLowerCase(); // Song title

        // Check if the query matches the song title
        if (songTitle.includes(query)) {
            song.style.display = 'flex'; // Show the song
        } else {
            song.style.display = 'none'; // Hide the song
        }
    });
});


main() 