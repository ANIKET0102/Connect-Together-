import React from 'react';

// Helper to generate the 365 days ending today, aligned to Sundays
const getCalendarDays = () => {
  const days = [];
  const today = new Date();
  
  // Go back 365 days
  const startDate = new Date();
  startDate.setDate(today.getDate() - 364);
  
  // Align to Sunday
  const startDayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);
  
  const currentDate = new Date(startDate);
  
  // Generate days until the coming Saturday to complete the last column
  const targetEnd = new Date(today);
  const endDayOfWeek = targetEnd.getDay();
  targetEnd.setDate(targetEnd.getDate() + (6 - endDayOfWeek));
  
  while (currentDate <= targetEnd) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

function ActiveDaysHeatmap({ activityLogs, userId, username }) {
  const days = getCalendarDays();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="bg-white border border-[#e2eae7] rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h4 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
          Contribution Calendar: {username}
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-[#6b7280] select-none">
          <span>Less</span>
          <div className="w-[11px] h-[11px] rounded-[3px] bg-slate-100 border border-[#e2eae7]" />
          <div className="w-[11px] h-[11px] rounded-[3px] bg-[#ca9428]/20 border border-[#ca9428]/30" />
          <div className="w-[11px] h-[11px] rounded-[3px] bg-[#ca9428]/45" />
          <div className="w-[11px] h-[11px] rounded-[3px] bg-[#ca9428]/75" />
          <div className="w-[11px] h-[11px] rounded-[3px] bg-[#ca9428]" />
          <span>More</span>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-[4px] min-w-[620px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[4px] shrink-0">
              {week.map((day, dayIndex) => {
                const dateString = day.toISOString().split('T')[0];
                const log = activityLogs.find(
                  (l) => l.userId === userId && l.date === dateString
                );
                const count = log ? log.count : 0;

                let colorClass = 'bg-slate-100 border border-[#e2eae7]';
                if (count > 0 && count <= 2) colorClass = 'bg-[#ca9428]/20 border border-[#ca9428]/30';
                else if (count > 2 && count <= 4) colorClass = 'bg-[#ca9428]/45';
                else if (count > 4 && count <= 6) colorClass = 'bg-[#ca9428]/75';
                else if (count > 6) colorClass = 'bg-[#ca9428]';

                return (
                  <div
                    key={dayIndex}
                    className={`w-[11px] h-[11px] rounded-[3px] transition-all duration-200 hover:scale-125 cursor-help ${colorClass}`}
                    title={`${day.toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}: ${count} activities`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Month labels at bottom */}
        <div className="flex gap-[4px] min-w-[620px] text-[9px] text-[#6b7280] mt-2 select-none font-sans relative h-4">
          {weeks.map((week, index) => {
            const isFirstWeekOfMonth =
              index === 0 ||
              week[0].getMonth() !== weeks[index - 1][0].getMonth();
            return (
              <div key={index} className="w-[11px] shrink-0 relative">
                {isFirstWeekOfMonth && (
                  <span className="absolute left-0 top-0 whitespace-nowrap text-[#6b7280]/60">
                    {week[0].toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ActiveDaysHeatmap;
