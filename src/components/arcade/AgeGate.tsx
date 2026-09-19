import { useState, type FormEvent } from 'react';
import type { Game } from '../../types/game';
import { ageFromDob } from '../../lib/ageGate';
import './AgeGate.css';

interface AgeGateProps {
  game: Game;
  minAge: number;
  onVerified: () => void;
}

type GateView = 'form' | 'denied';

export function AgeGate({ game, minAge, onVerified }: AgeGateProps) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<GateView>('form');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const m = Number.parseInt(month, 10);
    const d = Number.parseInt(day, 10);
    const y = Number.parseInt(year, 10);
    const age = ageFromDob(m, d, y);

    if (age === null) {
      setError('Enter a valid date of birth.');
      return;
    }

    if (age < minAge) {
      setError(null);
      setView('denied');
      return;
    }

    onVerified();
  };

  return (
    <div
      className="age-gate"
      style={{ ['--gate-accent' as string]: game.accentColor }}
      role="region"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-copy"
    >
      {game.coverImage ? (
        <img src={game.coverImage} alt="" className="age-gate__backdrop" aria-hidden="true" />
      ) : null}
      <div className="age-gate__scrim" aria-hidden="true" />

      <div className="age-gate__panel">
        <p className="age-gate__eyebrow pixel-text">Content rating</p>
        <h2 id="age-gate-title" className="age-gate__title pixel-text">
          {game.title}
        </h2>

        {view === 'denied' ? (
          <div className="age-gate__denied">
            <p id="age-gate-copy" className="age-gate__copy">
              This title is not available for players under {minAge}. Please return to the
              arcade and choose another cabinet.
            </p>
            <button
              type="button"
              className="age-gate__submit"
              onClick={() => {
                setView('form');
                setError(null);
              }}
            >
              Re-enter birthdate
            </button>
          </div>
        ) : (
          <form className="age-gate__form" onSubmit={handleSubmit} noValidate>
            <p id="age-gate-copy" className="age-gate__copy">
              You must be {minAge} or older to play. Enter your date of birth to continue.
            </p>

            <fieldset className="age-gate__fields">
              <legend className="age-gate__legend pixel-text">Enter your birthdate</legend>
              <label className="age-gate__field">
                <span className="pixel-text">MM</span>
                <input
                  className="age-gate__input"
                  inputMode="numeric"
                  autoComplete="bday-month"
                  maxLength={2}
                  placeholder="MM"
                  value={month}
                  onChange={(e) => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  aria-label="Birth month"
                />
              </label>
              <span className="age-gate__slash" aria-hidden="true">
                /
              </span>
              <label className="age-gate__field">
                <span className="pixel-text">DD</span>
                <input
                  className="age-gate__input"
                  inputMode="numeric"
                  autoComplete="bday-day"
                  maxLength={2}
                  placeholder="DD"
                  value={day}
                  onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  aria-label="Birth day"
                />
              </label>
              <span className="age-gate__slash" aria-hidden="true">
                /
              </span>
              <label className="age-gate__field age-gate__field--year">
                <span className="pixel-text">YYYY</span>
                <input
                  className="age-gate__input"
                  inputMode="numeric"
                  autoComplete="bday-year"
                  maxLength={4}
                  placeholder="YYYY"
                  value={year}
                  onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  aria-label="Birth year"
                />
              </label>
            </fieldset>

            {error ? (
              <p className="age-gate__error" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="age-gate__submit">
              Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
