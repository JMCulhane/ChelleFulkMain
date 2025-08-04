import React, { useState } from "react";
import dayjs from "dayjs";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");

  const daysInMonth = currentDate.daysInMonth();
  const startDay = startOfMonth.day(); // 0 (Sunday) - 6 (Saturday)

  const today = dayjs();

  // Build array of all the calendar day cells
  const calendarDays = [];

  // Fill in blank days before the 1st
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`blank-${i}`} className="p-2" />);
  }

  // Fill in actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = currentDate.date(day);
    const isToday = today.isSame(date, "day");

    calendarDays.push(
      <div
        key={day}
        className={`
          p-2 h-20 w-full border rounded 
          ${isToday ? "bg-yellow-300 font-bold text-black" : "bg-white"} 
          hover:bg-yellow-100 transition
        `}
      >
        {day}
      </div>
    );
  }

  // Handlers for month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prev => prev.subtract(1, "month"));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => prev.add(1, "month"));
  };

  return (
    <div className="max-w-xl mx-auto p-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ‹
        </button>
        <h2 className="text-xl font-bold">
          {currentDate.format("MMMM YYYY")}
        </h2>
        <button
          onClick={goToNextMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ›
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center font-medium text-gray-700 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {calendarDays}
      </div>
    </div>
  );
}
