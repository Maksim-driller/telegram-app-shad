import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Plan from './pages/Plan';
import Diary from './pages/Diary';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
