import React, { useState, useEffect } from "react";
import type { Quotes } from "./types";
import QuoteForm from "./QuoteForm";
import QuoteViewer from "./QuoteViewer";
import QuoteSearch from "./QuoteSearch";
//import ReminderBanner from "./ReminderBanner";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Use or override with your CSS
import "./App.css";

const API_BASE = "http://0.0.0.0:4094/development";
const getDateString = (date: Date) => date.toISOString().split("T")[0];

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [quoteData, setQuoteData] = useState<Quotes[] | null>(null);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Save mode to localStorage so it sticks
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("darkMode") === "true";
    }
    return false;
  });
  useEffect(() => {
    if (!darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    window.localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);

  useEffect(() => {
    const fetchQuote = async () => {
      const dateStr = getDateString(selectedDate);
      const res = await fetch(`${API_BASE}/GetQuote?date=${dateStr}`);

      if (res.ok) {
        console.log(`Fetched quote for date: ${dateStr}`);
        const data = await res.json();

        try {
          // Check if message looks like valid JSON array
          if (!data.message || !data.message.trim().startsWith("[")) {
            console.warn(
              "No quotes found or invalid data format:",
              data.message
            );
            setQuoteData(null);
            setDailyReminder(isToday(selectedDate));
            return;
          }

          const parsed = JSON.parse(data.message);
          const fixedData: Quotes[] = [];

          for (const entry of parsed) {
            console.log("Processing entry:", entry);
            const out: Quotes = {
              quote: entry.quote.quoteText,
              source: entry.quote.source,
              tags: entry.tags.map((tag: any) => tag.name).filter(Boolean),
            };
            fixedData.push(out);
          }

          setQuoteData(fixedData.length > 0 ? fixedData : null);
          setDailyReminder(fixedData.length === 0 && isToday(selectedDate));
        } catch (err) {
          console.error("Failed to parse quote data:", err);
          setQuoteData(null);
          setDailyReminder(isToday(selectedDate));
        }
      } else {
        setQuoteData(null);
        setDailyReminder(isToday(selectedDate));
      }
    };

    fetchQuote();
  }, [selectedDate]);

  function isToday(date: Date) {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  const refreshQuote = async () => {
    const dateStr = getDateString(selectedDate);
    console.log(`Refreshing quote for date: ${dateStr}`);
    const res = await fetch(`${API_BASE}/GetQuote?date=${dateStr}`);
    if (res.ok) {
      const data = await res.json();
      setQuoteData(data || null);
      setDailyReminder(!data && isToday(selectedDate));
    }
  };

  return (
    <main className="app-container">
      <header>
        <h1>DailyQuotes</h1>
      </header>
      <button
        className="toggle-dark"
        onClick={() => setDarkMode((d) => !d)}
        aria-label="Toggle dark mode"
        style={{ position: "absolute", top: "10px", right: "10px" }}
      >
        {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>

      {/* {dailyReminder && <ReminderBanner />} */}

      {/* --- 2-column grid for Calendar and Today's Quote --- */}
      <div className="dashboard-top-row">
        <div className="calendar">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) setSelectedDate(date);
            }}
            toDate={new Date()}
          />
        </div>
        <QuoteViewer quote={quoteData} date={selectedDate} />
      </div>

      {/* --- 2-column grid for Add Quote and Tag Search --- */}
      <div className="dashboard-bottom-row">
        {isToday(selectedDate) && <QuoteForm onSuccess={refreshQuote} />}
        <QuoteSearch />
      </div>
    </main>
  );
};

export default App;
