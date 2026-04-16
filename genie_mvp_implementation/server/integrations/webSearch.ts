export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    // DuckDuckGo Instant Answer API — free, no key required
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return fallback(query);
    const data = await res.json();

    const results: SearchResult[] = [];

    // Abstract (top result summary)
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: data.Abstract,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(data.AbstractURL).hostname}`,
      });
    }

    // Related topics
    const topics: any[] = data.RelatedTopics ?? [];
    for (const topic of topics) {
      if (!topic.FirstURL || !topic.Text) continue;
      results.push({
        title: topic.Text.split(' - ')[0] || topic.Text.slice(0, 60),
        url: topic.FirstURL,
        snippet: topic.Text,
        favicon: topic.Icon?.URL ? `https://duckduckgo.com${topic.Icon.URL}` : undefined,
      });
      if (results.length >= 5) break;
    }

    return results.length > 0 ? results : fallback(query);
  } catch {
    return fallback(query);
  }
}

function fallback(query: string): SearchResult[] {
  return [
    {
      title: `Search Google for "${query}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: 'Click to open Google search results in a new tab.',
    },
    {
      title: `Search DuckDuckGo for "${query}"`,
      url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      snippet: 'Private search results on DuckDuckGo.',
    },
  ];
}
