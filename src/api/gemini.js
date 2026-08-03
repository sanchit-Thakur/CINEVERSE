function getKey() {
  return localStorage.getItem('gemini_api_key') || '';
}

export async function askGemini(prompt) {
  const key = getKey();
  if (!key) throw new Error('Gemini API key not set');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    })
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
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
