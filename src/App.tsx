import React, { useState, useEffect } from "react";
import type { Quotes } from "./types";
import QuoteForm from "./QuoteForm";
import QuoteViewer from "./QuoteViewer";
import QuoteSearch from "./QuoteSearch";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./App.css";

const API_BASE = "http://0.0.0.0:4094/development";
const getDateString = (date: Date) => date.toISOString().split("T")[0];

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [quoteData, setQuoteData] = useState<Quotes[] | null>(null);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
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

  async function handleDeleteQuote(id: string) {
    console.log("Deleting quote with ID:", id);
    const res = await fetch(`${API_BASE}/DeleteQuote?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error("Failed to delete quote:", id);
      return;
    }

    // Remove deleted quote from local state to trigger re-render
    setQuoteData((prev) => {
      const updated = prev ? prev.filter((quote) => quote.id !== id) : null;
      if (updated?.length === 0 && isToday(selectedDate)) {
        setDailyReminder(true);
      }
      return updated?.length ? updated : null;
    });
  }

  function isToday(date: Date) {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  const loadQuoteForDate = async (date: Date) => {
    const dateStr = getDateString(date);
    const res = await fetch(`${API_BASE}/GetQuote?date=${dateStr}`);

    if (!res.ok) {
      setQuoteData(null);
      setDailyReminder(isToday(date));
      return;
    }

    const data = await res.json();

    try {
      if (!data.message || !data.message.trim().startsWith("[")) {
        setQuoteData(null);
        setDailyReminder(isToday(date));
        return;
      }

      const parsed = JSON.parse(data.message);
      const fixedData: Quotes[] = parsed.map((entry: any) => ({
        id: entry.quote.id,
        quote: entry.quote.quoteText,
        source: entry.quote.source,
        tags: entry.tags.map((tag: any) => tag.name).filter(Boolean),
      }));

      console.log("Loaded quotes for date:", dateStr, fixedData);
      setQuoteData(fixedData.length > 0 ? fixedData : null);
      setDailyReminder(fixedData.length === 0 && isToday(date));
    } catch (err) {
      console.error("Failed to parse quote data:", err);
      setQuoteData(null);
      setDailyReminder(isToday(date));
    }
  };

  useEffect(() => {
    loadQuoteForDate(selectedDate);
  }, [selectedDate]);

  const refreshQuote = () => loadQuoteForDate(selectedDate);

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

        <QuoteViewer quote={quoteData} onDelete={handleDeleteQuote} />
      </div>

      <div className="dashboard-bottom-row">
        {isToday(selectedDate) && <QuoteForm onSuccess={refreshQuote} />}
        <QuoteSearch />
      </div>
    </main>
  );
};

export default App;
