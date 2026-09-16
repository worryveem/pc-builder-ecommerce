(() => {
    function createChatWidget() {
        if (document.getElementById("chat-widget-btn")) {
            return;
        }

        // Remove any old static chat elements that might exist in HTML pages
        const oldStaticBtn = document.querySelector(".chat-widget-btn:not(#chat-widget-btn)");
        if (oldStaticBtn) oldStaticBtn.remove();
        const oldStaticBox = document.getElementById("chat-box");
        if (oldStaticBox) oldStaticBox.remove();

        const btn = document.createElement("button");
        btn.id = "chat-widget-btn";
        btn.className = "chat-widget-btn";
        btn.type = "button";
        btn.title = "Chat tư vấn chọn đồ cho bé";
        btn.innerHTML = "💬";

        const box = document.createElement("section");
        box.id = "chat-widget-box";
        box.className = "chat-widget-box";
        box.innerHTML = `
            <div class="chat-header">
                <span style="display:flex; align-items:center; gap:8px;">🧸 <span>Tư vấn KiddieLuxe Kids</span></span>
                <button type="button" class="chat-close-btn" aria-label="Đóng chat">&times;</button>
            </div>
            <div class="chat-body" id="chat-widget-body">
                <div class="chat-msg">Xin chào ba mẹ! Bạn cần tư vấn mẫu đồ hoặc chọn kích cỡ theo tháng tuổi và cân nặng của bé yêu ạ?</div>
            </div>
            <form class="chat-footer" id="chat-widget-form">
                <input type="text" id="chat-widget-input" placeholder="Hỏi về size, chất liệu cho bé..." autocomplete="off" />
                <button type="submit" aria-label="Gửi tin nhắn">➤</button>
            </form>
        `;

        document.body.appendChild(btn);
        document.body.appendChild(box);

        const closeBtn = box.querySelector(".chat-close-btn");
        const form = document.getElementById("chat-widget-form");
        const input = document.getElementById("chat-widget-input");
        const body = document.getElementById("chat-widget-body");

        const toggleChat = () => {
            box.classList.toggle("open");
            if (box.classList.contains("open")) {
                input.focus();
            }
        };

        window.toggleChat = toggleChat;

        const appendMessage = (content, isUser = false) => {
            const msgEl = document.createElement("div");
            msgEl.className = `chat-msg${isUser ? " user" : ""}`;
            msgEl.textContent = content;
            body.appendChild(msgEl);
            body.scrollTop = body.scrollHeight;
        };

        const sendChatRequest = async (message) => {
            if (typeof fetchAPI === "function") {
                return fetchAPI("/chat", {
                    method: "POST",
                    body: JSON.stringify({ message })
                });
            }
            throw new Error("chat_api_unavailable");
        };

        btn.addEventListener("click", toggleChat);
        closeBtn.addEventListener("click", toggleChat);

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const message = input.value.trim();
            if (!message) return;

            appendMessage(message, true);
            input.value = "";

            try {
                const response = await sendChatRequest(message);
                const reply = response?.reply || response?.data?.reply || "Dạ, chuyên viên KiddieLuxe đã nhận được thông tin và sẽ hỗ trợ mẹ ngay ạ!";
                appendMessage(reply);
            } catch (_error) {
                appendMessage("Xin lỗi ba mẹ, hệ thống đang bận một chút. Bạn có thể gọi trực tiếp hotline 1900 6868 để được tư vấn ngay ạ!");
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createChatWidget);
    } else {
        createChatWidget();
    }
})();
