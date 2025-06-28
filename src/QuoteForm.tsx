import React, {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import type { QuoteFormData } from "./types";

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
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Ref to access the contentEditable span
  const quoteRef = useRef<HTMLSpanElement | null>(null);

  // Keep span in sync with form.quote
  useEffect(() => {
    if (quoteRef.current && quoteRef.current.textContent !== form.quote) {
      quoteRef.current.textContent = form.quote;
    }
  }, [form.quote]);

  // On input, update form.quote
  const handleQuoteInput = () => {
    const newText = quoteRef.current?.textContent ?? "";
    setForm((prev) => ({ ...prev, quote: newText }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === "Enter" || e.key === "Tab" || e.key === ",") &&
      tagInput.trim() !== ""
    ) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) setTags([...tags, tag]);
    setTagInput("");
  };

  const removeTag = (remove: string) => {
    setTags(tags.filter((tag) => tag !== remove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch(`${API_BASE}/CreateQuote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteText: form.quote,
        source: form.source,
        tags: tags,
      }),
    });

    setForm({ quote: "", source: "" });
    setTags([]);
    setTagInput("");
    if (quoteRef.current) quoteRef.current.textContent = "";
    setLoading(false);
    onSuccess();
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
            suppressContentEditableWarning={true}
          />
        </div>

        <label htmlFor="tags-input">Tags</label>
        <div className="tag-input-group">
          {tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                onClick={() => removeTag(tag)}
                className="remove-tag"
                tabIndex={0}
              >
                &times;
              </button>
            </span>
          ))}
          <input
            id="tags-input"
            type="text"
            value={tagInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTagInput(e.target.value)
            }
            onKeyDown={handleTagKeyDown}
            placeholder={tags.length === 0 ? "Type and press Enter" : ""}
            className="tag-input"
            autoComplete="off"
          />
        </div>

        <label htmlFor="source-input">Source (optional)</label>
        <input
          id="source-input"
          name="source"
          value={form.source}
          onChange={handleChange}
          placeholder="Source"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Quote"}
        </button>
      </form>
    </section>
  );
};

export default QuoteForm;
