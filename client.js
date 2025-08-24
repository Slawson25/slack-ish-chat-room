document.addEventListener('DOMContentLoaded', () => {
  const $loginScreen = document.getElementById('loginScreen');
  const $loginUsername = document.getElementById('loginUsername');
  const $loginRole = document.getElementById('loginRole');
  const $loginBtn = document.getElementById('loginBtn');

  const $chatUI = document.getElementById('chatUI');
  const $messageInput = document.getElementById('messageInput');
  const $chatWindow = document.getElementById('messages');
  const $roleBadge = document.getElementById('roleBadge');

  const state = {
    username: null,
    role: null,
    room: 'general'
  };

  const socket = io();

  // Join chat
  $loginBtn.addEventListener('click', () => {
    const username = $loginUsername.value.trim();
    const role = $loginRole.value;

    if (!username) return alert('Enter your name to join.');

    state.username = username;
    state.role = role;

    // Update sidebar
    document.getElementById('username').value = username;
    $roleBadge.textContent = role;

    socket.emit('join-room', { username, role, room: state.room });

    $loginScreen.style.display = 'none';
    $chatUI.style.display = 'block';
  });

  // Send message
  document.getElementById('composer').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = $messageInput.value.trim();
    if (!text) return;

    socket.emit('message', { room: state.room, username: state.username, text });
    $messageInput.value = '';
  });

  // Prevent previous messages from showing on focus
  $messageInput.addEventListener('focus', () => {
    $messageInput.value = '';
  });

  // Receive messages
  socket.on('message', (data) => {
    const $msg = document.createElement('div');
    $msg.classList.add('message');
    $msg.innerHTML = `<strong>${data.username}:</strong> ${data.text}`;
    $chatWindow.appendChild($msg);
    $chatWindow.scrollTop = $chatWindow.scrollHeight;
  });

  // System messages
  socket.on('system-message', (text) => {
    const $msg = document.createElement('div');
    $msg.classList.add('system');
    $msg.innerHTML = `<em>${text}</em>`;
    $chatWindow.appendChild($msg);
    $chatWindow.scrollTop = $chatWindow.scrollHeight;
  });

  // Chat history (only once)
  socket.on('chat-history', (messages) => {
    $chatWindow.innerHTML = '';
    messages.forEach(msg => {
      const $msg = document.createElement('div');
      $msg.classList.add('message');
      $msg.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
      $chatWindow.appendChild($msg);
    });
    $chatWindow.scrollTop = $chatWindow.scrollHeight;
  });

  // Clear messages (visual only)
  socket.on('clear-messages', () => {
    $chatWindow.innerHTML = '';
    const $sysMsg = document.createElement('div');
    $sysMsg.classList.add('system');
    $sysMsg.innerHTML = `<em>The chat was cleared by a moderator.</em>`;
    $chatWindow.appendChild($sysMsg);
    $chatWindow.scrollTop = $chatWindow.scrollHeight;
  });

  // Clear chat button
  const $clearChatBtn = document.createElement('button');
  $clearChatBtn.textContent = '🧹 Clear Messages';
  $clearChatBtn.style.display = 'none';
  $clearChatBtn.addEventListener('click', () => {
    socket.emit('clear-room', { room: state.room });
  });
  document.body.appendChild($clearChatBtn);

  // Show button if moderator
  socket.on('user-info', ({ role }) => {
    if (role === 'moderator') $clearChatBtn.style.display = 'inline-block';
  });
});




