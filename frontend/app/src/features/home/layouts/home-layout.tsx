import { HomeHeader } from '@/features/home/components/home-header';
import { HomeProjectListWidget } from '@/features/home/widgets/home-project-list-widget';
import { HomeSidePanelWidget } from '@/features/home/widgets/home-side-panel-widget';

export const HomeLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <HomeHeader />

      <div className="flex min-h-0 flex-1">
        <HomeSidePanelWidget />

        <main className="min-h-0 min-w-0 flex-1 overflow-auto p-6 md:p-8">
          <HomeProjectListWidget />
        </main>
      </div>
    </div>
  );
};
