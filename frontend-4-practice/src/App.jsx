
import { useEffect, useState } from "react";
import "./index.css";

import { fetchToday, fetchSlots } from "./api";

import {
  MONTHS_NOMINATIVE,
  MONTHS_GENITIVE,
  DAYS_OF_WEEK,
  SERVICE_DURATION,
  buildCalendarGrid,
  isDateSelectable,
  formatSelectedDate,
  calculateEndTime,
} from "./utils/date";


const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function Header() {
  return (
    <header className="header">
      <div className="header-top">
        <a className="logo" href="#">NORTH</a>
        <nav className="navigation" aria-label="Навигация">
          {["Услуги", "Мастера", "Отзывы", "О нас", "Контакты"].map((item) => (
            <a className="nav-link" href="#" key={item}>{item}</a>
          ))}
        </nav>
      </div>

      <nav className="steps" aria-label="Этапы записи">
        {[
          ["✓", "Мастер", "step-done"],
          ["✓", "Услуги", "step-done"],
          ["3", "Дата и время", "step-current"],
          ["4", "Контакты", ""],
          ["5", "Подтверждение", ""],
        ].map(([number, label, status], index) => (
          <div className="step-wrapper" key={label} style={{ display: "contents" }}>
            {index > 0 && <span className="step-line" />}
            <div
              className={`step ${status}`}
              aria-current={index === 2 ? "step" : undefined}
            >
              <span className="step-number">{number}</span>
              <span className="step-label">{label}</span>
            </div>
          </div>
        ))}
      </nav>
    </header>
  );
}

function Calendar({
  year,
  month,
  selectedDay,
  onSelectDay,
  onChangeMonth,
  today,
}) {
  const weeks = buildCalendarGrid(year, month);
  const todayDate = new Date(today.year, today.month, today.day);

  const isCurrentMonth =
  year === today.year && month === today.month;

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <h2 className="calendar-title">
          {MONTHS_NOMINATIVE[month]} {year}
        </h2>

        <div className="calendar-controls">
          <button
            className="calendar-arrow"
            type="button"
            aria-label="Предыдущий месяц"
            disabled={isCurrentMonth}
            onClick={() => onChangeMonth(-1)}
          >
            ‹
          </button>
          <button
            className="calendar-arrow"
            type="button"
            aria-label="Следующий месяц"
            onClick={() => onChangeMonth(1)}
          >
            ›
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <span className="weekday" key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-days">
        {weeks.flat().map((cell, index) => {
          const { day, currentMonth } = cell;

          if (!currentMonth) {
            return (
              <span className="calendar-day day-muted" key={`${day}-${index}`}>
                {day}
              </span>
            );
          }

          const available = isDateSelectable(day, month, year, todayDate);
          const selected = day === selectedDay;

          const classes = [
            "calendar-day",
            !available ? "day-muted" : "",
            selected ? "day-selected" : "",
          ].filter(Boolean).join(" ");

          if (!available) {
            return <span className={classes} key={`${day}-${index}`}>{day}</span>;
          }

          return (
            <button
              className={classes}
              type="button"
              key={`${day}-${index}`}
              aria-pressed={selected}
              onClick={() => onSelectDay(day)}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span className="legend-dot" />
        <span className="legend-label">Доступно</span>
        <span className="legend-label">Бледные даты — нет записи</span>
      </div>
    </div>
  );
}


function TimeSlots({
  year,
  month,
  day,
  slots,
  loading,
  error,
  selectedTime,
  onSelectTime,
}) {
  const selectedDate = new Date(year, month, day);

  return (
    <div className="time-card">
      <div className="time-header">
        <h2 className="time-title">
          {DAYS_OF_WEEK[selectedDate.getDay()]}, {day} {MONTHS_GENITIVE[month]}
        </h2>

        <p className="time-description">
          Начало визита · длительность {SERVICE_DURATION} мин
        </p>
      </div>

      {loading ? (
        <p role="status">Загрузка слотов…</p>
      ) : error ? (
        <p role="alert">Ошибка загрузки слотов: {error}</p>
      ) : (
        <div className="time-slots">
          {slots.length === 0 ? (
            <p>На выбранную дату нет доступного расписания.</p>
          ) : (
            slots.map((slot) => {
              const selected = selectedTime === slot.time;

              return (
                <button
                  className={[
                    "time-slot",
                    !slot.available ? "slot-busy" : "",
                    selected ? "slot-selected" : "",
                  ].filter(Boolean).join(" ")}
                  type="button"
                  key={slot.time}
                  disabled={!slot.available}
                  aria-pressed={selected}
                  onClick={() => onSelectTime(slot.time)}
                >
                  {slot.time}
                  {!slot.available && (
                    <span className="slot-status">Занято</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      <p className="time-note">
        Все слоты учитывают длительность услуг — {SERVICE_DURATION} мин.
      </p>
    </div>
  );
}


function BookingSummary({ year, month, day, selectedTime, onContinue }) {
  const dateText = formatSelectedDate(year, month, day);

  const summaryText = selectedTime
    ? `${dateText} · ${selectedTime}–${calculateEndTime(selectedTime, SERVICE_DURATION)}`
    : `${dateText} · Время не выбрано`;

  return (
    <section className="booking-summary" aria-label="Итог записи">
      <div className="summary-info">
        <h2 className="summary-title">{summaryText}</h2>
        <p className="summary-service">
          Мужская стрижка + Королевское бритьё
        </p>
        <p className="summary-details">
          Дмитрий · 2 услуги · 90 мин · от 2 900 ₽
        </p>
      </div>

      <a
        className={`next-button ${selectedTime ? "" : "next-disabled"}`}
        href="#"
        aria-disabled={!selectedTime}
        onClick={(event) => {
          event.preventDefault();
          if (selectedTime) onContinue();
        }}
      >
        Далее: контакты <span className="next-arrow">→</span>
      </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-columns">
          <div className="footer-brand">
            <h2 className="footer-logo">NORTH</h2>
            <p className="footer-description">
              Стрижки, бритьё и уход<br />
              без лишней суеты.
            </p>
          </div>

          <div className="footer-contacts">
            <h3 className="footer-heading">КОНТАКТЫ</h3>
            <p className="footer-text">ул. Свободы, 18, Ярославль</p>
            <p className="footer-text">+7 (4852) 60-45-20</p>
          </div>

          <div className="footer-hours">
            <h3 className="footer-heading">РЕЖИМ РАБОТЫ</h3>
            <p className="footer-text">Пн–Пт: 9:00–21:00</p>
            <p className="footer-text">Сб–Вс: 10:00–18:00</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2026 NORTH. Все права защищены.</p>
          <a className="privacy-link" href="#">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  );
}


function App() {
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [serverToday, setServerToday] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState(null);
  
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);


  useEffect(() => {
    let active = true;

    async function loadToday() {
      try {
        const data = await fetchToday();

        if (!active) return;

        setServerToday(data);
        setCurrentMonth(data.month);
        setCurrentYear(data.year);
        setSelectedDay(data.day);
      } catch (error) {
        if (active) {
          setTodayError(error.message);
        }
      } finally {
        if (active) {
          setTodayLoading(false);
        }
      }
    }

    loadToday();

    return () => {
      active = false;
    };
  }, []);

  
useEffect(() => {
  if (
    selectedDay === null ||
    currentMonth === null ||
    currentYear === null
  ) {
    return;
  }

  let active = true;

  async function loadSlots() {
    setSlotsLoading(true);
    setSlotsError(null);
    setSlots([]);

    const requestedDate = {
      day: selectedDay,
      month: currentMonth,
      year: currentYear,
    };

    try {
      const data = await fetchSlots(requestedDate);

      if (!active) return;

      const isCorrectDate =
        data.date.day === requestedDate.day &&
        data.date.month === requestedDate.month &&
        data.date.year === requestedDate.year;

      if (!isCorrectDate) return;

      setSlots(data.slots);
    } catch (error) {
      if (active) {
        setSlotsError(error.message);
      }
    } finally {
      if (active) {
        setSlotsLoading(false);
      }
    }
  }

  loadSlots();

  return () => {
    active = false;
  };
}, [selectedDay, currentMonth, currentYear]);


  function handleSelectDay(day) {
    setSlotsLoading(true);
    setSlots([]);
    setSlotsError(null);
    setSelectedDay(day);
    setSelectedTime(null);
  }

  
function handleChangeMonth(direction) {
  const newDate = new Date(
    currentYear,
    currentMonth + direction,
    1
  );

  const newYear = newDate.getFullYear();
  const newMonth = newDate.getMonth();

  setCurrentYear(newYear);
  setCurrentMonth(newMonth);

  const isCurrentMonth =
    newYear === serverToday.year &&
    newMonth === serverToday.month;

  setSelectedDay(isCurrentMonth ? serverToday.day : 1);
  setSelectedTime(null);
}


  function handleContinue() {
    alert(
      `Выбрана запись:\n${formatSelectedDate(currentYear, currentMonth, selectedDay)}\nВремя: ${selectedTime}`
    );
  }

  
  if (todayLoading) {
    return (
      <div className="page">
        <Header />
        <main className="main">
          <div className="container">
            <p role="status">Загрузка…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (todayError) {
    return (
      <div className="page">
        <Header />
        <main className="main">
          <div className="container">
            <p role="alert">
              Ошибка загрузки календаря: {todayError}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="container">
          <section className="page-heading">
            <a className="back-link" href="#">← Назад</a>
            <div className="heading-content">
              <h1 className="page-title">Выберите дату и время</h1>
              <p className="page-description">
                Показываем время, доступное для вашего визита к Дмитрию.
              </p>
            </div>
            <span className="step-indicator">Шаг 3 из 5</span>
          </section>

          <section className="booking-section" aria-label="Выбор даты и времени">
            <Calendar
              year={currentYear}
              month={currentMonth}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
              onChangeMonth={handleChangeMonth}
              today={serverToday}
            />

            <TimeSlots
              year={currentYear}
              month={currentMonth}
              day={selectedDay}
              slots={slots}
              loading={slotsLoading}
              error={slotsError}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
            />
          </section>

          <BookingSummary
            year={currentYear}
            month={currentMonth}
            day={selectedDay}
            selectedTime={selectedTime}
            onContinue={handleContinue}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
