import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

/**
 * Calendar Component
 */
const Calendar = ({ tasks = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  // Map tasks to dates (YYYY-MM-DD). Only tasks with a due_date appear.
  const tasksByDate = {};
  tasks.forEach((t) => {
    if (t.due_date) {
      if (!tasksByDate[t.due_date]) {
        tasksByDate[t.due_date] = [];
      }
      tasksByDate[t.due_date].push(t);
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDateTasks = tasksByDate[selectedDateStr] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="todohub-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.125rem' }}>
            <CalendarIcon size={20} />
            <span>{monthNames[month]} {year}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="todohub-btn todohub-btn-sm" onClick={handleToday}>
              Today
            </button>
            <button className="todohub-btn todohub-btn-sm" onClick={handlePrevMonth} aria-label="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <button className="todohub-btn todohub-btn-sm" onClick={handleNextMonth} aria-label="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          {daysOfWeek.map((day) => (
            <div key={day} style={{ fontWeight: 600, padding: '0.5rem 0', color: 'var(--color-text-secondary)' }}>
              {day}
            </div>
          ))}

          {/* Blank cells for offset */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: '72px' }} />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
            const formattedDay = String(dayNum).padStart(2, '0');
            const formattedMonth = String(month + 1).padStart(2, '0');
            const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

            const dayTasks = tasksByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDateStr(dateStr)}
                style={{
                  minHeight: '72px',
                  padding: '0.375rem',
                  border: isSelected ? '2px solid var(--color-text)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isToday ? 'var(--color-surface-secondary)' : 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border 0.2s ease'
                }}
              >
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: isToday || isSelected ? 700 : 500,
                  color: isToday ? 'var(--color-text)' : 'var(--color-text-secondary)',
                  textDecoration: isToday ? 'underline' : 'none'
                }}>
                  {dayNum}
                </span>

                {dayTasks.map((t) => (
                  <Link
                    key={t.id}
                    to={`/tasks/${t.id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: '0.6875rem',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      backgroundColor: t.status === 'completed' ? 'var(--color-surface-secondary)' : 'var(--color-text)',
                      color: t.status === 'completed' ? 'var(--color-text-muted)' : 'var(--color-surface)',
                      width: '100%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                      display: 'block'
                    }}
                    title={`${t.title} (${t.status})`}
                  >
                    {t.title}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks Panel */}
      <div className="todohub-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
          Tasks for {selectedDateStr} {selectedDateStr === todayStr && '(Today)'}
        </h2>

        {selectedDateTasks.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            No tasks scheduled for this date.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedDateTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-secondary)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <Link
                    to={`/tasks/${task.id}`}
                    style={{
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      color: task.status === 'completed' ? 'var(--color-text-muted)' : 'var(--color-text)'
                    }}
                  >
                    {task.title}
                  </Link>
                  {task.due_time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      <Clock size={14} /> Due at {task.due_time}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                  <Link to={`/tasks/${task.id}`} className="todohub-btn todohub-btn-sm">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
