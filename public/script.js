const socket = io();
let peer;
let myPeerId;
let localStream;
let currentCall;

let userProfile = { name: "Anonim", avatar: "https://via.placeholder.com/40" };
const roomId = "ruang-mabar-bersama"; // Room default agar otomatis terhubung ke teman

// 1. Inisialisasi Profil & Masuk Aplikasi
function startApp() {
    const nameInput = document.getElementById('username').value.trim();
    const fileInput = document.getElementById('avatar-input').files[0];

    if (!nameInput) return alert("Nama tidak boleh kosong!");
    userProfile.name = nameInput;

    if (fileInput) {
        const reader = new FileReader();
        reader.onloadend = function () {
            userProfile.avatar = reader.result;
            initSession();
        }
        reader.readAsDataURL(fileInput);
    } else {
        initSession();
    }
}

function initSession() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('my-name-display').innerText = userProfile.name;
    document.getElementById('my-avatar-display').src = userProfile.avatar;

    // Inisialisasi PeerJS untuk Panggilan Video/Audio
    peer = new Peer();
    peer.on('open', (id) => {
        myPeerId = id;
        socket.emit('join-room', roomId, { name: userProfile.name, peerId: id });
    });

    // Menerima panggilan masuk
    peer.on('call', (call) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            document.getElementById('video-grid').classList.remove('hidden');
            localStream = stream;
            document.getElementById('local-video').srcObject = stream;
            
            call.answer(stream);
            currentCall = call;
            call.on('stream', (remoteStream) => {
                document.getElementById('remote-video').srcObject = remoteStream;
            });
        });
    });
}

// 2. Fitur Real-time Chatting
function sendMessage() {
    const input = document.getElementById('message-input');
    if (!input.value.trim()) return;

    const data = {
        name: userProfile.name,
        avatar: userProfile.avatar,
        message: input.value
    };

    socket.emit('chat-message', data);
    input.value = "";
}

socket.on('chat-message', (data) => {
    const chatBox = document.getElementById('chat-box');
    const isMe = data.name === userProfile.name;

    const msgHtml = `
        <div class="flex items-end space-x-2 ${isMe ? 'flex-row-reverse space-x-reverse text-right' : ''}">
            <img src="${data.avatar}" class="w-8 h-8 rounded-full object-cover">
            <div class="${isMe ? 'bg-emerald-200' : 'bg-white'} p-2 rounded-lg max-w-xs shadow text-sm">
                <span class="block text-xs font-bold text-emerald-800">${data.name}</span>
                <p class="text-gray-800 mt-0.5">${data.message}</p>
            </div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', msgHtml);
    chatBox.scrollTop = chatBox.scrollHeight;
});

// 3. Fitur Panggilan Video & Suara
function startCall(withVideo) {
    socket.emit('call-user', { peerId: myPeerId });

    navigator.mediaDevices.getUserMedia({ video: withVideo, audio: true }).then((stream) => {
        document.getElementById('video-grid').classList.remove('hidden');
        localStream = stream;
        document.getElementById('local-video').srcObject = stream;

        // Cari ID Peer teman lewat sistem signaling sederhana (meminta target koneksi otomatis)
        // Catatan: Pada versi produksi, simpan ID Peer aktif di server untuk auto-routing panggilan.
    }).catch(err => alert("Gagal mengakses Kamera/Mikrofon: " + err));
}

// Menangkap sinyal panggilan masuk dari Socket
socket.on('incoming-call', (data) => {
    if(data.peerId !== myPeerId) {
        alert("Ada panggilan masuk! Menghubungkan secara otomatis...");
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            const call = peer.call(data.peerId, stream);
            currentCall = call;
            document.getElementById('video-grid').classList.remove('hidden');
            document.getElementById('local-video').srcObject = stream;

            call.on('stream', (remoteStream) => {
                document.getElementById('remote-video').srcObject = remoteStream;
            });
        });
    }
});

function endCall() {
    if (currentCall) currentCall.close();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    document.getElementById('video-grid').classList.add('hidden');
}