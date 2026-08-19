import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import { Header } from './components/Header';
import { ComplaintForm } from './components/LeftPanel/ComplaintForm';
import { CopilotChat } from './components/RightPanel/CopilotChat';
import { AuditLogView } from './components/AuditLogView';

export const App: React.FC = () => {
  const { activeView } = useSelector((state: RootState) => state.complaint);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans">
      <Header />
      
      {activeView === 'intake' ? (
        /* Two-Panel Layout */
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* LEFT PANEL: Log Customer Complaint (60% / 7 cols) */}
          <section className="lg:col-span-7 h-full overflow-hidden border-r border-slate-200">
            <ComplaintForm />
          </section>

          {/* RIGHT PANEL: Assistant (40% / 5 cols) */}
          <section className="lg:col-span-5 h-full overflow-hidden">
            <CopilotChat />
          </section>
        </main>
      ) : (
        <main className="flex-1 overflow-hidden">
          <AuditLogView />
        </main>
      )}
    </div>
  );
};

export default App;
