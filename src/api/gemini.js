const DEFAULT_KEY = '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';

function getKey() {
  const stored = localStorage.getItem('gemini_api_key') || localStorage.getItem('nvidia_api_key');
  if (stored && (stored.startsWith('nvapi-') || stored.startsWith('AIza'))) {
    return stored;
  }
  return DEFAULT_KEY;
}

export async function askGemini(prompt) {
  const key = getKey();
  if (!key) throw new Error('AI API key not set');

  if (key.startsWith('nvapi-')) {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024
      })
    });
    if (!res.ok) {
      console.error('NVIDIA AI error:', res.status, await res.text());
      throw new Error(`NVIDIA AI error: ${res.status}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response';
  } else {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    });
    if (!res.ok) {
      console.error('Gemini error:', res.status, await res.text());
      throw new Error(`Gemini error: ${res.status}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
  }
}

export async function getAISearchTerms(query) {
  const prompt = `You are a movie recommendation AI. The user said: "${query}". Return ONLY a JSON array of 3-5 movie/show search terms that match what they want. Example: ["Inception","Interstellar","The Matrix"]. No explanation, just the JSON array.`;
  const text = await askGemini(prompt);
  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [query];
  } catch { return [query]; }
}

export async function getAIRecommendation(userMessage, context = '') {
  const prompt = `You are a friendly movie/TV show recommendation assistant for a Netflix-like app. ${context ? 'Context: ' + context : ''}
User: ${userMessage}
Give a helpful, conversational response (2-3 sentences max). Recommend specific movie/show titles when relevant. Be enthusiastic but concise.`;
  return askGemini(prompt);
}

export async function getAIMoodAnalysis(title, overview) {
  const prompt = `Analyze the movie "${title}" in one sentence. Overview: ${overview}. Describe the mood and who would enjoy it. One sentence only.`;
  return askGemini(prompt);
}
