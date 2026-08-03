import { getAIRecommendation } from '../api/gemini.js';
import { showToast } from '../utils/storage.js';

let isOpen = false;
const messages = [{ role: 'bot', text: "Hey! 👋 I'm your AI movie assistant. Ask me for recommendations based on your mood, genre preferences, or favorite movies!" }];

export function renderAIChat() {
  const container = document.getElementById('ai-chat');
  container.innerHTML = `
    <button class="ai-chat-toggle" id="ai-chat-toggle">🤖</button>
    <div class="ai-chat-panel" id="ai-chat-panel">
      <div class="ai-chat-header">
        <div class="ai-chat-header-dot"></div>
        <span>AI Movie Assistant</span>
      </div>
      <div class="ai-chat-messages" id="ai-chat-messages"></div>
      <div class="ai-chat-input-wrap">
        <input class="ai-chat-input" id="ai-chat-input" placeholder="Ask for movie recommendations..." />
        <button class="ai-chat-send" id="ai-chat-send">➤</button>
      </div>
    </div>`;

  renderMessages();

  document.getElementById('ai-chat-toggle').addEventListener('click', () => {
    isOpen = !isOpen;
    document.getElementById('ai-chat-panel').classList.toggle('open', isOpen);
  });

  document.getElementById('ai-chat-send').addEventListener('click', sendMessage);
  document.getElementById('ai-chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
}

function renderMessages() {
  const el = document.getElementById('ai-chat-messages');
  if (!el) return;
  el.innerHTML = messages.map(m => `<div class="ai-msg ${m.role}">${m.text}</div>`).join('');
  el.scrollTop = el.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('ai-chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  messages.push({ role: 'user', text });
  renderMessages();

  try {
    const reply = await getAIRecommendation(text);
    messages.push({ role: 'bot', text: reply });
  } catch (err) {
    if (err.message.includes('not set')) {
      messages.push({ role: 'bot', text: '⚙️ Please set your Gemini API key in Settings first!' });
    } else {
      messages.push({ role: 'bot', text: 'Sorry, I had trouble thinking. Try again!' });
    }
  }
  renderMessages();
}
