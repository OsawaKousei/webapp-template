import { useNavigate } from 'react-router-dom';
import { NewReportHeaderView } from '../components/new-report-header-view';
import { useNewReportStore } from '../stores/use-new-report-store';

export const NewReportHeaderWidget = () => {
  const navigate = useNavigate();
  const title = useNewReportStore((state) => state.title);
  const currentPhase = useNewReportStore((state) => state.currentPhase);
  const completedPhases = useNewReportStore((state) => state.completedPhases);
  const actions = useNewReportStore((state) => state.actions);

  const phaseCount = 4;

  return (
    <NewReportHeaderView
      title={title}
      currentPhase={currentPhase}
      completedPhases={completedPhases}
      phaseCount={phaseCount}
      onCancel={() => {
        actions.clear();
        navigate('/home');
      }}
    />
  );
};
