import React from "react";
import type { Quotes } from "./types";
import { Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface QuoteViewerProps {
  quote: Quotes[] | null;
  onDelete: (id: string) => void;
}

const QuoteViewer: React.FC<QuoteViewerProps> = ({ quote, onDelete }) => {
  if (!quote || !Array.isArray(quote)) {
    return (
      <div className="quote-container empty">
        <p className="quote-text">No quotes available.</p>
      </div>
    );
  }

  if (quote.length === 0) {
    return (
      <div className="quote-container empty">
        <p className="quote-text">No quotes for this day.</p>
      </div>
    );
  }

  const scrollable = quote.length > 2;

  return (
    <div className="quote-container">
      <div className={`quote-scroll ${scrollable ? "scrollable" : ""}`}>
        {quote.map((entry, idx) => (
          <div
            key={idx}
            className="quote-card"
            style={{ position: "relative" }}
          >
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

            {/* MUI Delete Button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "auto",
                paddingTop: "6px",
              }}
            >
              <IconButton
                onClick={() => onDelete(entry.id)}
                aria-label="delete"
                size="small"
                disableRipple
                disableFocusRipple
                sx={{
                  padding: "4px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  color: "error.main",
                  backgroundColor: "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                  },
                  "&:focus-visible": {
                    outline: "none",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuoteViewer;
