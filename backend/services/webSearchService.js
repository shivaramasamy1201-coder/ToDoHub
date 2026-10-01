/**
 * Web Search Service — Tavily API Provider
 * Provides web search capabilities for the ToDoHub AI Agent.
 * Gracefully degrades when TAVILY_API_KEY is not configured.
 */

const TAVILY_API_URL = 'https://api.tavily.com/search';

/**
 * Check if web search is available (API key configured)
 * @returns {boolean}
 */
export const isWebSearchAvailable = () => {
  return Boolean(process.env.TAVILY_API_KEY);
};

/**
 * Search the web using Tavily API
 * @param {string} query - Search query
 * @param {Object} [options] - Search options
 * @param {number} [options.maxResults=5] - Max results to return
 * @param {string} [options.searchDepth='basic'] - 'basic' or 'advanced'
 * @param {boolean} [options.includeAnswer=true] - Include AI-generated answer
 * @returns {Promise<{success: boolean, answer?: string, results?: Array, error?: string}>}
 */
export const searchWeb = async (query, options = {}) => {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Web search is not configured. TAVILY_API_KEY is missing.'
    };
  }

  if (!query || typeof query !== 'string' || !query.trim()) {
    return {
      success: false,
      error: 'Search query cannot be empty.'
    };
  }

  const maxResults = Math.min(Math.max(options.maxResults || 5, 1), 10);
  const searchDepth = options.searchDepth === 'advanced' ? 'advanced' : 'basic';
  const includeAnswer = options.includeAnswer !== false;

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query.trim(),
        max_results: maxResults,
        search_depth: searchDepth,
        include_answer: includeAnswer,
        include_raw_content: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[WebSearch Error]', {
        status: response.status,
        body: errorText.substring(0, 200)
      });
      return {
        success: false,
        error: `Web search request failed (HTTP ${response.status}).`
      };
    }

    const data = await response.json();

    // Format results for consumption
    const formattedResults = (data.results || []).map((r) => ({
      title: r.title || 'Untitled',
      url: r.url || '',
      snippet: r.content || '',
      score: r.score || 0
    }));

    return {
      success: true,
      answer: data.answer || null,
      results: formattedResults,
      query: query.trim()
    };
  } catch (err) {
    console.error('[WebSearch Error]', {
      name: err.name,
      message: err.message
    });
    return {
      success: false,
      error: 'Web search failed due to a network or server error.'
    };
  }
};

/**
 * Format web search results into a readable string for the AI agent
 * @param {Object} searchResult - Result from searchWeb()
 * @returns {string}
 */
export const formatSearchResultsForAgent = (searchResult) => {
  if (!searchResult.success) {
    return `Web search failed: ${searchResult.error}`;
  }

  let formatted = '';

  if (searchResult.answer) {
    formatted += `**Summary:** ${searchResult.answer}\n\n`;
  }

  if (searchResult.results && searchResult.results.length > 0) {
    formatted += '**Sources:**\n';
    searchResult.results.forEach((r, i) => {
      formatted += `${i + 1}. [${r.title}](${r.url})\n`;
      if (r.snippet) {
        formatted += `   ${r.snippet.substring(0, 200)}${r.snippet.length > 200 ? '...' : ''}\n`;
      }
    });
  }

  return formatted.trim() || 'No results found.';
};
