const ANIME_URL = "https://api.jikan.moe/v4/"
let pages = []
let currentPageAnimeList = []
let container = document.getElementById("anime-container")
let main = document.getElementById("main")
let body = document.getElementById("body")
let currentPage = 0     // Users cannot skip pages yet

function loadAnime(page=JSON.parse(sessionStorage.getItem("currentPage")) || 0) {
    currentPage = page
    if (pages.length > 0 && pages[page].length > 0) {
        // Page has already been loaded
        currentPageAnimeList = pages[page]      
        displayAnimeCards();
    } else {
        fetch(`${ANIME_URL}anime?page=${page+1}`)
            .then(async res => {
                return await res.json()
            })
            .then(json => {
                while (pages.length < json.pagination.last_visible_page - 1) {
                    pages.push([])
                }
                currentPageAnimeList = pages[page]
                return currentPageAnimeList.push(...json.data)
            })
            .then(len => {
                displayAnimeCards();
            })
    }
    
}

function displayAnimeCards() {
    container.innerHTML = ''
    for (let i in currentPageAnimeList) {
        let anime = currentPageAnimeList[i]
        let newAnime = document.createElement("div");
        newAnime.className = "anime-card"
        newAnime.setAttribute("animeIndex", i)
        newAnime.innerHTML = `
        <img id=card-${i} src=${anime.images.jpg.image_url} animeIndex=${i} onmouseenter="showPreview(event)" onmouseleave="closePreview(event)" onclick="goToAnime(${i})">
        <h4 class="anime-card-title">${anime.title}</h4>
        `
        container.appendChild(newAnime)
    }
    let previousButton = document.getElementById("previous-button")
    let nextButton = document.getElementById("next-button")
    currentPage > 0 ? previousButton.classList.remove('nav-button-hidden') : previousButton.classList.add('nav-button-hidden')
    currentPage < pages.length - 1 ? nextButton.classList.remove('nav-button-hidden') : nextButton.classList.add('nav-button-hidden')
}

function showPreview(event) {
    let newPreview = document.createElement("div");
    let animeIndex = event.target.getAttribute("animeIndex")
    let animeDetails = currentPageAnimeList[animeIndex]
    let animeTitle = animeDetails.title
    newPreview.id = `preview-${animeIndex}`
    newPreview.setAttribute('animeIndex', animeIndex)
    newPreview.className = "anime-preview"
    newPreview.innerHTML = 
    `<div animeIndex=${animeIndex}>
        <h3 class="preview-text">${animeTitle}</h3>
        <iframe class="preview-video" src=${animeDetails.trailer.embed_url}&muted=1&controls=0>
        </iframe>
        <p class="preview-text">${animeDetails.synopsis}</p>
    </div>`
    newPreview.style.left = `${Math.min(event.pageX, window.outerWidth - 500)}px`
    newPreview.style.top = `${Math.min(event.pageY, window.outerHeight + window.scrollY - 500)}px`
    newPreview.addEventListener('mouseleave', closePreview)
    if (!document.getElementById(newPreview.id)) {
        main.appendChild(newPreview)
        event.target.classList.add('anime-card-hover')
    }
}

function closePreview(event) {
    let animeIndex = event.target.getAttribute("animeIndex")
    let preview = document.getElementById(`preview-${animeIndex}`)
    let animeCard = document.getElementById(`card-${animeIndex}`)
    if (!(preview.matches(':hover') || animeCard.matches(':hover'))) {
        main.removeChild(preview)
        animeCard.classList.remove('anime-card-hover')
    }
}

function nextPage() {
    loadAnime(currentPage+1)
}

function previousPage() {
    loadAnime(currentPage-1)
}

function goToAnime(animeIndex) {
    let animeDetails = currentPageAnimeList[animeIndex]
    sessionStorage.setItem("currentAnime", JSON.stringify(animeDetails))
    sessionStorage.setItem("currentPage", JSON.stringify(currentPage))
    window.location = './anime.html'
}
