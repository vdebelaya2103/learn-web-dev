
"use strict";

// ========================================
// 1. Названия месяцев и дней недели
// ========================================

const MONTHS_NOMINATIVE = [
  "Январь", "Февраль", "Март", "Апрель",
  "Май", "Июнь", "Июль", "Август",
  "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля",
  "мая", "июня", "июля", "августа",
  "сентября", "октября", "ноября", "декабря"
];

const DAYS_OF_WEEK = [
  "Воскресенье", "Понедельник", "Вторник",
  "Среда", "Четверг", "Пятница", "Суббота"
];

// ========================================
// 2. Исходные данные
// ========================================

// Текущая дата берётся с компьютера пользователя.
const today = new Date();
today.setHours(0, 0, 0, 0);

// Продолжительность выбранных услуг — 90 минут.
const SERVICE_DURATION = 90;

// Демонстрационные слоты записи.
const DEFAULT_SLOTS = [
  { time: "09:00", busy: false },
  { time: "10:30", busy: true },
  { time: "12:00", busy: false },
  { time: "13:30", busy: true },
  { time: "15:00", busy: false },
  { time: "16:30", busy: false },
  { time: "18:00", busy: false },
  { time: "19:30", busy: false }
];

// ========================================
// 3. Состояние страницы
// ========================================

const state = {
  currentMonth: today.getMonth(),
  currentYear: today.getFullYear(),
  selectedDay: today.getDate(),
  selectedTime: null,
  slots: [...DEFAULT_SLOTS]
};

// ========================================
// 4. Чистые функции для работы с датами
// ========================================

// Сравнивает даты без учёта времени.
// Возвращает -1, 0 или 1.
function compareDates(date1, date2) {
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

// Проверяет, доступна ли дата для записи.
function isDateSelectable(day, month, year, currentDate) {
  const date = new Date(year, month, day);

  return compareDates(date, currentDate) >= 0;
}

// Формирует сетку календаря на месяц.
// Неделя начинается с понедельника.
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);

  // Преобразуем JS-нумерацию:
  // воскресенье = 0 -> воскресенье = 6.
  const offset = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(
    year, month + 1, 0
  ).getDate();

  const daysInPreviousMonth = new Date(
    year, month, 0
  ).getDate();

  const cells = [];

  // Дни предыдущего месяца.
  for (let i = offset - 1; i >= 0; i--) {
    cells.push({
      day: daysInPreviousMonth - i,
      currentMonth: false
    });
  }

  // Дни текущего месяца.
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      currentMonth: true
    });
  }

  // Дни следующего месяца для заполнения недели.
  let nextDay = 1;

  while (cells.length % 7 !== 0) {
    cells.push({
      day: nextDay++,
      currentMonth: false
    });
  }

  // Разделяем ячейки на недели.
  const weeks = [];

  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

// Возвращает дату в формате:
// "Пятница, 9 октября 2026".
function formatSelectedDate(year, month, day) {
  const date = new Date(year, month, day);

  const weekday = DAYS_OF_WEEK[date.getDay()];

  return `${weekday}, ${day} ${MONTHS_GENITIVE[month]} ${year}`;
}

// Вычисляет время завершения услуги.
function calculateEndTime(startTime, duration) {
  const [hours, minutes] = startTime.split(":").map(Number);

  const totalMinutes = hours * 60 + minutes + duration;

  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}


/* ========================================
   5. Отрисовка календаря
======================================== */

function renderCalendar() {
    const monthTitle = document.querySelector("#calendar-month");
    const calendarContainer = document.querySelector("#calendar-days");
  
    // Показываем название текущего месяца.
    monthTitle.textContent =
      `${MONTHS_NOMINATIVE[state.currentMonth]} ${state.currentYear}`;
  
    // Получаем календарную сетку.
    const weeks = buildCalendarGrid(
      state.currentYear,
      state.currentMonth
    );
  
    // Формируем HTML календаря.
    let calendarHTML = "";
  
    weeks.forEach(week => {
      week.forEach(cell => {
        const { day, currentMonth } = cell;
  
        // Дни соседних месяцев отображаем приглушёнными.
        if (!currentMonth) {
          calendarHTML += `
            <span class="calendar-day day-muted">${day}</span>
          `;
          return;
        }
  
        const available = isDateSelectable(
          day,
          state.currentMonth,
          state.currentYear,
          today
        );
  
        // Определяем выбранный день.
        const selected = day === state.selectedDay;
  
        const classes = [
          "calendar-day",
          !available ? "day-muted" : "",
          selected ? "day-selected" : ""
        ].filter(Boolean).join(" ");
  
        if (!available) {
          calendarHTML += `
            <span class="${classes}">${day}</span>
          `;
        } else {
          calendarHTML += `
            <button
              class="${classes}"
              type="button"
              data-day="${day}"
              aria-pressed="${selected}"
            >
              ${day}
            </button>
          `;
        }
      });
    });
  
    // Заменяем старые ячейки новыми.
    calendarContainer.innerHTML = calendarHTML;
  
    // Назначаем обработчики новым кнопкам.
    calendarContainer
      .querySelectorAll("button[data-day]")
      .forEach(button => {
        button.addEventListener("click", onDayClick);
      });
  }
  
  /* ========================================
     6. Обработчик выбора дня
  ======================================== */
  
  
  function onDayClick(event) {
    const day = Number(event.currentTarget.dataset.day);
  
    state.selectedDay = day;
    state.selectedTime = null;
  
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
  }
  
  
  /* ========================================
     7. Переключение месяцев
  ======================================== */
  
  function setupMonthNavigation() {
    const previousButton = document.querySelector("#prev-month");
    const nextButton = document.querySelector("#next-month");
  
    previousButton.addEventListener("click", () => {
      // Не разрешаем переходить на месяцы раньше текущего.
      const isCurrentMonth =
        state.currentMonth === today.getMonth() &&
        state.currentYear === today.getFullYear();
  
      if (isCurrentMonth) return;
  
      changeMonth(-1);
    });
  
    nextButton.addEventListener("click", () => {
      changeMonth(1);
    });
  }
  
  function changeMonth(direction) {
    const newDate = new Date(
      state.currentYear,
      state.currentMonth + direction,
      1
    );
  
    state.currentYear = newDate.getFullYear();
    state.currentMonth = newDate.getMonth();
  
    // Выбираем первый доступный день месяца.
    const isCurrentMonth =
      state.currentMonth === today.getMonth() &&
      state.currentYear === today.getFullYear();
  
    state.selectedDay = isCurrentMonth
      ? today.getDate()
      : 1;
  
    state.selectedTime = null;
  
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
  }
  
  /* ========================================
     8. Временная инициализация календаря
  ======================================== */
  
  document.addEventListener("DOMContentLoaded", () => {
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
    setupMonthNavigation();
    setupNextButton();
  });

  
/* ========================================
   9. Получение временных слотов
======================================== */

// Демонстрационные данные.
// Для разных дней доступны разные часы.
function getSlotsForDate(year, month, day) {
    const date = new Date(year, month, day);
    const weekday = date.getDay();
  
    return DEFAULT_SLOTS.map((slot, index) => {
      // По воскресеньям другое расписание.
      if (weekday === 0) {
        return {
          ...slot,
          busy: index === 1 || index === 4
        };
      }
  
      // В остальные дни занятость зависит от даты.
      return {
        ...slot,
        busy: (day + index) % 5 === 0
      };
    });
  }
  
  /* ========================================
     10. Отрисовка временных слотов
  ======================================== */
  
  function renderTimeSlots() {
    const container = document.querySelector("#time-slots");
    const dateTitle = document.querySelector("#selected-date-title");
  
    const selectedDate = new Date(
      state.currentYear,
      state.currentMonth,
      state.selectedDay
    );
  
    dateTitle.textContent =
      `${DAYS_OF_WEEK[selectedDate.getDay()]}, ` +
      `${state.selectedDay} ${MONTHS_GENITIVE[state.currentMonth]}`;
  
    state.slots = getSlotsForDate(
      state.currentYear,
      state.currentMonth,
      state.selectedDay
    );
  
    let slotsHTML = "";
  
    state.slots.forEach(slot => {
      const selected = state.selectedTime === slot.time;
  
      if (slot.busy) {
        slotsHTML += `
          <button class="time-slot slot-busy"
                  type="button" disabled>
            ${slot.time}
            <span class="slot-status">Занято</span>
          </button>
        `;
      } else {
        slotsHTML += `
          <button class="time-slot ${selected ? "slot-selected" : ""}"
                  type="button"
                  data-time="${slot.time}"
                  aria-pressed="${selected}">
            ${slot.time}
          </button>
        `;
      }
    });
  
    container.innerHTML = slotsHTML;
  
    // После перерисовки добавляем обработчики.
    container.querySelectorAll("button[data-time]").forEach(button => {
      button.addEventListener("click", onTimeSlotClick);
    });
  }
  
  /* ========================================
     11. Обработчик выбора времени
  ======================================== */
  
  
function onTimeSlotClick(event) {
    state.selectedTime = event.currentTarget.dataset.time;
  
    renderTimeSlots();
    updateBottomBar();
  }
  
  
  
/* ========================================
   12. Обновление нижней панели записи
======================================== */

function updateBottomBar() {
    const summary = document.querySelector("#booking-summary-date");
    const nextButton = document.querySelector("#next-button");
  
    // Получаем выбранную дату.
    const dateText = formatSelectedDate(
      state.currentYear,
      state.currentMonth,
      state.selectedDay
    );
  
    if (state.selectedTime) {
      // Рассчитываем окончание записи.
      const endTime = calculateEndTime(
        state.selectedTime,
        SERVICE_DURATION
      );
  
      summary.textContent =
        `${dateText} · ${state.selectedTime}–${endTime}`;
  
      // Кнопка продолжения доступна.
      nextButton.classList.remove("next-disabled");
      nextButton.setAttribute("aria-disabled", "false");
  
    } else {
      // Если время ещё не выбрано.
      summary.textContent = `${dateText} · Время не выбрано`;
  
      // Кнопка продолжения недоступна.
      nextButton.classList.add("next-disabled");
      nextButton.setAttribute("aria-disabled", "true");
    }
  }
  
  
/* ========================================
   13. Кнопка продолжения
======================================== */

function setupNextButton() {
    const nextButton = document.querySelector("#next-button");
  
    nextButton.addEventListener("click", (event) => {
      // В следующую практику переходы пока не входят.
      event.preventDefault();
  
      if (!state.selectedTime) {
        return;
      }
  
      const dateText = formatSelectedDate(
        state.currentYear,
        state.currentMonth,
        state.selectedDay
      );
  
      alert(
        `Выбрана запись:\n${dateText}\n` +
        `Время: ${state.selectedTime}`
      );
    });
  }
  