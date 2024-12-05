const clientId = '5c3a92f1bda94c119a8ca67118f1a34d';
const clientSecret = 'a01a44cf708344d697a3d4fc9f56affd';

async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(clientId + ':' + clientSecret)}`
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

async function fetchSongs(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/playlists/{playlist_id}/tracks', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    return data.items.map(item => ({
        songName: item.track.name,
        filePath: item.track.preview_url,
        coverPath: item.track.album.images[0].url
    }));
}

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = await getAccessToken();
    const songs = await fetchSongs(accessToken);

    const songItemsContainer = document.querySelector('.songItemContainer');

    songs.forEach((song, index) => {
        const songElement = document.createElement('div');
        songElement.classList.add('songItem');
        songElement.innerHTML = `
            <img src="${song.coverPath}" alt="${index + 1}" />
            <span class="songName">${song.songName}</span>
            <span class="songlistplay">
                <span class="timestamp">
                    <i id="${index}" class="far songItemPlay fa-play-circle"></i>
                </span>
            </span>
        `;
        songItemsContainer.appendChild(songElement);
    });

    const audioElement = document.getElementById('audioElement');
    const masterPlay = document.getElementById('masterPlay');
    const masterSongName = document.getElementById('masterSongName');
    const gif = document.getElementById('gif');

    Array.from(document.getElementsByClassName('songItemPlay')).forEach((element) => {
        element.addEventListener('click', (e) => {
            const songIndex = parseInt(e.target.id);
            const previewUrl = songs[songIndex].filePath;

            if (!previewUrl) {
                alert('Preview not available for this song.');
                return;
            }

            audioElement.src = previewUrl;
            masterSongName.innerText = songs[songIndex].songName;
            audioElement.currentTime = 0;
            audioElement.play();
            gif.style.opacity = 1;
            masterPlay.classList.remove('fa-play-circle');
            masterPlay.classList.add('fa-pause-circle');
        });
    });

    masterPlay.addEventListener('click', () => {
        if (audioElement.paused || audioElement.currentTime <= 0) {
            audioElement.play();
            gif.style.opacity = 1;
            masterPlay.classList.remove('fa-play-circle');
            masterPlay.classList.add('fa-pause-circle');
        } else {
            audioElement.pause();
            gif.style.opacity = 0;
            masterPlay.classList.remove('fa-pause-circle');
            masterPlay.classList.add('fa-play-circle');
        }
    });
});
