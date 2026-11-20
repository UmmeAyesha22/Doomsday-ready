import { useEffect, useState } from 'react';
import { listCinemas, createCinema, getBookingQuote } from '../api/cinemas';
import { describeError } from '../api/client';

// "2, 5" or "2 5" -> [2, 5]. Anything that isn't a number becomes NaN so the backend rejects it.
function parseSizes(text) {
  return text
    .split(/[\s,]+/)
    .filter((part) => part !== '')
    .map(Number);
}

export default function BookingView() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cinemaId, setCinemaId] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [quote, setQuote] = useState(null);

  const [newName, setNewName] = useState('');
  const [newSizes, setNewSizes] = useState('');

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

  // Load the cinemas once, when this screen appears
  useEffect(() => {
    refresh();
  }, []);

  async function handleAddCinema(event) {
    event.preventDefault();
    try {
      const created = await createCinema({ name: newName, bundleSizes: parseSizes(newSizes) });
      setNewName('');
      setNewSizes('');
      setQuote(null);
      await refresh(created.id);
    } catch (err) {
      setError(describeError(err));
    }
  }

  async function handleQuote(event) {
    event.preventDefault();
    try {
      setQuote(await getBookingQuote(cinemaId, groupSize));
      setError('');
    } catch (err) {
      setQuote(null);
      setError(describeError(err));
    }
  }

  const selected = cinemas.find((cinema) => String(cinema.id) === cinemaId);

  return (
    <div>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Book a watch party</h2>
        {loading && <p className="muted">Loading...</p>}
        {!loading && cinemas.length === 0 && (
          <p className="muted">No cinemas yet. Add one below.</p>
        )}

        {cinemas.length > 0 && (
          <form onSubmit={handleQuote}>
            <div className="form-row">
              <label className="field">
                Cinema
                <select
                  value={cinemaId}
                  onChange={(e) => {
                    setCinemaId(e.target.value);
                    setQuote(null);
                  }}
                >
                  {cinemas.map((cinema) => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name}
                    </option>
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
                  value={groupSize}
                  onChange={(e) => {
                    setGroupSize(e.target.value);
                    setQuote(null);
                  }}
                />
              </label>
            </div>
            {selected && (
              <p className="muted">Bundle sizes: {selected.bundleSizes.join(', ')} seats</p>
            )}
            <button className="btn" type="submit">Get quote</button>
          </form>
        )}

        {quote && quote.possible && (
          <div className="quote">
            <p>
              <strong>
                {quote.totalBundles} {quote.totalBundles === 1 ? 'bundle' : 'bundles'}
              </strong>{' '}
              for {quote.groupSize} seats at {quote.cinema.name}:
            </p>
            <ul className="quote-list">
              {quote.bundles.map((bundle) => (
                <li key={bundle.size}>
                  {bundle.size}-seat bundle × {bundle.count}
                </li>
              ))}
            </ul>
          </div>
        )}

        {quote && !quote.possible && (
          <p className="quote quote-none">
            <strong>Not possible.</strong> No combination of this cinema&apos;s bundles adds up to
            exactly {quote.groupSize} seats.
          </p>
        )}
      </section>

      <section className="card">
        <h2>Add a cinema</h2>
        <form onSubmit={handleAddCinema}>
          <div className="form-row">
            <label className="field">
              Name
              <input required value={newName} onChange={(e) => setNewName(e.target.value)} />
            </label>
            <label className="field">
              Bundle sizes (1-10 different sizes, 1-500 each)
              <input
                required
                placeholder="e.g. 2, 5"
                value={newSizes}
                onChange={(e) => setNewSizes(e.target.value)}
              />
            </label>
          </div>
          <button className="btn" type="submit">Add cinema</button>
        </form>
      </section>
    </div>
  );
}
