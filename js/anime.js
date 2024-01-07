const ANIME_URL = "https://api.jikan.moe/v4/"

let videoContainer = document.getElementById('video-container')
let videoPlayer = document.getElementById('video-player')
let textInfo = document.getElementById('text-info')
let detailsTitle = document.getElementById('details-title')
let detailsType = document.getElementById('details-type')
let detailsEpisodes = document.getElementById('details-episodes')
let detailsStatus = document.getElementById('details-status')
let detailsDuration = document.getElementById('details-duration')
let detailsRating = document.getElementById('details-rating')
let detailsYear = document.getElementById('details-year')
let detailsScore = document.getElementById('details-score')
let detailsSynopsis = document.getElementById('details-synopsis')
let synopsisText = document.getElementById('synopsis-text')
let detailsBackground = document.getElementById('details-background')
let backgroundText = document.getElementById('background-text')
let episodeList = document.getElementById('episode-list')

let episodeDetails = []
let selectedEpisodeElement = null

function loadAnime() {
    let animeDetails = JSON.parse(sessionStorage.getItem('currentAnime'));
    videoPlayer.src = animeDetails.trailer.embed_url
    detailsTitle.innerHTML = `${animeDetails.title_english} / ${animeDetails.title_japanese}`
    detailsType.innerHTML = animeDetails.type
    detailsEpisodes.innerHTML = String(animeDetails.episodes)
    detailsStatus.innerHTML = animeDetails.status
    detailsDuration.innerHTML = animeDetails.duration
    detailsRating.innerHTML = animeDetails.rating
    detailsYear.innerHTML = String(animeDetails.year)
    detailsScore.innerHTML = `${animeDetails.score} (${animeDetails.scored_by} reviews)`
    if (animeDetails.synopsis) {
        synopsisText.innerHTML = animeDetails.synopsis
    } else {
        detailsSynopsis.classList.add('hidden')
    }
    if (animeDetails.description) {
        backgroundText.innerHTML = animeDetails.background
    } else {
        detailsBackground.classList.add('hidden')
    }

    episodeList.style.height = `${textInfo.offsetHeight}px`

    fetch(`${ANIME_URL}anime/${animeDetails.mal_id}/episodes`)
        .then(async res => await res.json())
        .then(episodes => {
            episodes = episodes.data.sort((a, b) => a.mal_id - b.mal_id)   // Sort the episodes in ascending order
            fetch(`${ANIME_URL}anime/${animeDetails.mal_id}/videos/episodes`)
                .then(async res => await res.json())
                .then(episodeVideos => {
                    episodeVideos = episodeVideos.data.sort((a, b) => a.mal_id - b.mal_id)
                    for (let i in episodes) {
                        let episode = episodes[i]
                        let episodeVideo = episodeVideos[i]
                        episodeDetails.push({
                            'info': episode,
                            'video_url': episodeVideo?.url,  
                        })
                        let newEpisode = document.createElement('div')
                        newEpisode.className = 'episode'
                        newEpisode.classList.add(i%2 ? 'episode-gray' : 'episode-black')
                        if (episodeVideo) {
                            newEpisode.classList.add('episode-available')
                            newEpisode.addEventListener('click', (event) => {loadEpisode(event, parseInt(i))})
                        }
                        newEpisode.innerHTML = 
                        // ${episodeVideo?.images?.jpg?.image_url ? `<img class="episode-image" src="${episodes.images.jpg.image_url}">` :  ''}
                        `
                        <h3 class="episode-number">${parseInt(i)+1}</h3>
                        <div class="episode-details">
                            <p class="episode-title">${episode.title}</p>
                            <p class="episode-availability ${episodeVideo ? "green-text" : "red-text"}">${episodeVideo ? "Available" : "Unavailable"}</p>
                        </div>
                        `
                        episodeList.appendChild(newEpisode)
                    }
                })
        })
}

function goToHome() {
    window.location = './home.html'
}

function loadEpisode(event, episodeNumber) {
    videoPlayer.src = episodeDetails[episodeNumber-1]?.video_url
    selectedEpisodeElement?.classList.remove('episode-selected')
    selectedEpisodeElement = event.currentTarget
    selectedEpisodeElement.classList.add('episode-selected')
}