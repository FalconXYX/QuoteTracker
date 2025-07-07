export interface Quotes {
  id: string;
  quote: string;
  tags: string[];
  source?: string;
}

export interface QuoteFormData {
  quote: string;
  tags: string;
  source?: string;
}
