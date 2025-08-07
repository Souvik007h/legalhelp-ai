let currentSessionId = null; // For storing the session

/**
 * Sets the user input field with the text from a suggestion card.
 */
function setIssue(text) {
  document.getElementById("userInput").value = text;
}

/**
 * Formats a bot's plain text response into structured HTML.
 */
function formatBotResponse(text) {
  const paragraphs = text.split("\n").filter((p) => p.trim() !== "");
  let html = "";
  let inList = false;

  paragraphs.forEach((paragraph) => {
    let formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    if (/^\d+\.\s/.test(formattedParagraph)) {
      if (!inList) {
        html += "<ol>";
        inList = true;
      }
      html += `<li>${formattedParagraph.replace(/^\d+\.\s/, "")}</li>`;
    } else {
      if (inList) {
        html += "</ol>";
        inList = false;
      }
      html += `<p>${formattedParagraph}</p>`;
    }
  });

  if (inList) html += "</ol>";

  return html;
}

/**
 * Greets the user with a welcome message from the bot.
 */
async function welcome() {
  const chatbox = document.getElementById("chatbox");

  try {
    const response = await fetch("/welcome", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    if (response.ok && data.response) {
      const formattedBotHtml = formatBotResponse(data.response);
      chatbox.innerHTML += `
        <div class="bot-msg">
          <strong>🤖 Bot</strong>
          <div class="bot-response-content">${formattedBotHtml}</div>
        </div>`;
    } else {
      chatbox.innerHTML += `
        <div class="bot-msg error">
          <strong>Error:</strong>
          <p>${data.error || "Something went wrong!"}</p>
        </div>`;
    }
  } catch (error) {
    chatbox.innerHTML += `
      <div class="bot-msg error">
        <strong>Error:</strong>
        <p>Could not connect to the server. Please check your network.</p>
      </div>`;
  }

  chatbox.scrollTop = chatbox.scrollHeight;
}

/**
 * Sends the user's message to the backend and displays the response.
 */
async function sendMessage() {
  const userInputField = document.getElementById("userInput");
  const userMessage = userInputField.value.trim();
  const chatbox = document.getElementById("chatbox");

  if (!userMessage) {
    alert("Please describe your issue or ask a question.");
    return;
  }

  let requestBody = {
    message: userMessage,
    session_id: currentSessionId,
  };

  if (!currentSessionId) {
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value.trim();
    const gender = document.getElementById("gender").value;

    if (!name || !age || !gender) {
      alert("Please enter your name, age, and gender to start the chat.");
      return;
    }

    requestBody.name = name;
    requestBody.age = age;
    requestBody.gender = gender;
  }

  // Display user message
  chatbox.innerHTML += `
    <div class="user-msg">
      <strong>👨 You</strong>
      <p>${userMessage}</p>
    </div>`;

  userInputField.value = "";
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok && data.response) {
      if (data.session_id) currentSessionId = data.session_id;

      const formattedHtml = formatBotResponse(data.response);
      chatbox.innerHTML += `
        <div class="bot-msg">
          <strong>🤖 Bot</strong>
          <div class="bot-response-content">${formattedHtml}</div>
        </div>`;
    } else {
      chatbox.innerHTML += `
        <div class="bot-msg error">
          <strong>Error:</strong>
          <p>${data.error || "Something went wrong!"}</p>
        </div>`;
    }
  } catch (error) {
    chatbox.innerHTML += `
      <div class="bot-msg error">
        <strong>Error:</strong>
        <p>Could not connect to the server. Please check your network.</p>
      </div>`;
  }

  chatbox.scrollTop = chatbox.scrollHeight;
}

/**
 * Enable Enter key to send messages.
 */
document.getElementById("userInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

/**
 * Initialize welcome message on page load.
 */
window.onload = function () {
  welcome();
};
