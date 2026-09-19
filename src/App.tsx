import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/layout/Toast';
import { KanbanView } from './components/views/KanbanView';
import { TimelineView } from './components/views/TimelineView';
import { CalendarView } from './components/views/CalendarView';
import { ListView } from './components/views/ListView';
import { ProjectManagementView } from './components/projects/ProjectManagementView';
import { RiskAnalysisDashboard } from './components/ai/RiskAnalysisDashboard';
import { ResourceAllocationView } from './components/ai/ResourceAllocationView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';
import { TaskModal } from './components/tasks/TaskModal';
import { CreateTaskModal } from './components/tasks/CreateTaskModal';
import { AITaskBreakdownModal } from './components/ai/AITaskBreakdownModal';
import { StatusSummarizerModal } from './components/ai/StatusSummarizerModal';
import { ProjectCopilotDrawer } from './components/ai/ProjectCopilotDrawer';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';

const MainContent: React.FC = () => {
  const { activeView } = useProject();

  const renderActiveView = () => {
    switch (activeView) {
      case 'kanban':
        return <KanbanView />;
      case 'timeline':
        return <TimelineView />;
      case 'calendar':
        return <CalendarView />;
      case 'list':
        return <ListView />;
      case 'project_management':
        return <ProjectManagementView />;
      case 'risk_dashboard':
        return <RiskAnalysisDashboard />;
      case 'resource_allocation':
        return <ResourceAllocationView />;
      case 'admin_settings':
        return <AdminSettingsView />;
      default:
        return <KanbanView />;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative" style={{ touchAction: 'pan-y' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-auto bg-canvas-light dark:bg-canvas transition-colors" style={{ 
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y'
      }}>
        {renderActiveView()}
      </main>
      <ProjectCopilotDrawer />
    </div>
  );
};

const AppCore: React.FC = () => {
  const { isAuthenticated, isChangePasswordModalOpen, setIsChangePasswordModalOpen } = useProject();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-canvas-light text-slate-900 dark:bg-canvas dark:text-readable overflow-auto transition-colors" style={{ 
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain'
    }}>
      <Navbar />
      <MainContent />
      <TaskModal />
      <CreateTaskModal />
      <AITaskBreakdownModal />
      <StatusSummarizerModal />
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <AppCore />
      </ProjectProvider>
    </ThemeProvider>
  );
}

export default App;
