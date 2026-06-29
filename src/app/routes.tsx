import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { GamePage } from '../pages/GamePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/games/:slug" element={<GamePage />} />
    </Routes>
  );
}
