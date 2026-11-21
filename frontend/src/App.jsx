import { useState } from 'react';
import MoviesView from './components/MoviesView';
import RewatchView from './components/RewatchView';
import BookingView from './components/BookingView';


const views = [
  { id: 'movies', label: 'Movies', component: MoviesView },
  { id: 'rewatch', label: 'Rewatch Plan', component: RewatchView },
  { id: 'booking', label: 'Booking', component: BookingView },
];

export default function App() {
  const [activeId, setActiveId] = useState('movies');
  const active = views.find((view) => view.id === activeId);
  const ActiveView = active.component;

  return (
    <div className="app">
      <header className="app-header">
        <span className="badge">Avengers: Doomsday · Opening night</span>
        <h1>Doomsday Ready</h1>
        <p className="muted">Plan your MCU rewatch and book the opening-night watch party.</p>
      </header>

      <nav className="tabs">
        {views.map((view) => (
          <button
            key={view.id}
            className={view.id === activeId ? 'tab active' : 'tab'}
            onClick={() => setActiveId(view.id)}
          >
            {view.label}
          </button>
        ))}
      </nav>

      <ActiveView />
     <footer className="app-footer">
        Sample data for  processing not an official MCU watch guide.
      </footer>
    </div>
  );
}