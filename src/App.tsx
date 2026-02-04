import { useDataStore } from './stores/useDataStore';
import { ImportScreen } from './components/ImportScreen';
import { Dashboard } from './components/Dashboard';

function App() {
  const { data } = useDataStore();

  if (!data) {
    return <ImportScreen />;
  }

  return <Dashboard />;
}

export default App;
