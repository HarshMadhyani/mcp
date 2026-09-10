// Client-side interactions for students list and details
document.addEventListener('DOMContentLoaded', () => {
  // Chat history auto-scroll to bottom
  const chatHistory = document.querySelector('.chat-history');
  if (chatHistory) {
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
});
