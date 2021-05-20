/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable operator-linebreak */
/* eslint-disable no-console */
/* eslint-disable camelcase */

const rasa_action_endpoint_url = "http://localhost:5055/webhook";
const rasa_server_url = "http://localhost:5005/webhooks/rest/webhook";
//const IP = "194.126.17.114";
//const rasa_action_endpoint_url = `http://${IP}/webhook`;
//const rasa_server_url = `http://${IP}/webhooks/rest/webhook`;
//const handoff_server_url = `http://${IP}/webhooks/rest/webhook`; // UNUSED Human handoff

const botPic  = "./assets/img/botAvatar.png";
const userPic = "./assets/img/userAvatar.png";

const action_name = "action_utter_greet";
const sender_id = "W-" + uuidv4();

// var handoff = false; UNUSED Human handoff



// Initialization
$(document).ready(() => {
  // Dropdown menu
  $(".dropdown-trigger").dropdown();

  // If the bot starts the conversation 
  showBotTyping();
  $("#userInput").prop("disabled", true);
  customActionTrigger();
});



/**
 * Scrolls to the bottom of the conversation after new message
 */
function scrollToBottomOfChat() {
  const chats = document.getElementById("chats");
  chats.scrollTop = chats.scrollHeight;
}

/**
 * Removes the bot typing indicator from the chat screen
 */
function hideBotTyping() {
  $("#botAvatar").remove();
  $(".botTyping").remove();
}

/**
 * Adds the bot typing indicator to the chat screen
 */
function showBotTyping() {
  const botTyping = `
    <img class="botAvatar" id="botAvatar" src="${botPic}"/>
    <div class="botTyping">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>`;
  $(botTyping).appendTo(".chats");
  $(".botTyping").show();
  scrollToBottomOfChat();
}

/**
 * Sets user response on the chat screen
 * @param {String} message user message
 */
function setUserResponse(message) {
  const user_response =  `
    <img class="userAvatar" src="${userPic}">
    <p class="userMsg">${message}</p>
    <div class="clearfix"></div>`;
  $(user_response).appendTo(".chats").show("fast");

  $(".usrInput").val(""); ''
  scrollToBottomOfChat();
  showBotTyping();
  //$(".suggestions").remove();
}

/**
 * Adds buttons as a bot response
 * @param {Array} suggestions buttons json array
 */
function addSuggestion(suggestions) {
  setTimeout(() => {
    $('<div class="singleCard"><div class="suggestions"><div class="menu"></div></div></div>')
      .appendTo(".chats").hide().fadeIn(500);
    
    for (let i = 0; i < suggestions.length; i += 1) {
      $(`<div class="menuChips" data-payload='${suggestions[i].payload}'>${suggestions[i].title}</div>`)
        .appendTo("#chats .singleCard:last-of-type .suggestions .menu");
    }

    //$("#userInput").prop('disabled', true);
    scrollToBottomOfChat();
  }, 500);
}

/**
 * Renders bot response on to the chat screen (https://rasa.com/docs/rasa/connectors/your-own-website#request-and-response-format)
 * @param {Array} response json array containing different types of bot response
 */
function setBotResponse(response) {
  console.log(response);
  const fadeTime = 500;
  const timeoutTime = 1500;
  
  setTimeout(() => {
    hideBotTyping();
    
    if (response.length < 1) { // There is no response from Rasa
      const fallbackMsg = "I am facing some issues, please try again later.";
      const BotResponse = `
        <img class="botAvatar" src="${botPic}"/>
        <p class="botMsg">${fallbackMsg}</p>
        <div class="clearfix"></div>`;
      
      $(BotResponse).appendTo(".chats").hide().fadeIn(fadeTime);
      scrollToBottomOfChat();
    } else { // Response received from Rasa
      for (let i = 0; i < response.length; i += 1) {
        if (Object.hasOwnProperty.call(response[i], "text")) { // Response contains "text"
          if (response[i].text != null) {
            var formatted_text = response[i].text.replace(/(?:\r\n|\r|\n)/g, '<br>')
            const BotResponse = `
              <img class="botAvatar" src="${botPic}"/>
              <p class="botMsg">${formatted_text}</p>
              <div class="clearfix"></div>`;
            $(BotResponse).appendTo(".chats").hide().fadeIn(fadeTime);
          }
        }

        if (Object.hasOwnProperty.call(response[i], "image")) { // Response contains "images"
          if (response[i].image !== null) {
            const BotResponse = `
              <div class="singleCard">
                <img class="imgcard" src="${response[i].image}">
              </div><div class="clearfix">`;
            $(BotResponse).appendTo(".chats").hide().fadeIn(fadeTime);
          }
        }

        if (Object.hasOwnProperty.call(response[i], "buttons")) { // Response contains "buttons"
          if (response[i].buttons.length > 0) {
            addSuggestion(response[i].buttons);
          }
        }
      }
      scrollToBottomOfChat();
    }
  }, timeoutTime);
}

/**
 * Sends an event to the bot, so that bot can start the conversation with it
 */
// eslint-disable-next-line no-unused-vars
function customActionTrigger() {
  send("Hello");
  $("#userInput").prop('disabled', false);
  /*$.ajax({
    url: rasa_action_endpoint_url,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({next_action: action_name, tracker: {sender_id}}),
    success(botResponse, status) {
      if (Object.hasOwnProperty.call(botResponse, "responses")) {
        setBotResponse(botResponse.responses);
        console.log(JSON.stringify(botResponse));
      }
      $("#userInput").prop("disabled", false);
    },
    error(xhr, textStatus) {
      setBotResponse("");
      console.log("Error from bot end: ", textStatus);
      $("#userInput").prop("disabled", false);
    },
  });*/
}

/**
 * Sends the user message to the Rasa server
 * @param {String} message user message
 */
function send(message) {
  // server_url = handoff ? handoff_server_url : rasa_server_url; // UNUSED Human handoff
  server_url = rasa_server_url;
  
  $.ajax({
    url: server_url,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({message, sender: sender_id}),
    success(botResponse, status) {
      if (message.toLowerCase() === "/restart") { // Restart and clear chat
        $("#userInput").prop("disabled", false);
        customActionTrigger();
        return;
      } /*else if (message.toLowerCase() === "/handoff") { // UNUSED Human handoff
        handoff = true;
        setBotResponse([{"text": "A human will be with you shortly."}])
        return;
      }*/
      setBotResponse(botResponse);
      console.log("Success from bot's end:");
    },
    error(xhr, textStatus) {
      setBotResponse('');
      console.log("Error from bot's end: " + textStatus);
    },
  });
}

/**
 * Clears the conversation from the chat screen and sends the `/restart` event to the Rasa server
 */
function restartConversation() {
  $("#userInput").prop("disabled", true);
  $(".collapsible").remove();

  $(".chats").html("");
  $(".usrInput").val("");
  send("/restart");
}

/**
 * Sends the `/request_human` intent to the Rasa server
 */
 function requestHuman() {
  setUserResponse("I request human assistance.")
  send("/request_human");
}



// User presses Enter key
$(".usrInput").on("keyup keypress", (e) => {
  const keyCode = e.keyCode || e.which;
  const text = $(".usrInput").val();

  if (keyCode === 13) {
    if (text === "" || $.trim(text) === "") {
      e.preventDefault();
      return false;
    }
    
    //$(".suggestions").remove();
    $(".usrInput").blur();

    setUserResponse(text);
    send(text);
    e.preventDefault();
    return false;
  }
  return true;
});

// User presses the "Send" button
$("#sendButton").on("click", (e) => {
  const text = $(".usrInput").val();

  if (text === "" || $.trim(text) === "") {
    e.preventDefault();
    return false;
  }
  
  //$(".suggestions").remove();
  $(".usrInput").blur();

  setUserResponse(text);
  send(text);
  e.preventDefault();
  return false;
});



// Toggle the chatbot screen
$("#profile_div").click(() => {
  $(".profile_div").toggle();
  $(".chat_widget").toggle();
});

// "Clear" button clears the chat contents
$("#clear-chat").click(() => {
  $(".chats").fadeOut("normal", () => {
    $(".chats").html("");
    $(".chats").fadeIn();
  });
});

// "Close" button closes the widget
$("#close-chat").click(() => {
  $(".profile_div").toggle();
  $(".chat_widget").toggle();
  scrollToBottomOfChat();
});

// "Close" arrow closes the widget
$("#close-chat-arrow").click(() => {
  $(".profile_div").toggle();
  $(".chat_widget").toggle();
  scrollToBottomOfChat();
});

// "Restart" button triggers restartConversation function
$("#restart-chat").click(() => {
  restartConversation();
});

// "Request Human" button triggers requestHuman function
$("#handoff-chat").click(() => {
  requestHuman();
});



// On click of the suggestion button, get the title value and send it to Rasa
$(document).on("click", ".menu .menuChips", function () {
  const text = this.innerText;
  const payload = this.getAttribute("data-payload");
  setUserResponse(text);
  send(payload);
  //$(".suggestions").remove();
});