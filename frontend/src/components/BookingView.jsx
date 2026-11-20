import { useEffect, useState } from 'react';
import { listCinemas, getBookingQuote} from '../api/cinemas';
import { describeError } from '../api/client';


export default function BookingView() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cinemaId, setCinemaId] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);

  async function refresh(selectId) {
    try {
      const all = await listCinemas();
      setCinemas(all);
      if (selectId !== undefined) setCinemaId(String(selectId));
      else if (all.length > 0) setCinemaId((current) => current || String(all[0].id));
      setError('');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);



  async function handleQuote(event) {
    event.preventDefault();
    setQuoting(true);
    try {
      setQuote(await getBookingQuote(cinemaId, groupSize));
      setError('');
    } catch (err) {
      setQuote(null);
      setError(describeError(err));
    } finally {
      setQuoting(false);
    }
  }


  const selected = cinemas.find((c) => String(c.id) === cinemaId);

  return (
    <div>
      {error && <p className="error" role="alert">{error}</p>}

      <section className="card">
        <h2>Book a watch party</h2>
        {loading && <p className="muted">Loading...</p>}
        {!loading && cinemas.length === 0 && (
          <p className="muted">No cinemas yet. Add one below to get a booking quote.</p>
        )}

        {cinemas.length > 0 && (
          <form onSubmit={handleQuote}>
            <div className="form-row">
              <label className="field">
                Cinema
                <select
                  value={cinemaId}
                  onChange={(e) => { setCinemaId(e.target.value); setQuote(null); }}
                >
                  {cinemas.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Group size (1-10,000)
                <input
                  required
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  value={groupSize}
                  onChange={(e) => { setGroupSize(e.target.value); setQuote(null); }}
                />
              </label>
            </div>
            {selected && (
              <p className="chips-line">
                <span className="muted">Bundles sold:</span>
                {selected.bundleSizes.map((size) => (
                  <span key={size} className="chip">{size} seats</span>
                ))}
              </p>
            )}
            <button className="btn" type="submit" disabled={quoting}>
              {quoting ? 'Working it out...' : 'Get quote'}
            </button>
          </form>
        )}

        {quote && quote.possible && (
          <div className="quote" role="status">
            <p>
              <strong>
                {quote.totalBundles} {quote.totalBundles === 1 ? 'bundle' : 'bundles'}
              </strong>{' '}
              for {quote.groupSize} seats at {quote.cinema.name}:
            </p>
            <ul className="quote-list">
              {quote.bundles.map((b) => (
                <li key={b.size}>{b.size}-seat bundle × {b.count}</li>
              ))}
            </ul>
          </div>
        )}

        {quote && !quote.possible && (
          <p className="quote quote-none" role="status">
            <strong>Not possible.</strong> No combination of this cinema&apos;s bundles adds up to
            exactly {quote.groupSize} seats.
          </p>
        )}
      </section>

    

      {cinemas.length > 0 && (
        <section className="card">
          <h2>Cinemas ({cinemas.length})</h2>
          <ul className="cinema-list">
            {cinemas.map((c) => (
              <li key={c.id} className="cinema-item">
                <span className="movie-title">{c.name}</span>
                <span className="chips-line">
                  {c.bundleSizes.map((size) => (
                    <span key={size} className="chip">{size}</span>
                  ))}
                </span>

              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}