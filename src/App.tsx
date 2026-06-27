import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Discover from '@/pages/Discover';
import Dashboard from '@/pages/Dashboard';
import Agents from '@/pages/Agents';
import Resources from '@/pages/Resources';
import LearningPath from '@/pages/LearningPath';
import Knowledge from '@/pages/Knowledge';
import Tutor from '@/pages/Tutor';
import Report from '@/pages/Report';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Discover />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/path" element={<LearningPath />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/report" element={<Report />} />
        </Route>
      </Routes>
    </Router>
  );
}
