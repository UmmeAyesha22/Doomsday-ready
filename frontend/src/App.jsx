import { useState } from 'react';
import MoviesView from './components/MoviesView';
import RewatchView from './components/RewatchView';

const views = [
  { id: 'movies', label: 'Movies', component: MoviesView },
  { id: 'rewatch', label: 'Rewatch Plan', component: RewatchView },
];

export default function App() {
  const [activeId, setActiveId] = useState('movies');
  const active = views.find((view) => view.id === activeId);
  const ActiveView = active.component;

  return (
    <div className="app">
      <header className="app-header">
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
    </div>
  );
}