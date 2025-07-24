import React, { useState, useEffect, useRef } from "react";
import type { Quotes } from "./types";
import Fuse from "fuse.js";
import {
  TextField,
  Button,
  Popper,
  List,
  ListItem,
  Paper,
  ClickAwayListener,
} from "@mui/material";

const API_BASE = "http://0.0.0.0:4094/development";

const QuoteSearch: React.FC = () => {
  const [searchTag, setSearchTag] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Quotes[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const fuseRef = useRef<Fuse<string> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const res = await fetch(`${API_BASE}/GetAllTags`);
        if (!res.ok) throw new Error("Failed to fetch tags");
        const data = await res.json();
        const raw = data.message;

        const tags = Array.isArray(raw)
          ? raw
          : typeof raw === "string"
          ? raw.startsWith("[")
            ? JSON.parse(raw)
            : raw.split(",").map((t) => t.trim())
          : [];

        setAllTags(tags);
      } catch (e) {
        console.error("Error fetching tags:", e);
      }
    };
    fetchAllTags();
  }, []);

  useEffect(() => {
    if (allTags.length) {
      fuseRef.current = new Fuse(allTags, {
        threshold: 0.2,
        ignoreLocation: true,
        distance: 50,
        useExtendedSearch: true,
      });
    }
  }, [allTags]);

  useEffect(() => {
    if (searchTag.trim() && fuseRef.current) {
      const results = fuseRef.current.search(`^${searchTag}`);
      const matches = results.map((res) => res.item);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTag]);

  const handleSearch = async (tagToSearch = searchTag) => {
    if (!tagToSearch) return;
    setLoading(true);
    setShowSuggestions(false);

    try {
      const res = await fetch(
        `${API_BASE}/GetQuoteByTag?tag=${encodeURIComponent(tagToSearch)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    }

    setLoading(false);
  };

  const handleSuggestionClick = (tag: string) => {
    setSearchTag(tag);
    handleSearch(tag);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <section className="quote-search" aria-labelledby="search-heading">
      <h2 id="search-heading" className="search-title">
        Search Quotes by Tag
      </h2>

      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          position: "relative",
        }}
      >
        <TextField
          fullWidth
          inputRef={inputRef}
          label="Tag"
          variant="outlined"
          size="small"
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          sx={{
            // Styles for when body.dark is active
            "body.dark &": {
              // Style the input text color
              ".MuiInputBase-input": {
                color: "#e1e3e7",
              },
              // Style the label color
              ".MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
              // Style the outline
              ".MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.23)",
              },
              // Style the outline on hover
              ".MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              // Style the label and outline when focused
              "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#90caf9",
              },
              "& .Mui-focused.MuiInputLabel-root": {
                color: "#90caf9",
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={() => handleSearch()}
          disabled={loading}
        >
          Search
        </Button>
        <Popper
          open={showSuggestions}
          anchorEl={inputRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300, width: inputRef.current?.offsetWidth }}
        >
          <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
            <Paper
              elevation={3}
              sx={{
                // Light mode default styles
                bgcolor: "white",
                border: "1px solid #c7d2fe",
                borderTop: "none",
                borderRadius: "0 0 6px 6px",
                maxHeight: "180px",
                overflowY: "auto",
                // Dark mode override
                "body.dark &": {
                  bgcolor: "#232733",
                  borderColor: "#424855",
                },
              }}
            >
              <List dense disablePadding>
                {suggestions.map((tag) => (
                  <ListItem
                    key={tag}
                    button
                    onMouseDown={() => handleSuggestionClick(tag)}
                    sx={{
                      // Light mode default styles
                      padding: "6px 10px",
                      fontSize: "0.95rem",
                      color: "#22223b",
                      "&:hover": {
                        bgcolor: "#f0f4ff",
                      },
                      // Dark mode override
                      "body.dark &": {
                        color: "#e1e3e7",
                        "&:hover": {
                          bgcolor: "rgba(255, 255, 255, 0.08)",
                        },
                      },
                    }}
                  >
                    {tag}
                  </ListItem>
                ))}
              </List>
            </Paper>
          </ClickAwayListener>
        </Popper>
      </div>

      <ul className="quote-search-results">
        {results.map((q, i) => (
          <li key={i} className="quote-card">
            <blockquote className="quote-text">"{q.quote}"</blockquote>
            <div className="source-info">
              {q.source ? `Source: ${q.source}` : ""}
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
        {results.length === 0 &&
          !loading &&
          searchTag &&
          showSuggestions == false && (
            <li className="quote-text muted">No quotes found for this tag.</li>
          )}
      </ul>
    </section>
  );
};

export default QuoteSearch;
