import { useNavigate } from 'react-router-dom';
import { HomeSidePanelView } from '../components/home-side-panel-view';
import { useHomeUserQuery } from '../api/use-home-query';

const loadingUser = {
  displayName: '-',
  email: '-',
  subscriptionPlan: '-',
  credits: 0,
} as const;

export const HomeSidePanelWidget = () => {
  const navigate = useNavigate();
  const userQuery = useHomeUserQuery();

  if (userQuery.isError) {
    navigate('/login');
    return null;
  }

  return (
    <HomeSidePanelView
      user={userQuery.data ?? loadingUser}
      onLogout={() => {
        navigate('/login');
      }}
    />
  );
};
