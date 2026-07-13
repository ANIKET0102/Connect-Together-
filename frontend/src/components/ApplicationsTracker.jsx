import React from 'react';
import { Plus, Search, Filter, Calendar, ExternalLink, Trash2 } from 'lucide-react';

function ApplicationsTracker({
  applications,
  filteredApps,
  appSearch,
  setAppSearch,
  appFilter,
  setAppFilter,
  newAppUrl,
  setNewAppUrl,
  newAppTips,
  setNewAppTips,
  newAppStatus,
  setNewAppStatus,
  handleAddApplication,
  handleUpdateStatus,
  handleUpdateTips,
  handleDeleteApplication
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Add Application Form */}
      <div className="premium-card p-6 relative bg-white border border-[#e2eae7]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-orange/15 to-transparent" />
        <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5 mb-4">
          <Plus size={16} className="text-brand-orange" /> Log New Application Entry
        </h3>
        <form onSubmit={handleAddApplication} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">Application URL</label>
            <input
              type="text"
              placeholder="e.g. google.com/jobs"
              value={newAppUrl}
              onChange={(e) => setNewAppUrl(e.target.value)}
              className="premium-input w-full px-3 py-2 text-xs focus:border-brand-orange/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">Status</label>
            <select
              value={newAppStatus}
              onChange={(e) => setNewAppStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#c9d5d1] rounded-xl text-xs text-[#2d4a43] focus:outline-none cursor-pointer"
            >
              <option value="ongoing">Ongoing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-3">
            <label className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">Tips / Key Notes</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Add key notes (resume tailor, contact point, dates)"
                value={newAppTips}
                onChange={(e) => setNewAppTips(e.target.value)}
                className="flex-1 premium-input px-3 py-2 text-xs focus:border-brand-orange/40"
              />
              <button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orange/95 text-white font-extrabold px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs shrink-0 shadow-lg shadow-brand-orange/10"
              >
                <Plus size={14} /> Save Application
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between premium-card p-4 bg-white border border-[#e2eae7]">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#6b7280]">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search applications or tips..."
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
            className="premium-input w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <Filter size={14} className="text-[#6b7280]" />
          <span className="text-xs text-[#6b7280] font-bold uppercase tracking-wider text-[10px]">Filter:</span>
          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#c9d5d1] rounded-xl text-xs text-[#2d4a43] focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Responsive Application entries list */}
      {/* 1. Desktop & Tablet View (HTML Table) */}
      <div className="hidden md:block premium-card overflow-hidden bg-white border border-[#e2eae7]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#e2eae7] text-[#6b7280] text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-16">Sr. No.</th>
                <th className="py-4 px-6 w-32">Date</th>
                <th className="py-4 px-6 min-w-[200px]">URL</th>
                <th className="py-4 px-6 w-44">Status</th>
                <th className="py-4 px-6 min-w-[220px]">Tips / Notes</th>
                <th className="py-4 px-6 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2eae7]">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 px-6 text-center text-[#6b7280] text-xs">
                    {applications.length === 0 ? 'No applications logged yet.' : 'No results matching search and filter.'}
                  </td>
                </tr>
              ) : (
                filteredApps.map((app, index) => {
                  const formattedDate = new Date(app.date).toLocaleDateString(undefined, { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  });

                  const actualUrl = app.url.startsWith('http') ? app.url : `https://${app.url}`;

                  return (
                    <tr key={app._id} className="hover:bg-slate-50 transition-all text-xs text-[#2d4a43]">
                      {/* Sr No */}
                      <td className="py-4 px-6 text-center font-bold text-[#6b7280]/60 font-mono">
                        {index + 1}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-[#6b7280] font-medium">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar size={12} className="text-[#6b7280]/80" />
                          {formattedDate}
                        </span>
                      </td>

                      {/* URL */}
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center gap-2 group max-w-xs md:max-w-sm">
                          <a 
                            href={actualUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0ea5e9] font-bold hover:underline truncate flex items-center gap-1 transition-all"
                          >
                            {app.url}
                            <ExternalLink size={11} className="shrink-0 opacity-60 group-hover:opacity-100" />
                          </a>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border cursor-pointer focus:outline-none transition-all uppercase tracking-wide ${
                            app.status === 'accepted' 
                              ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50' 
                              : app.status === 'rejected'
                                ? 'border-rose-500/30 text-rose-600 bg-rose-50'
                                : 'border-amber-500/30 text-amber-600 bg-amber-50'
                          }`}
                        >
                          <option value="ongoing" className="bg-white text-[#2d4a43]">Ongoing</option>
                          <option value="accepted" className="bg-white text-[#2d4a43]">Accepted</option>
                          <option value="rejected" className="bg-white text-[#2d4a43]">Rejected</option>
                        </select>
                      </td>

                      {/* Tips Textbox */}
                      <td className="py-4 px-6">
                        <input
                          type="text"
                          defaultValue={app.tips}
                          onBlur={(e) => {
                            if (e.target.value !== app.tips) {
                              handleUpdateTips(app._id, e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            }
                          }}
                          placeholder="Add custom notes..."
                          className="w-full px-3 py-1.5 bg-white border border-[#c9d5d1] focus:border-[#ca9428]/45 rounded-lg text-xs text-[#2d4a43] placeholder-[#6b7280]/40 focus:outline-none transition-all"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteApplication(app._id)}
                          className="text-[#6b7280] hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all cursor-pointer"
                          title="Delete Application Entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Mobile View (Card List) */}
      <div className="block md:hidden space-y-4">
        {filteredApps.length === 0 ? (
          <div className="premium-card p-8 text-center text-[#6b7280] text-xs bg-white border border-[#e2eae7]">
            {applications.length === 0 ? 'No applications logged yet.' : 'No results matching search and filter.'}
          </div>
        ) : (
          filteredApps.map((app, index) => {
            const formattedDate = new Date(app.date).toLocaleDateString(undefined, { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            });

            const actualUrl = app.url.startsWith('http') ? app.url : `https://${app.url}`;

            return (
              <div key={app._id} className="premium-card p-5 space-y-4 relative bg-white border border-[#e2eae7] shadow-sm">
                {/* Delete action top right */}
                <button
                  type="button"
                  onClick={() => handleDeleteApplication(app._id)}
                  className="absolute top-4 right-4 text-[#6b7280] hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  title="Delete Application Entry"
                >
                  <Trash2 size={14} />
                </button>

                {/* URL & Index */}
                <div>
                  <div className="flex items-center gap-1.5 text-[#6b7280] font-mono text-[10px] font-bold mb-1">
                    <span>#{index + 1} &bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formattedDate}
                    </span>
                  </div>
                  <a 
                    href={actualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0ea5e9] font-bold text-sm hover:underline flex items-center gap-1 break-all"
                  >
                    {app.url}
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                </div>

                {/* Status Selector */}
                <div className="grid grid-cols-2 gap-4 items-center border-t border-[#e2eae7] pt-3">
                  <span className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">Status:</span>
                  <select
                    value={app.status}
                    onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border cursor-pointer focus:outline-none transition-all uppercase tracking-wide w-full ${
                      app.status === 'accepted' 
                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50' 
                        : app.status === 'rejected'
                          ? 'border-rose-500/30 text-rose-600 bg-rose-50'
                          : 'border-amber-500/30 text-amber-600 bg-amber-50'
                    }`}
                  >
                    <option value="ongoing" className="bg-white text-[#2d4a43]">Ongoing</option>
                    <option value="accepted" className="bg-white text-[#2d4a43]">Accepted</option>
                    <option value="rejected" className="bg-white text-[#2d4a43]">Rejected</option>
                  </select>
                </div>

                {/* Tips / Notes textbox */}
                <div className="space-y-1.5 border-t border-[#e2eae7] pt-3">
                  <label className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider block">Notes & Tips:</label>
                  <input
                    type="text"
                    defaultValue={app.tips}
                    onBlur={(e) => {
                      if (e.target.value !== app.tips) {
                        handleUpdateTips(app._id, e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    placeholder="Add details, contact point..."
                    className="w-full px-3 py-2 bg-white border border-[#c9d5d1] focus:border-[#ca9428]/45 rounded-lg text-xs text-[#2d4a43] placeholder-[#6b7280]/40 focus:outline-none transition-all"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ApplicationsTracker;
