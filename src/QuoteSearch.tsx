import React, { useState } from "react";
import type { Quotes } from "./types";

const API_BASE = "http://localhost:5000/api";

const QuoteSearch: React.FC = () => {
  const [searchTag, setSearchTag] = useState("");
  const [results, setResults] = useState<Quotes[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTag) return;
    setLoading(true);
    const res = await fetch(
      `${API_BASE}/quotes?tag=${encodeURIComponent(searchTag)}`
    );
    if (res.ok) {
      setResults(await res.json());
    } else {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <section className="quote-search" aria-labelledby="search-heading">
      <h2 id="search-heading" className="search-title">
        Search Quotes by Tag
      </h2>
      <div className="quote-search-bar">
        <input
          type="text"
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          placeholder="e.g. motivation"
        />
        <button onClick={handleSearch} disabled={loading}>
          Search
        </button>
      </div>
      <ul className="quote-search-results">
        {results.map((q, i) => (
          <li key={i}>
            <blockquote className="quote-text">"{q.quote}"</blockquote>
            <div className="source-info">
              {q.date} {q.source ? ` | Source: ${q.source}` : ""}
            </div>
            <ul className="tags-list">
              {q.tags.map((tag) => (
                <li key={tag} className="tag-pill">
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {results.length === 0 && !loading && searchTag && (
          <li className="quote-text muted">No quotes found for this tag.</li>
        )}
      </ul>
    </section>
  );
};

export default QuoteSearch;
