import Dashboard from '../components/Dashboard';

export const metadata = {
  title: 'Rainy Byte — AI Climate Intelligence Platform',
  description: 'Aggregates global weather datasets, calculates Köppen-Geiger classifications, and models local weather anomalies using Cognitive AI.',
};

export default function Home() {
  return <Dashboard />;
}
