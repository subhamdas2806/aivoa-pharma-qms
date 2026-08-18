import React from 'react';
import { Header } from './components/Header';
import { ComplaintForm } from './components/LeftPanel/ComplaintForm';
import { CopilotChat } from './components/RightPanel/CopilotChat';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      <Header />
      
      {/* Two-Panel Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANEL: Log Customer Complaint (60% / 7 cols) */}
        <section className="lg:col-span-7 h-full overflow-hidden border-r border-slate-200">
          <ComplaintForm />
        </section>

        {/* RIGHT PANEL: AIVOA Copilot (40% / 5 cols) */}
        <section className="lg:col-span-5 h-full overflow-hidden">
          <CopilotChat />
        </section>
      </main>
    </div>
  );
};

export default App;
