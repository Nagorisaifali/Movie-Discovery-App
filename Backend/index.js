const express = require('express')

const app = express()
const port = process.env.PORT || 5000
const tmdbKey = process.env.TMDB_API_KEY
const tmdbBase = 'https://api.themoviedb.org/3'
const cache = new Map()
const cacheTtlMs = 5 * 60 * 1000
const tmdbGenres = {
    Action: 28,
    Adventure: 12,
    Comedy: 35,
    Crime: 80,
    Documentary: 99,
    Drama: 18,
    Family: 10751,
    Fantasy: 14,
    History: 36,
    Horror: 27,
    Mystery: 9648,
    Romance: 10749,
    'Sci-Fi': 878,
    Thriller: 53,
}
const tmdbGenreNames = Object.fromEntries(Object.entries(tmdbGenres).map(([name, id]) => [id, name]))

app.use(express.json())
app.use((_request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
    next()
})

const demoMovies = [
    { id: 1, title: 'The Last Horizon', year: 2025, rating: 8.4, genres: ['Sci-Fi', 'Drama'], runtime: 128, maturity: 'PG-13', moods: ['Epic', 'Thoughtful'], director: 'Mira Voss', cast: ['Rhea Vale', 'Jon Ash', 'Mina Cole'], poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1800&q=85', overview: 'A lone cartographer crosses an abandoned planet to find the signal that could bring humanity home.' },
    { id: 2, title: 'Neon Afterglow', year: 2024, rating: 7.9, genres: ['Thriller', 'Mystery'], runtime: 111, maturity: 'R', moods: ['Tense', 'Stylish'], director: 'Cal Renner', cast: ['Iris Lane', 'Theo Park', 'Nadia Kim'], poster: 'https://images.unsplash.com/photo-1518930259200-9f3b2b0d4e9e?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85', overview: 'A night-shift radio host hears a voice from tomorrow and follows it into the city after dark.' },
    { id: 3, title: 'Paper Moons', year: 2023, rating: 8.1, genres: ['Romance', 'Drama'], runtime: 104, maturity: 'PG', moods: ['Warm', 'Bittersweet'], director: 'Elena Noor', cast: ['June Park', 'Leo Ward', 'Mara Finch'], poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1800&q=85', overview: 'Two strangers exchange letters across a small town, never realizing they pass each other every day.' },
    { id: 4, title: 'The Quiet Giant', year: 2022, rating: 8.7, genres: ['Documentary', 'History'], runtime: 96, maturity: 'PG', moods: ['Inspiring', 'Reflective'], director: 'Sana Bell', cast: ['Eli Grant', 'Noah Stone'], poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=85', overview: 'An intimate portrait of the engineer who built a bridge that changed a whole coastline.' },
    { id: 5, title: 'Wildflower Season', year: 2025, rating: 7.6, genres: ['Drama', 'Family'], runtime: 118, maturity: 'PG', moods: ['Comforting', 'Hopeful'], director: 'Priya Moss', cast: ['Aria Bell', 'Miles Reed', 'Tara Sloane'], poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85', overview: 'After a decade away, a chef returns to her mountain hometown to rebuild her family restaurant.' },
    { id: 6, title: 'Orbit 9', year: 2024, rating: 8.0, genres: ['Sci-Fi', 'Adventure'], runtime: 132, maturity: 'PG-13', moods: ['Epic', 'Suspenseful'], director: 'Nico Sol', cast: ['Cass Yu', 'Amir Fox', 'Lena Grey'], poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1800&q=85', overview: 'A stranded crew gets one final chance to make contact before their orbit decays.' },
    { id: 7, title: 'Laugh Track Lane', year: 2021, rating: 7.4, genres: ['Comedy'], runtime: 101, maturity: 'PG-13', moods: ['Light', 'Funny'], director: 'Ben Vale', cast: ['Owen Lee', 'Ruby Finn'], poster: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1800&q=85', overview: 'Four neighbors accidentally turn a building meeting into the strangest comedy club in town.' },
    { id: 8, title: 'Harbor Run', year: 2020, rating: 7.8, genres: ['Action', 'Crime'], runtime: 123, maturity: 'R', moods: ['Fast', 'Gritty'], director: 'Jules Carter', cast: ['Kai Stone', 'Lola Wynn', 'Max Rhys'], poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85', overview: 'A courier with one clean record takes a final midnight job through a locked-down harbor.' },
]

const watchParties = []

function normalizeMovie(movie) {
    return {
        id: movie.id,
        title: movie.title || movie.name || 'Untitled movie',
        year: (movie.release_date || '').slice(0, 4) || 'TBA',
        rating: Number(movie.vote_average || 0).toFixed(1),
        genres: (movie.genre_ids || []).map((id) => tmdbGenreNames[id] || 'Other'),
        runtime: movie.runtime || null,
        maturity: movie.adult ? 'R' : 'PG-13',
        moods: [],
        director: '',
        cast: [],
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
        overview: movie.overview || 'No overview is available for this title yet.',
    }
}

async function tmdb(path, params = {}) {
    const url = new URL(`${tmdbBase}${path}`)
    url.searchParams.set('api_key', tmdbKey)
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value)
    })
    const cacheKey = url.toString()
    const cached = cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) return cached.data
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) throw new Error(`TMDB request failed with ${response.status}`)
    const data = await response.json()
    cache.set(cacheKey, { data, expiresAt: Date.now() + cacheTtlMs })
    if (cache.size > 100) cache.delete(cache.keys().next().value)
    return data
}

function filterDemoMovies({ query = '', genre = '', mood = '', sort = 'trending' }) {
    const search = query.toLowerCase().trim()
    const filtered = demoMovies.filter((movie) => {
        const matchesSearch = !search || [movie.title, movie.overview, movie.director, ...movie.genres, ...movie.moods].join(' ').toLowerCase().includes(search)
        const matchesGenre = !genre || movie.genres.includes(genre)
        const matchesMood = !mood || movie.moods.includes(mood)
        return matchesSearch && matchesGenre && matchesMood
    })

    return filtered.sort((a, b) => {
        if (sort === 'top') return b.rating - a.rating
        if (sort === 'newest') return b.year - a.year
        if (sort === 'runtime') return a.runtime - b.runtime
        return b.id - a.id
    })
}

function buildStats(movies) {
    const genreCounts = movies.reduce((counts, movie) => {
        movie.genres.forEach((genre) => counts[genre] = (counts[genre] || 0) + 1)
        return counts
    }, {})
    const totalRuntime = movies.reduce((sum, movie) => sum + (movie.runtime || 0), 0)
    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])
    return {
        totalMovies: movies.length,
        averageRating: (movies.reduce((sum, movie) => sum + Number(movie.rating || 0), 0) / movies.length).toFixed(1),
        totalRuntime,
        genreCounts,
        topGenre: sortedGenres.length ? sortedGenres[0][0] : 'Drama',
    }
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok', storage: 'memory-only' }))

app.get('/api/movies', async(request, response) => {
    const { query = '', genre = '', mood = '', sort = 'trending', page = 1 } = request.query
    const safePage = Math.max(1, Math.min(Number(page) || 1, 500))
    try {
        if (!tmdbKey) {
            const allResults = filterDemoMovies({ query, genre, mood, sort })
            const pageSize = 4
            const start = (safePage - 1) * pageSize
            return response.json({ page: safePage, totalPages: Math.max(1, Math.ceil(allResults.length / pageSize)), results: allResults.slice(start, start + pageSize) })
        }
        const genreId = tmdbGenres[genre]
        const data = query ?
            await tmdb('/search/movie', { query, page: safePage, with_genres: genreId }) :
            await tmdb(sort === 'top' ? '/discover/movie' : '/trending/movie/week', { page: safePage, sort_by: sort === 'top' ? 'vote_average.desc' : undefined, with_genres: genreId })
        response.json({ page: data.page, totalPages: data.total_pages, results: data.results.map(normalizeMovie) })
    } catch (error) {
        response.status(502).json({ message: 'Movie service is temporarily unavailable.', detail: error.message })
    }
})

app.get('/api/movies/:id', async(request, response) => {
    try {
        if (!tmdbKey) {
            const movie = demoMovies.find((item) => String(item.id) === request.params.id)
            return movie ? response.json(movie) : response.status(404).json({ message: 'Movie not found.' })
        }
        response.json(normalizeMovie(await tmdb(`/movie/${request.params.id}`)))
    } catch (error) {
        response.status(502).json({ message: 'Movie service is temporarily unavailable.', detail: error.message })
    }
})

app.get('/api/genres', (_request, response) => {
    response.json([...new Set(demoMovies.flatMap((movie) => movie.genres))].sort())
})

app.get('/api/moods', (_request, response) => {
    response.json([...new Set(demoMovies.flatMap((movie) => movie.moods))].sort())
})

app.get('/api/stats', (_request, response) => {
    response.json(buildStats(demoMovies))
})

app.post('/api/recommendations', (request, response) => {
    const { genres = [], moods = [], maxRuntime = 180, excludeIds = [] } = request.body || {}
    const excluded = new Set(excludeIds.map(String))
    const ranked = demoMovies
        .filter((movie) => !excluded.has(String(movie.id)) && movie.runtime <= Number(maxRuntime || 180))
        .map((movie) => {
            const genreScore = movie.genres.filter((genre) => genres.includes(genre)).length * 3
            const moodScore = movie.moods.filter((mood) => moods.includes(mood)).length * 2
            return {...movie, matchScore: genreScore + moodScore + Number(movie.rating) / 2 }
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 4)
    response.json({ results: ranked })
})

app.get('/api/watch-parties', (_request, response) => {
    response.json(watchParties.slice().reverse())
})

app.post('/api/watch-parties', (request, response) => {
    const { movieId, title, date, time, guests = [] } = request.body || {}
    if (!movieId || !title || !date || !time) {
        return response.status(400).json({ message: 'Movie, date, and time are required.' })
    }
    const party = {
        id: Date.now(),
        movieId,
        title,
        date,
        time,
        guests: String(guests).split(',').map((guest) => guest.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
    }
    watchParties.push(party)
    response.status(201).json(party)
})

app.delete('/api/watch-parties/:id', (request, response) => {
    const index = watchParties.findIndex((party) => String(party.id) === request.params.id)
    if (index === -1) return response.status(404).json({ message: 'Watch party not found.' })
    watchParties.splice(index, 1)
    response.status(204).end()
})

app.listen(port, () => console.log(`Movie API listening on http://localhost:${port}`))