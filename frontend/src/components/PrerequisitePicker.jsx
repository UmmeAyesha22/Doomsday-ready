// Shows a checkbox for every movie that can be a prerequisite
export default function PrerequisitePicker({ movies, selected, onChange, excludeId }) {
  const options = movies.filter((movie) => movie.id !== excludeId);

  if (options.length === 0) {
    return <p className="muted">No other movies yet.</p>;
  }

  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="picker">
      {options.map((movie) => (
        <label key={movie.id} className="picker-item">
          <input
            type="checkbox"
            checked={selected.includes(movie.id)}
            onChange={() => toggle(movie.id)}
          />
          {movie.title}
        </label>
      ))}
    </div>
  );
}