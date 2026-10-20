
export const MONTHS_NOMINATIVE = [
    "Январь", "Февраль", "Март", "Апрель",
    "Май", "Июнь", "Июль", "Август",
    "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  
  export const MONTHS_GENITIVE = [
    "января", "февраля", "марта", "апреля",
    "мая", "июня", "июля", "августа",
    "сентября", "октября", "ноября", "декабря"
  ];
  
  export const DAYS_OF_WEEK = [
    "Воскресенье", "Понедельник", "Вторник",
    "Среда", "Четверг", "Пятница", "Суббота"
  ];
  
  export const SERVICE_DURATION = 90;
  
  export const DEFAULT_SLOTS = [
    { time: "09:00", busy: false },
    { time: "10:30", busy: true },
    { time: "12:00", busy: false },
    { time: "13:30", busy: true },
    { time: "15:00", busy: false },
    { time: "16:30", busy: false },
    { time: "18:00", busy: false },
    { time: "19:30", busy: false }
  ];
  
  export function compareDates(date1, date2) {
    const first = new Date(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate()
    );
  
    const second = new Date(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate()
    );
  
    if (first < second) return -1;
    if (first > second) return 1;
    return 0;
  }
  
  export function isDateSelectable(day, month, year, currentDate) {
    const date = new Date(year, month, day);
    return compareDates(date, currentDate) >= 0;
  }
  
  export function buildCalendarGrid(year, month) {
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
  
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
  
    const cells = [];
  
    for (let i = offset - 1; i >= 0; i--) {
      cells.push({
        day: daysInPreviousMonth - i,
        currentMonth: false
      });
    }
  
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, currentMonth: true });
    }
  
    let nextDay = 1;
  
    while (cells.length % 7 !== 0) {
      cells.push({
        day: nextDay++,
        currentMonth: false
      });
    }
  
    const weeks = [];
  
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
  
    return weeks;
  }
  
  export function formatSelectedDate(year, month, day) {
    const date = new Date(year, month, day);
    const weekday = DAYS_OF_WEEK[date.getDay()];
  
    return `${weekday}, ${day} ${MONTHS_GENITIVE[month]} ${year}`;
  }
  
  export function calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
  
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
  
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  }
  
  export function getSlotsForDate(year, month, day) {
    const date = new Date(year, month, day);
    const weekday = date.getDay();
  
    return DEFAULT_SLOTS.map((slot, index) => {
      if (weekday === 0) {
        return {
          ...slot,
          busy: index === 1 || index === 4
        };
      }
  
      return {
        ...slot,
        busy: (day + index) % 5 === 0
      };
    });
  }
  