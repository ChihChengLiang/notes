// Auto-reload on file changes
const eventSource = new EventSource('/events');
eventSource.onmessage = (event) => {
  if (event.data === 'reload') {
    location.reload();
  }
};
eventSource.onerror = () => {
  console.log('SSE connection lost, attempting to reconnect...');
};
