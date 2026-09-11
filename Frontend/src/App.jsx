import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api'
const defaultGenres = ['All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller', 'Documentary']
const defaultMoods = ['Epic', 'Warm', 'Tense', 'Funny', 'Hopeful', 'Reflective']
const fallbackMovies = [
	{ id: 1, title: 'The Last Horizon', year: 2025, rating: 8.4, genres: ['Sci-Fi', 'Drama'], runtime: 128, maturity: 'PG-13', moods: ['Epic', 'Thoughtful'], director: 'Mira Voss', cast: ['Rhea Vale', 'Jon Ash', 'Mina Cole'], poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1800&q=85', overview: 'A lone cartographer crosses an abandoned planet to find the signal that could bring humanity home.' },
	{ id: 2, title: 'Neon Afterglow', year: 2024, rating: 7.9, genres: ['Thriller', 'Mystery'], runtime: 111, maturity: 'R', moods: ['Tense', 'Stylish'], director: 'Cal Renner', cast: ['Iris Lane', 'Theo Park', 'Nadia Kim'], poster: 'https://images.unsplash.com/photo-1518930259200-9f3b2b0d4e9e?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85', overview: 'A night-shift radio host hears a voice from tomorrow and follows it into the city after dark.' },
	{ id: 3, title: 'Paper Moons', year: 2023, rating: 8.1, genres: ['Romance', 'Drama'], runtime: 104, maturity: 'PG', moods: ['Warm', 'Bittersweet'], director: 'Elena Noor', cast: ['June Park', 'Leo Ward', 'Mara Finch'], poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1800&q=85', overview: 'Two strangers exchange letters across a small town, never realizing they pass each other every day.' },
	{ id: 4, title: 'The Quiet Giant', year: 2022, rating: 8.7, genres: ['Documentary', 'History'], runtime: 96, maturity: 'PG', moods: ['Inspiring', 'Reflective'], director: 'Sana Bell', cast: ['Eli Grant', 'Noah Stone'], poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=85', overview: 'An intimate portrait of the engineer who built a bridge that changed a whole coastline.' },
	{ id: 5, title: 'Wildflower Season', year: 2025, rating: 7.6, genres: ['Drama', 'Family'], runtime: 118, maturity: 'PG', moods: ['Comforting', 'Hopeful'], director: 'Priya Moss', cast: ['Aria Bell', 'Miles Reed', 'Tara Sloane'], poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85', overview: 'After a decade away, a chef returns to her mountain hometown to rebuild her family restaurant.' },
	{ id: 6, title: 'Orbit 9', year: 2024, rating: 8.0, genres: ['Sci-Fi', 'Adventure'], runtime: 132, maturity: 'PG-13', moods: ['Epic', 'Suspenseful'], director: 'Nico Sol', cast: ['Cass Yu', 'Amir Fox', 'Lena Grey'], poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1800&q=85', overview: 'A stranded crew gets one final chance to make contact before their orbit decays.' },
	{ id: 7, title: 'Laugh Track Lane', year: 2021, rating: 7.4, genres: ['Comedy'], runtime: 101, maturity: 'PG-13', moods: ['Light', 'Funny'], director: 'Ben Vale', cast: ['Owen Lee', 'Ruby Finn'], poster: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1800&q=85', overview: 'Four neighbors accidentally turn a building meeting into the strangest comedy club in town.' },
	{ id: 8, title: 'Harbor Run', year: 2020, rating: 7.8, genres: ['Action', 'Crime'], runtime: 123, maturity: 'R', moods: ['Fast', 'Gritty'], director: 'Jules Carter', cast: ['Kai Stone', 'Lola Wynn', 'Max Rhys'], poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=85', backdrop: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85', overview: 'A courier with one clean record takes a final midnight job through a locked-down harbor.' },
]

function readStorage(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
	} catch {
		return fallback
	}
}

function App() {
	const [movies, setMovies] = useState([])
	const [wishlist, setWishlist] = useState(() => readStorage('cinepick-wishlist', []))
	const [ratings, setRatings] = useState(() => readStorage('cinepick-ratings', {}))
	const [notes, setNotes] = useState(() => readStorage('cinepick-notes', {}))
	const [history, setHistory] = useState(() => readStorage('cinepick-history', []))
	const [watchParties, setWatchParties] = useState([])
	const [recommendations, setRecommendations] = useState([])
	const [genres, setGenres] = useState(defaultGenres)
	const [moods, setMoods] = useState(defaultMoods)
	const [stats, setStats] = useState(null)
	const [query, setQuery] = useState('')
	const [activeGenre, setActiveGenre] = useState('All')
	const [activeMood, setActiveMood] = useState('')
	const [sort, setSort] = useState('trending')
	const [view, setView] = useState('discover')
	const [selected, setSelected] = useState(null)
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [error, setError] = useState('')

	useEffect(() => localStorage.setItem('cinepick-wishlist', JSON.stringify(wishlist)), [wishlist])
	useEffect(() => localStorage.setItem('cinepick-ratings', JSON.stringify(ratings)), [ratings])
	useEffect(() => localStorage.setItem('cinepick-notes', JSON.stringify(notes)), [notes])
	useEffect(() => localStorage.setItem('cinepick-history', JSON.stringify(history)), [history])

	useEffect(() => {
		Promise.all([
			fetch(`${API_URL}/genres`).then((response) => response.json()),
			fetch(`${API_URL}/moods`).then((response) => response.json()),
			fetch(`${API_URL}/stats`).then((response) => response.json()),
			fetch(`${API_URL}/watch-parties`).then((response) => response.json()),
		]).then(([genreList, moodList, statData, partyList]) => {
			setGenres(['All', ...genreList])
			setMoods(moodList)
			setStats(statData)
			setWatchParties(partyList)
		}).catch(() => {
			setStats(makeLocalStats(fallbackMovies))
		})
	}, [])

	useEffect(() => {
		const controller = new AbortController()
		const timer = setTimeout(async () => {
			if (page === 1) setLoading(true)
			else setLoadingMore(true)
			setError('')
			try {
				const params = new URLSearchParams({ query, sort, genre: activeGenre === 'All' ? '' : activeGenre, mood: activeMood, page: String(page) })
				const response = await fetch(`${API_URL}/movies?${params}`, { signal: controller.signal })
				if (!response.ok) throw new Error('Could not reach the movie service.')
				const data = await response.json()
				setTotalPages(data.totalPages || 1)
				setMovies((current) => page === 1 ? data.results : [...current, ...data.results.filter((movie) => !current.some((item) => item.id === movie.id))])
			} catch (requestError) {
				if (requestError.name !== 'AbortError') {
					setError('Showing the offline collection.')
					if (page === 1) setMovies(filterLocalMovies({ query, activeGenre, activeMood, sort }))
				}
			} finally {
				setLoading(false)
				setLoadingMore(false)
			}
		}, 250)
		return () => {
			clearTimeout(timer)
			controller.abort()
		}
	}, [query, activeGenre, activeMood, sort, page])

	const visibleMovies = view === 'wishlist' ? wishlist : movies
	const totalWatchTime = wishlist.reduce((sum, movie) => sum + (movie.runtime || 0), 0)
	const heroMovie = movies[0] || fallbackMovies[0]

	const collectionStats = useMemo(() => [
		{ label: 'Saved', value: wishlist.length },
		{ label: 'Watch time', value: `${Math.floor(totalWatchTime / 60)}h ${totalWatchTime % 60}m` },
		{ label: 'Rated', value: Object.keys(ratings).length },
		{ label: 'Parties', value: watchParties.length },
	], [wishlist, totalWatchTime, ratings, watchParties])

	function toggleWishlist(movie) {
		setWishlist((current) => current.some((item) => item.id === movie.id) ? current.filter((item) => item.id !== movie.id) : [...current, movie])
	}

	function openMovie(movie) {
		setSelected(movie)
		setHistory((current) => [movie, ...current.filter((item) => item.id !== movie.id)].slice(0, 6))
	}

	function surpriseMe() {
		const source = visibleMovies.length ? visibleMovies : fallbackMovies
		openMovie(source[Math.floor(Math.random() * source.length)])
	}

	function loadMore() {
		if (!loadingMore && page < totalPages) setPage((current) => current + 1)
	}

	async function getRecommendations(preferences) {
		try {
			const response = await fetch(`${API_URL}/recommendations`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...preferences, excludeIds: wishlist.map((movie) => movie.id) }),
			})
			if (!response.ok) throw new Error('Recommendation request failed.')
			const data = await response.json()
			setRecommendations(data.results)
		} catch {
			setRecommendations(filterLocalMovies({ activeGenre: preferences.genres[0] || 'All', activeMood: preferences.moods[0] || '', sort: 'top' }).slice(0, 4))
		}
	}

	async function createWatchParty(event) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		const movie = wishlist.find((item) => String(item.id) === form.get('movieId')) || selected
		if (!movie) return
		const payload = {
			movieId: movie.id,
			title: movie.title,
			date: form.get('date'),
			time: form.get('time'),
			guests: form.get('guests'),
		}
		try {
			const response = await fetch(`${API_URL}/watch-parties`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})
			const party = await response.json()
			setWatchParties((current) => [party, ...current])
			event.currentTarget.reset()
		} catch {
			setWatchParties((current) => [{ ...payload, id: Date.now(), guests: String(payload.guests).split(',').map((guest) => guest.trim()).filter(Boolean) }, ...current])
		}
	}

	return <div className="app-shell">
		<header className="topbar">
			<button className="brand" onClick={() => { setView('discover'); setSelected(null) }}><span className="brand-mark">C</span> cinepick</button>
			<nav>
				<button className={view === 'discover' ? 'nav-link active' : 'nav-link'} onClick={() => { setView('discover'); setSelected(null) }}>Discover</button>
				<button className={view === 'wishlist' ? 'nav-link active' : 'nav-link'} onClick={() => { setView('wishlist'); setSelected(null) }}>My list <span className="count">{wishlist.length}</span></button>
				<button className={view === 'planner' ? 'nav-link active' : 'nav-link'} onClick={() => { setView('planner'); setSelected(null) }}>Planner</button>
			</nav>
			<button className="surprise-button" onClick={surpriseMe}>Surprise me</button>
		</header>

		{selected ? <MovieDetail movie={selected} isSaved={wishlist.some((item) => item.id === selected.id)} userRating={ratings[selected.id] || 0} note={notes[selected.id] || ''} onBack={() => setSelected(null)} onToggle={() => toggleWishlist(selected)} onRate={(rating) => setRatings((current) => ({ ...current, [selected.id]: rating }))} onNote={(note) => setNotes((current) => ({ ...current, [selected.id]: note }))} /> : <main>
			<section className="hero" style={{ '--hero-backdrop': `url(${heroMovie.backdrop || heroMovie.poster})` }}>
				<div className="hero-copy">
					<p className="eyebrow">Your next favorite story</p>
					<h1>Find something worth watching.</h1>
					<p className="hero-text">Build a watchlist, plan movie nights, rate favorites, and get mood-based picks without a database.</p>
					<div className="search-wrap"><span>Search</span><input value={query} onChange={(event) => { setPage(1); setQuery(event.target.value) }} placeholder="Movie, genre, mood, director..." /></div>
				</div>
				<div className="hero-panel">
					<p className="panel-kicker">Tonight's lead</p>
					<h2>{heroMovie.title}</h2>
					<p>{heroMovie.year} / {heroMovie.runtime || 120} min / {heroMovie.rating}</p>
					<button onClick={() => openMovie(heroMovie)}>Open</button>
				</div>
			</section>

			<section className="dashboard">
				{collectionStats.map((item) => <div className="metric" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}
				{stats && <div className="metric accent"><span>Top genre</span><strong>{stats.topGenre}</strong></div>}
			</section>

			{view === 'planner' ? <Planner wishlist={wishlist} watchParties={watchParties} recommendations={recommendations} genres={genres.filter((genre) => genre !== 'All')} moods={moods} onRecommend={getRecommendations} onOpen={openMovie} onCreate={createWatchParty} /> : <section className="content">
				<div className="section-heading">
					<div><p className="eyebrow">Browse the collection</p><h2>{view === 'wishlist' ? 'Saved for later' : 'Curated for you'}</h2></div>
					<div className="sort-control"><label htmlFor="sort">Sort</label><select id="sort" value={sort} onChange={(event) => { setPage(1); setSort(event.target.value) }}><option value="trending">Trending</option><option value="top">Highest rated</option><option value="newest">Newest</option><option value="runtime">Shortest</option></select></div>
				</div>
					{view === 'discover' && <><div className="chips">{genres.map((genre) => <button key={genre} className={activeGenre === genre ? 'chip selected' : 'chip'} onClick={() => { setPage(1); setActiveGenre(genre) }}>{genre}</button>)}</div><div className="chips compact">{moods.map((mood) => <button key={mood} className={activeMood === mood ? 'chip selected mood-chip' : 'chip mood-chip'} onClick={() => { setPage(1); setActiveMood(activeMood === mood ? '' : mood) }}>{mood}</button>)}</div></>}
				{error && <p className="notice">{error}</p>}
				{history.length > 0 && view === 'discover' && <Rail title="Recently opened" movies={history} onOpen={openMovie} />}
				{loading ? <div className="loading-grid">{[1, 2, 3, 4].map((item) => <div className="skeleton" key={item}></div>)}</div> : visibleMovies.length ? <><div className="movie-grid">{visibleMovies.map((movie) => <MovieCard key={movie.id} movie={movie} saved={wishlist.some((item) => item.id === movie.id)} userRating={ratings[movie.id]} onOpen={() => openMovie(movie)} onToggle={() => toggleWishlist(movie)} />)}</div>{view === 'discover' && page < totalPages && <button className="load-more" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Loading more...' : 'Load more films'}</button>}</> : <div className="empty"><span>0</span><h3>Your list is waiting</h3><p>Save movies you want to come back to and they will appear here.</p></div>}
			</section>}
		</main>}
		<footer><span>cinepick</span><span>Memory-only backend</span><span>No database used</span></footer>
	</div>
}

function filterLocalMovies({ query = '', activeGenre = 'All', activeMood = '', sort = 'trending' }) {
	const search = query.toLowerCase().trim()
	return fallbackMovies.filter((movie) => {
		const matchesSearch = !search || [movie.title, movie.overview, movie.director, ...movie.genres, ...movie.moods].join(' ').toLowerCase().includes(search)
		const matchesGenre = activeGenre === 'All' || movie.genres.includes(activeGenre)
		const matchesMood = !activeMood || movie.moods.includes(activeMood)
		return matchesSearch && matchesGenre && matchesMood
	}).sort((a, b) => {
		if (sort === 'top') return b.rating - a.rating
		if (sort === 'newest') return b.year - a.year
		if (sort === 'runtime') return a.runtime - b.runtime
		return b.id - a.id
	})
}

function makeLocalStats(movies) {
	const genreCounts = movies.reduce((counts, movie) => {
		movie.genres.forEach((genre) => counts[genre] = (counts[genre] || 0) + 1)
		return counts
	}, {})
	return { topGenre: Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Drama' }
}

function Rail({ title, movies, onOpen }) {
	return <div className="rail"><h3>{title}</h3><div>{movies.map((movie) => <button key={movie.id} onClick={() => onOpen(movie)}>{movie.title}</button>)}</div></div>
}

function MovieCard({ movie, saved, userRating, onOpen, onToggle }) {
	return <article className="movie-card">
		<button className="poster-button" onClick={onOpen}><img src={movie.poster} alt={movie.title} /><span className="card-rating">Star {movie.rating}</span></button>
		<button className={saved ? 'save-button saved' : 'save-button'} onClick={onToggle} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}>{saved ? 'Saved' : 'Save'}</button>
		<div className="movie-info"><h3>{movie.title}</h3><p>{movie.year} <span>/</span> {movie.genres?.slice(0, 2).join(' / ')}</p>{userRating && <small>Your rating: {userRating}/5</small>}</div>
	</article>
}

function MovieDetail({ movie, isSaved, userRating, note, onBack, onToggle, onRate, onNote }) {
	return <main className="detail-page">
		<button className="back-button" onClick={onBack}>Back to discovery</button>
		<section className="detail-hero" style={{ '--backdrop': `url(${movie.backdrop || movie.poster})` }}>
			<div className="detail-poster"><img src={movie.poster} alt={movie.title} /></div>
			<div className="detail-copy">
				<p className="eyebrow">Featured film</p>
				<h1>{movie.title}</h1>
				<p className="detail-meta">{movie.year} <span>/</span> {movie.runtime ? `${movie.runtime} min` : 'Feature film'} <span>/</span> {movie.maturity || 'PG-13'} <span>/</span> Star {movie.rating}</p>
				<p className="detail-overview">{movie.overview}</p>
				<div className="credit-list"><span>Director: {movie.director || 'TBA'}</span><span>Cast: {movie.cast?.slice(0, 3).join(', ') || 'TBA'}</span></div>
				<div className="detail-actions"><button className={isSaved ? 'primary-action saved-action' : 'primary-action'} onClick={onToggle}>{isSaved ? 'Saved to my list' : 'Add to my list'}</button><div className="rating-picker">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} className={userRating >= rating ? 'rated' : ''} onClick={() => onRate(rating)}>{rating}</button>)}</div></div>
				<textarea className="note-box" value={note} onChange={(event) => onNote(event.target.value)} placeholder="Private note for this movie..." />
			</div>
		</section>
	</main>
}

function Planner({ wishlist, watchParties, recommendations, genres, moods, onRecommend, onOpen, onCreate }) {
	const [pickedGenres, setPickedGenres] = useState([])
	const [pickedMoods, setPickedMoods] = useState([])
	const [maxRuntime, setMaxRuntime] = useState(130)

	function toggle(value, setter) {
		setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
	}

	return <section className="planner">
		<div className="planner-grid">
			<form className="planner-card" onSubmit={onCreate}>
				<h2>Watch party</h2>
				<select name="movieId" required><option value="">Choose movie</option>{wishlist.map((movie) => <option key={movie.id} value={movie.id}>{movie.title}</option>)}</select>
				<div className="form-row"><input type="date" name="date" required /><input type="time" name="time" required /></div>
				<input name="guests" placeholder="Guests, comma separated" />
				<button type="submit">Schedule</button>
			</form>
			<div className="planner-card">
				<h2>Mood matcher</h2>
				<div className="chips compact">{genres.slice(0, 8).map((genre) => <button key={genre} className={pickedGenres.includes(genre) ? 'chip selected' : 'chip'} onClick={() => toggle(genre, setPickedGenres)}>{genre}</button>)}</div>
				<div className="chips compact">{moods.slice(0, 8).map((mood) => <button key={mood} className={pickedMoods.includes(mood) ? 'chip selected mood-chip' : 'chip mood-chip'} onClick={() => toggle(mood, setPickedMoods)}>{mood}</button>)}</div>
				<label className="runtime-range">Runtime under {maxRuntime} min<input type="range" min="90" max="180" value={maxRuntime} onChange={(event) => setMaxRuntime(event.target.value)} /></label>
				<button onClick={() => onRecommend({ genres: pickedGenres, moods: pickedMoods, maxRuntime })}>Find matches</button>
			</div>
		</div>
		<div className="planner-results">
			<div><h3>Upcoming</h3>{watchParties.length ? watchParties.map((party) => <article className="party" key={party.id}><strong>{party.title}</strong><span>{party.date} at {party.time}</span><small>{party.guests?.join(', ') || 'Solo watch'}</small></article>) : <p>No parties scheduled yet.</p>}</div>
			<div><h3>Recommended</h3>{recommendations.length ? recommendations.map((movie) => <button className="recommendation" key={movie.id} onClick={() => onOpen(movie)}><img src={movie.poster} alt="" /><span>{movie.title}</span><small>Match {Math.round(movie.matchScore || movie.rating)}/10</small></button>) : <p>Pick a mood to generate matches.</p>}</div>
		</div>
	</section>
}

export default App
