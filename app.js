const chat = document.getElementById('chat');
const form = document.getElementById('messageForm');
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const purposeSelect = document.getElementById('purpose');
const messageInput = document.getElementById('message');

let messages = [];

function addMessageToChat(msg, status) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(status === 'sent' ? 'sent' : 'received');
    div.innerHTML = `<strong>${msg.from} → ${msg.to}</strong><br>` +
                    `<em>${msg.purpose}</em><br>` +
                    `${msg.text}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function addPendingMessage(msg, etaMs) {
    const div = document.createElement('div');
    div.classList.add('message', 'pending');
    div.textContent = `Pigeon launched! ETA: ${Math.round(etaMs/1000)}s`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    msg.pendingDiv = div;
}

function sendMessage(e) {
    e.preventDefault();
    const from = fromInput.value.trim();
    const to = toInput.value.trim();
    const text = messageInput.value.trim();
    const purpose = purposeSelect.value;
    if (!from || !to || !text) return;

    const delay = Math.random() * 5 * 60 * 1000; // up to 5 minutes
    const deliverAt = Date.now() + delay;
    const msg = { from, to, text, purpose, deliverAt };
    messages.push(msg);
    addPendingMessage(msg, delay);

    setTimeout(() => {
        if (msg.pendingDiv) {
            chat.removeChild(msg.pendingDiv);
        }
        addMessageToChat(msg, 'sent');
    }, delay);

    form.reset();
}

form.addEventListener('submit', sendMessage);
