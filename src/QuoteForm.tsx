import React, { useState, useRef, useEffect } from "react";
import type { QuoteFormData } from "./types";
import { Chip, Button } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

interface Props {
  onSuccess: () => void;
}

const API_BASE = "http://0.0.0.0:4094/development";

const QuoteForm: React.FC<Props> = ({ onSuccess }) => {
  const [form, setForm] = useState<Omit<QuoteFormData, "tags">>({
    quote: "",
    source: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const quoteRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (quoteRef.current && quoteRef.current.textContent !== form.quote) {
      quoteRef.current.textContent = form.quote;
    }
  }, [form.quote]);

  const handleQuoteInput = () => {
    if (!quoteRef.current) return;
    const plainText = quoteRef.current.innerText;
    setForm((prev) => ({ ...prev, quote: plainText }));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLSpanElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.quote.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/CreateQuote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteText: form.quote,
          source: form.source,
          tags,
        }),
      });
      if (!res.ok) {
        console.error("Failed to save quote");
        setLoading(false);
        return;
      }
      setForm({ quote: "", source: "" });
      setTags([]);
      if (quoteRef.current) quoteRef.current.textContent = "";
      onSuccess();
    } catch (err) {
      console.error("Error submitting quote:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ","].includes(e.key)) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  return (
    <section className="quote-form" aria-labelledby="add-quote-heading">
      <h2 id="add-quote-heading" className="form-title">
        Add or Edit Today's Quote
      </h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <label htmlFor="quote-input">Quote</label>
        <div className="input-wrap">
          <span
            id="quote-input"
            role="textbox"
            contentEditable
            className="textarea"
            aria-placeholder="Enter today's quote"
            spellCheck={false}
            ref={quoteRef}
            onInput={handleQuoteInput}
            onPaste={handlePaste}
            suppressContentEditableWarning={true}
          />
        </div>

        <label htmlFor="tags-input">Tags</label>
        <div className="tag-input-container">
          <input
            id="tags-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag"
            className="tag-input"
          />
          <div className="tag-pill-container">
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                className="tag-pill"
                onDelete={() => handleDeleteTag(tag)}
                deleteIcon={<CancelIcon className="remove-tag" />}
              />
            ))}
          </div>
        </div>

        <label htmlFor="source-input">Source (optional)</label>
        <input
          id="source-input"
          name="source"
          value={form.source}
          onChange={handleChange}
          placeholder="Source"
        />

        <Button
          type="submit"
          disabled={loading}
          fullWidth
          variant="contained"
          className="submit-button"
        >
          {loading ? "Saving..." : "Save Quote"}
        </Button>
      </form>
    </section>
  );
};

export default QuoteForm;
