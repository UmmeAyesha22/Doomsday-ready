import { useEffect, useState } from 'react';
import { listMovies, createMovie, updateMovie } from '../api/movies';
import { describeError } from '../api/client';
import PrerequisitePicker from './PrerequisitePicker';

const emptyForm = { title: '', releaseYear: '', runtimeMinutes: '', prerequisites: [] };

export default function MoviesView() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editPrerequisites, setEditPrerequisites] = useState([]);

  async function refresh() {
    try {
      setMovies(await listMovies());
      setError('');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  // Load the movies once, when this screen appears
  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(event) {
    event.preventDefault();
    try {
      await createMovie({
        title: form.title,
        releaseYear: Number(form.releaseYear),
        runtimeMinutes: Number(form.runtimeMinutes),
        prerequisites: form.prerequisites,
      });
      setForm(emptyForm);
      await refresh();
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleToggleWatched(movie) {
    try {
      await updateMovie(movie.id, { watched: !movie.watched });
      await refresh();
    } catch (err) {
      setError(describeError(err));
    }
  }

  function startEditing(movie) {
    setEditingId(movie.id);
    setEditPrerequisites(movie.prerequisites);
    setError('');
  }

  async function saveEditing() {
    try {
      await updateMovie(editingId, { prerequisites: editPrerequisites });
      setEditingId(null);
      await refresh();
    } catch (err) {
      // For example a 409 CIRCULAR_DEPENDENCY: show it and keep the editor open
      setError(describeError(err));
    }
  }

  const titleOf = (id) => {
    const movie = movies.find((item) => item.id === id);
    return movie ? movie.title : `#${id}`;
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Add a movie</h2>
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <label className="field">
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label className="field">
              Release year
              <input
                required
                type="number"
                value={form.releaseYear}
                onChange={(e) => setForm({ ...form, releaseYear: e.target.value })}
              />
            </label>
            <label className="field">
              Runtime (minutes, 1-300)
              <input
                required
                type="number"
                value={form.runtimeMinutes}
                onChange={(e) => setForm({ ...form, runtimeMinutes: e.target.value })}
              />
            </label>
          </div>

          <p className="muted">Watch these first (optional):</p>
          <PrerequisitePicker
            movies={movies}
            selected={form.prerequisites}
            onChange={(ids) => setForm({ ...form, prerequisites: ids })}
          />

          <button className="btn" type="submit">Add movie</button>
        </form>
      </section>

      <section className="card">
        <h2>Movies ({movies.length})</h2>
        {loading && <p className="muted">Loading...</p>}
        {!loading && movies.length === 0 && <p className="muted">No movies yet.</p>}

        <ul className="movie-list">
          {movies.map((movie) => (
            <li key={movie.id} className="movie-item">
              <input
                type="checkbox"
                checked={movie.watched}
                onChange={() => handleToggleWatched(movie)}
                aria-label={`Mark ${movie.title} as watched`}
              />
              <div className="movie-main">
                <div className={movie.watched ? 'movie-title watched' : 'movie-title'}>
                  {movie.title}
                </div>
                <div className="movie-meta">
                  {movie.releaseYear} · {movie.runtimeMinutes} min
                  {movie.prerequisites.length > 0 &&
                    ` · Watch first: ${movie.prerequisites.map(titleOf).join(', ')}`}
                </div>

                {editingId === movie.id ? (
                  <div>
                    <PrerequisitePicker
                      movies={movies}
                      selected={editPrerequisites}
                      onChange={setEditPrerequisites}
                      excludeId={movie.id}
                    />
                    <div className="actions">
                      <button className="btn small" onClick={saveEditing}>Save</button>
                      <button
                        className="btn small secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="actions">
                    <button className="btn small secondary" onClick={() => startEditing(movie)}>
                      Edit prerequisites
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}