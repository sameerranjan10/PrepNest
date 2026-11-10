import React from 'react';

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 border-b border-[#E5E7EB] ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all duration-150 cursor-pointer ${
              isActive
                ? 'border-[#FFA116] text-[#FFA116] font-semibold'
                : 'border-transparent text-[#64748B] hover:text-[#262626] hover:border-[#CBD5E1]'
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFA116]' : 'text-[#64748B]'}`} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-[#FFF8EE] text-[#FFA116] font-bold'
                    : 'bg-[#F1F3F5] text-[#64748B]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function PillTabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`inline-flex items-center p-1 bg-[#F1F3F5] rounded-lg gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-white text-[#262626] shadow-sm'
                : 'text-[#64748B] hover:text-[#262626]'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#F1F3F5] text-[#262626]' : 'text-[#64748B]'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

