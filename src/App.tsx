import { useDataStore } from './stores/useDataStore';
import { ImportScreen } from './components/ImportScreen';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { SessionsEditor } from './components/SessionsEditor';
import { HistoryEditor } from './components/HistoryEditor';
import { BodyMeasurementsEditor } from './components/BodyMeasurementsEditor';
import { ExercisesEditor } from './components/ExercisesEditor';

function App() {
  const { data } = useDataStore();

  if (!data) {
    return <ImportScreen />;
  }

  return (
    <Layout>
      {(activeTab) => {
        switch (activeTab) {
          case 'dashboard':
            return <DashboardView />;
          case 'exercises':
            return <ExercisesEditor />;
          case 'sessions':
            return <SessionsEditor />;
          case 'history':
            return <HistoryEditor />;
          case 'body':
            return <BodyMeasurementsEditor />;
          default:
            return <DashboardView />;
        }
      }}
    </Layout>
  );
}

export default App;
