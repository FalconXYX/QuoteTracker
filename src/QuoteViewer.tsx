// --- QuoteViewer.tsx ---
import React from "react";
import type { Quotes } from "./types";

interface QuoteViewerProps {
  quote: Quotes[] | null;
}

const QuoteViewer: React.FC<QuoteViewerProps> = ({ quote }) => {
  if (!Array.isArray(quote)) {
    return (
      <div className="quote-container empty">
        <p className="quote-text">No quotes available.</p>
      </div>
    );
  }

  return (
    <div className="quote-container">
      {quote.length === 0 ? (
        <p className="quote-text">No quotes for this day.</p>
      ) : (
        quote.map((entry, idx) => (
          <div key={idx} className="quote-block">
            <p className="quote-text">“{entry.quote}”</p>
            {entry.tags?.length > 0 && (
              <ul className="tags-list">
                {entry.tags.map((tag) => (
                  <li key={tag} className="tag-pill">
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {entry.source && (
              <div className="source-info">
                Source:{" "}
                {entry.source.startsWith("http") ? (
                  <a
                    href={entry.source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {entry.source}
                  </a>
                ) : (
                  entry.source
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default QuoteViewer;
