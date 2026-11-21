import { useCallback, useEffect, useRef, useState } from 'react';
import { listMovies, updateMovie, getRewatchOrder } from '../api/movies';
import { describeError } from '../api/client';

// 205 -> "3h 25m", 120 -> "2h", 45 -> "45 min", 0 -> "0 min"
function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// The newest movie is the most likely "next one I'm preparing for"
function pickDefaultTarget(movies) {
  return movies.reduce(
    (best, movie) =>
      !best || movie.releaseYear > best.releaseYear || (movie.releaseYear === best.releaseYear && movie.id > best.id)
        ? movie
        : best,
    null
  );
}

export default function RewatchView() {
  const [movies, setMovies] = useState([]);
  const [targetId, setTargetId] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Numbers each plan request so a slow, older response can't overwrite a newer one
  const latestRequest = useRef(0);

  const loadPlan = useCallback(async (id) => {
    const requestNumber = ++latestRequest.current;
    try {
      const result = await getRewatchOrder(id);
      if (requestNumber !== latestRequest.current) return;
      setPlan(result);
      setError('');
    } catch (err) {
      if (requestNumber !== latestRequest.current) return;
      setError(describeError(err));
    }
  }, []);

  // Load the movie list once, and start with the newest movie selected
  useEffect(() => {
    let cancelled = false;
    async function loadMovies() {
      try {
        const all = await listMovies();
        if (cancelled) return;
        setMovies(all);
        const target = pickDefaultTarget(all);
        if (target) setTargetId(target.id);
      } catch (err) {
        if (!cancelled) setError(describeError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMovies();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load the plan whenever the chosen movie changes
  useEffect(() => {
    if (targetId !== null) loadPlan(targetId);
  }, [targetId, loadPlan]);

  function handleChangeTarget(event) {
    setPlan(null); // don't show the old plan under the new title
    setTargetId(Number(event.target.value));
  }

  async function handleToggleWatched(movie) {
    setBusyId(movie.id);
    try {
      await updateMovie(movie.id, { watched: !movie.watched });
      await loadPlan(targetId);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="muted">Loading...</p>;

  if (movies.length === 0) {
    return (
      <div>
        {error && <p className="error">{error}</p>}
        <section className="card">
          <p className="muted">Add some movies on the Movies tab to build a rewatch plan.</p>
        </section>
      </div>
    );
  }

  const percent =
    plan && plan.totalCount > 0 ? Math.round((plan.watchedCount / plan.totalCount) * 100) : 100;
  const allDone = plan && plan.watchedCount === plan.totalCount;

  return (
    <div>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <label className="field">
          I want to get ready for
                    <select className="select-custom" value={targetId ?? ''} onChange={handleChangeTarget}>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title} ({movie.releaseYear})
              </option>
            ))}
          </select>
        </label>
      </section>

      {plan && (
        <section className="card">
          <h2>Rewatch plan for {plan.target.title}</h2>

          {plan.totalCount === 0 ? (
            <p className="muted">
              {plan.target.title} has no prerequisites, so you're ready to watch it now.
            </p>
          ) : (
            <>
              <div className="progress-summary">
                <strong>
                  {plan.watchedCount} of {plan.totalCount} watched
                </strong>
                <span className="muted">
                  {allDone
                    ? 'All caught up!'
                    : `${formatDuration(plan.remainingRuntimeMinutes)} left to watch`}
                </span>
              </div>
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={plan.totalCount}
                aria-valuenow={plan.watchedCount}
                aria-label={`${plan.watchedCount} of ${plan.totalCount} watched`}
              >
                <div className="progress-fill" style={{ width: `${percent}%` }} />
              </div>

              <ol className="rewatch-list">
                {plan.order.map((movie, index) => (
                  <li key={movie.id} className="rewatch-item">
                    <span className="rewatch-step">{index + 1}</span>
                    <input
                      type="checkbox"
                      checked={movie.watched}
                      disabled={busyId === movie.id}
                      onChange={() => handleToggleWatched(movie)}
                      aria-label={`Mark ${movie.title} as watched`}
                    />
                    <span className={movie.watched ? 'movie-title watched' : 'movie-title'}>
                      {movie.title}
                    </span>
                    <span className="movie-meta">{formatDuration(movie.runtimeMinutes)}</span>
                  </li>
                ))}
              </ol>
            </>
          )}

          <p className="rewatch-target">
            {plan.totalCount > 0 ? 'Then: ' : ''}
            <strong>{plan.target.title}</strong>
          </p>
        </section>
      )}
    </div>
  );
}
