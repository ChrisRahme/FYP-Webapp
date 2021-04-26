/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable operator-linebreak */
/* eslint-disable no-console */
/* eslint-disable camelcase */

// const rasa_action_endpoint_url = "http://localhost:5055/webhook";
// const rasa_server_url = "http://localhost:5005/webhooks/rest/webhook";
const IP = "194.126.17.114";
const rasa_action_endpoint_url = `http://${IP}/webhook`;
const rasa_server_url = `http://${IP}/webhooks/rest/webhook`;
const handoff_server_url = `http://${IP}/webhooks/rest/webhook`;


const botPic  = "./assets/img/botAvatar_rasa.png";
const userPic = "./assets/img/userAvatar.jpg";

const action_name = "action_utter_greet";
const sender_id = "W-" + uuidv4();

var handoff = false;



// Initialization
$(document).ready(() => {
  // Dropdown menu
  $(".dropdown-trigger").dropdown();
  
  // Initiate the modal for displaying charts
  $(".modal").modal();

  // If the bot starts the conversation 
  showBotTyping();
  $("#userInput").prop('disabled', true);
  customActionTrigger();
});



/**
 * Scrolls to the bottom of the conversation after new message
 */
function scrollToBottomOfChat() {
  const terminalResultsDiv = document.getElementById("chats");
  terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
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

  $(".usrInput").val("");
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
 * Creates horizontally placed cards carousel
 * @param {Array} cardsData json array
 */
function createCardsCarousel(cardsData) {
  let cards = "";
  for (let i = 0; i < cardsData.length; i += 1) {
    const title = cardsData[i].name;
    const ratings = `${Math.round((cardsData[i].ratings / 5) * 100)}%`;
    const item = `
      <div class="carousel_cards in-left">
        <img class="cardBackgroundImage" src="${cardsData[i].image}">
        <div class="cardFooter">
          <span class="cardTitle" title="${title}">${title}</span>
          <div class="cardDescription">
            <div class="stars-outer">
              <div class="stars-inner" style="width:${ratings}">
              </div>
            </div>
          </div>
        </div>
      </div>`;

    cards += item;
  }
  const cardContents = `
    <div id="paginated_cards" class="cards">
      <div class="cards_scroller">
        ${cards}
        <span class="arrow prev fa fa-chevron-circle-left "></span>
        <span class="arrow next fa fa-chevron-circle-right" ></span>
      </div>
    </div>`;
  return cardContents;
}

/**
 * Appends cards carousel on to the chat screen
 * @param {Array} cardsToAdd json array
 */
function showCardsCarousel(cardsToAdd) {
  const cards = createCardsCarousel(cardsToAdd);

  $(cards).appendTo(".chats").show();

  if (cardsToAdd.length <= 2) {
    $(`.cards_scroller 0 > div.carousel_cards:nth-of-type(${i})`).fadeIn(3000);
  } else {
    for (let i = 0; i < cardsToAdd.length; i += 1) {
      $(`.cards_scroller > div.carousel_cards:nth-of-type(${i})`).fadeIn(3000);
    }
    $(".cards .arrow.prev").fadeIn("3000");
    $(".cards .arrow.next").fadeIn("3000");
  }

  scrollToBottomOfChat();

  const card = document.querySelector("#paginated_cards");
  const card_scroller = card.querySelector(".cards_scroller");
  const card_item_size = 225;

  /**
   * For paginated scrolling, simply scroll the card one item in the given
   * direction and let CSS scroll snaping handle the specific alignment.
   */
  function scrollToNextPage() {
    card_scroller.scrollBy(card_item_size, 0);
  }

  function scrollToPrevPage() {
    card_scroller.scrollBy(-card_item_size, 0);
  }

  card.querySelector(".arrow.next").addEventListener("click", scrollToNextPage);
  card.querySelector(".arrow.prev").addEventListener("click", scrollToPrevPage);
}

/**
 * Appends horizontally placed buttons carousel to the chat screen
 * @param {Array} quickRepliesData json array
 */
function showQuickReplies(quickRepliesData) {
  let chips = "";
  for (let i = 0; i < quickRepliesData.length; i += 1) {
    const chip = `
      <div class="chip" data-payload='${quickRepliesData[i].payload}'>
        ${quickRepliesData[i].title}
      </div>`;
    chips += chip;
  }

  const quickReplies = `<div class="quickReplies">${chips}</div><div class="clearfix"></div>`;
  $(quickReplies).appendTo(".chats").fadeIn(1000);
  scrollToBottomOfChat();

  const slider = document.querySelector(".quickReplies");
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("active");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.classList.remove("active");
  });
  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.classList.remove("active");
  });
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 3; // scroll-fast
    slider.scrollLeft = scrollLeft - walk;
  });
}

/**
 * Renders PDF attachment on the chat screen
 * @param {Object} pdf_data json object
 */
function renderPdfAttachment(pdf_data) {
  const {url: pdf_url} = pdf_data.custom;
  const {title: pdf_title} = pdf_data.custom;
  const pdf_attachment = `
    <div class="pdf_attachment">
      <div class="row">
        <div class="col s3 pdf_icon">
          <i class="fa fa-file-pdf-o" aria-hidden="true"></i>
        </div>
        <div class="col s9 pdf_link">
          <a href="${pdf_url}" target="_blank">${pdf_title}</a>
        </div>
      </div>
    </div>`;

  $(".chats").append(pdf_attachment);
  scrollToBottomOfChat();
}

/**
 * Renders the dropdown message and handles the user selection
 * @param {Array} drop_down_data json array
 */
function renderDropDwon(drop_down_data) {
  let drop_down_options = "";
  for (let i = 0; i < drop_down_data.length; i += 1) {
    drop_down_options += `
      <option value="${drop_down_data[i].value}">
        ${drop_down_data[i].label}
      </option>`;
  }
  const drop_down_select = `
    <div class="dropDownMsg">
      <select class="browser-default dropDownSelect">
        <option value="" disabled selected>Choose your option</option>
        ${drop_down_options}
      </select>
    </div>`;
  
  $(".chats").append(drop_down_select);
  scrollToBottomOfChat();

  // Add event handler if user selects a option
  // eslint-disable-next-line func-names
  $("select").on("change", function () {
    let value = "";
    let label = "";
    $("select option:selected").each(() => {
      label += $(this).val();
      value += $(this).val();
    });

    setUserResponse(label);
    // eslint-disable-next-line no-use-before-define
    send(value);
    $(".dropDownMsg").remove();
  });
}

/**
 * Sends the user location to Rasa
 * @param {Object} position json object
 */
function getUserPosition(position) {
  // Add the intent to trigger
  const response = `/inform{"latitude":${position.coords.latitude},"longitude":${position.coords.longitude}}`;
  $("#userInput").prop("disabled", false);
  // eslint-disable-next-line no-use-before-define
  send(response);
  showBotTyping();
}

/**
 * Handles error while accessing the user's geolocation
 * @param {Object} error json object
 */
function handleLocationAccessError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("An unknown error occurred.");
      break;
    default:
      break;
  }

  const response = '/inform{"user_location":"deny"}';
  // eslint-disable-next-line no-use-before-define
  send(response);
  showBotTyping();
  $(".usrInput").val("");
  $("#userInput").prop("disabled", false);
}

/**
 * Fetches the user location from the browser
 */
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      getUserPosition,
      handleLocationAccessError
    );
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

/**
 * Creates collapsible (https://materializecss.com/collapsible.html)
 * @param {Array} collapsible_date json array
 */
function createCollapsible(collapsible_data) {
  // Sample data format:
  // var collapsible_data = [{"title":"abc","description":"xyz"},{"title":"pqr","description":"jkl"}]
  let collapsible_list = "";
  for (let i = 0; i < collapsible_data.length; i += 1) {
    const collapsible_item = `
      <li>
        <div class="collapsible-header">
          ${collapsible_data[i].title}
        </div>
        <div class="collapsible-body">
          <span>${collapsible_data[i].description}</span>
        </div>
      </li>`;

    collapsible_list += collapsible_item;
  }
  const collapsible_contents = `<ul class="collapsible">${collapsible_list}</ul>`;
  $(collapsible_contents).appendTo(".chats");

  // Initialize the collapsible
  $(".collapsible").collapsible();
  scrollToBottomOfChat();
}

/**
 *  Creates a div that will render the charts in canvas as required by charts.js (https://chartjs.org/docs/latest/getting-started/usage.html)
 * @param {String} title chart title
 * @param {Array} labels chart label
 * @param {Array} backgroundColor chart's background color
 * @param {Object} chartsData chart's data
 * @param {String} chartType chart type
 * @param {String} displayLegend chart's legend
 */
function createChart(title, labels, backgroundColor, chartsData, chartType, displayLegend) {
  const html = `
    <div class="chart-container">
      <span class="modal-trigger" id="expand" title="expand" href="#modal1">
        <i class="fa fa-external-link" aria-hidden="true"></i>
      </span>
      <canvas id="chat-chart" ></canvas>
    </div>
    <div class="clearfix"></div>`;
  $(html).appendTo(".chats");

  // Context that will draw the charts over the canvas in the ".chart-container" div
  const ctx = $("#chat-chart");

  // Instantiate chart-type by passing the configuration (https://chartjs.org/docs/latest/configuration)
  const data = {
    labels,
    datasets: [
      {
        label: title,
        backgroundColor,
        data: chartsData,
        fill: false,
      },
    ],
  };
  const options = {
    title: {
      display: true,
      text: title,
    },
    layout: {
      padding: {
        left: 5,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    legend: {
      display: displayLegend,
      position: "right",
      labels: {
        boxWidth: 5,
        fontSize: 10,
      },
    },
  };

  // Draw the chart by passing the configuration
  // eslint-disable-next-line no-undef
  chatChart = new Chart(ctx, {type: chartType, data, options});

  scrollToBottomOfChat();
}

/**
 * Creates a modal that will render the charts in canvas as required by charts.js (https://www.chartjs.org/docs/latest/getting-started/usage.html)
 * If you want to display the charts in modal, make sure you have configured the modal in `index.html`
 * @param {String} title chart title
 * @param {Array} labels chart label
 * @param {Array} backgroundColor chart's background color
 * @param {Object} chartsData chart's data
 * @param {String} chartType chart type
 * @param {String} displayLegend chart's legend
 */
function createChartinModal(title, labels, backgroundColor, chartsData, chartType, displayLegend) {
  // Context that will draw the charts over the canvas in the ".chart-container" div
  const ctx = $("#modal-chart");

  // Instantiate chart-type by passing the configuration (https://chartjs.org/docs/latest/configuration)
  const data = {
    labels,
    datasets: [
      {
        label: title,
        backgroundColor,
        data: chartsData,
        fill: false,
      },
    ],
  };
  const options = {
    title: {
      display: true,
      text: title,
    },
    layout: {
      padding: {
        left: 5,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    legend: {
      display: displayLegend,
      position: "right",
    },
  };

  // eslint-disable-next-line no-undef
  modalChart = new Chart(ctx, {type: chartType, data, options});
}

/**
 * Renders bot response on to the chat screen (https://rasa.com/docs/rasa/connectors/your-own-website#request-and-response-format)
 * @param {Array} response json array containing different types of bot response
 */
function setBotResponse(response) {
  const fadeTime = 500;
  const timeoutTime = handoff ? 3000 : 500 // 600000

  setTimeout(() => {
    hideBotTyping();
    if (response.length < 1) { // There is no response from Rasa or human
      const fallbackMsg = "I am facing some issues, please try again later.";
      const BotResponse = `
        <img class="botAvatar" src="${botPic}"/>
        <p class="botMsg">${fallbackMsg}</p>
        <div class="clearfix"></div>`;

      $(BotResponse).appendTo(".chats").hide().fadeIn(fadeTime);
      scrollToBottomOfChat();
    } else { // Response received from Rasa or human
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

        /*if (Object.hasOwnProperty.call(response[i], "response")) { // Response contains "response"
          if (response[i].response != null) {
            var formatted_text = response[i].response.replace(/(?:\r\n|\r|\n)/g, '<br>') // TODO Now only prints response name
            const BotResponse = `
              <img class="botAvatar" src="${botPic}"/>
              <p class="botMsg">${formatted_text}</p>
              <div class="clearfix"></div>`;
            $(BotResponse).appendTo(".chats").hide().fadeIn(fadeTime);
          }
        }*/

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
            console.log(response[i].buttons);
          }
        }

        if (Object.hasOwnProperty.call(response[i], "attachment")) { // Response contains "attachment"
          if (response[i].attachment != null) {
            if (response[i].attachment.type === "video") { // Attachment type is "video"
              const BotResponse = `
                <div class="video-container">
                  <iframe src="${response[i].attachment.payload.src}" frameborder="0" allowfullscreen></iframe>
                </div>`;
              $(BotResponse).appendTo(".chats").hide().fadeIn(fadeTime);
            }
          }
        }
        
        if (Object.hasOwnProperty.call(response[i], "custom")) { // Response contains "custom"
          const { payload } = response[i].custom;
          if (payload === "quickReplies") { // Custom payload type is "quickReplies"
            const quickRepliesData = response[i].custom.data;
            showQuickReplies(quickRepliesData);
            return;
          }

          if (payload === "pdf_attachment") { // Custom payload type is "pdf_attachment"
            renderPdfAttachment(response[i]);
            return;
          }

          if (payload === "dropDown") { // Custom payload type is "dropDown"
            const dropDownData = response[i].custom.data;
            renderDropDwon(dropDownData);
            return;
          }

          if (payload === "location") { // Custom payload type is "location"
            $("#userInput").prop("disabled", true);
            getLocation();
            scrollToBottomOfChat();
            return;
          }

          if (payload === "cardsCarousel") { // Custom payload type is "cardsCarousel"
            const restaurantsData = response[i].custom.data;
            showCardsCarousel(restaurantsData);
            return;
          }

          if (payload === "chart") { // Custom payload type is "chart"
            // Sample format of the charts data:
            // var chartData =  {
            //  "title": "Leaves",
            //  "labels": ["Sick Leave", "Casual Leave", "Earned Leave", "Flexi Leave"],
            //  "backgroundColor": ["#36a2eb", "#ffcd56", "#ff6384", "#009688", "#c45850"],
            //  "chartsData": [5, 10, 22, 3],
            //  "chartType": "pie",
            //  "displayLegend": "true"}

            const chartData = response[i].custom.data;
            const {title, labels, backgroundColor, chartsData, chartType, displayLegend} = chartData;

            createChart(title, labels, backgroundColor, chartsData, chartType, displayLegend);

            // On click of the expand button, render the chart in the charts modal
            $(document).on("click", "#expand", () => {
              createChartinModal(title, labels, backgroundColor, chartsData, chartType, displayLegend);
            });
            return;
          }

          if (payload === "collapsible") { // Custom payload type is "collapsible"
            const {data} = response[i].custom;
            createCollapsible(data);
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
  server_url = handoff ? handoff_server_url : rasa_server_url;

  $.ajax({
    url: server_url,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ message, sender: sender_id }),
    success(botResponse, status) {
      if (message.toLowerCase() === "/restart") { // Restart and clear chat
        $("#userInput").prop("disabled", false);
        customActionTrigger();
        return;
      } else if (message.toLowerCase() === "/handoff") { // Human handoff
        handoff = true;
        setBotResponse([{"text": "A human will be with you shortly."}])
        return;
      }
      setBotResponse(botResponse);
    },
    error(xhr, textStatus) {
      setBotResponse("");
      console.log("Error from bot end: ", textStatus);
    },
  });
}

/**
 * Clears the conversation from the chat screen and sends the `/restart` event to the Rasa server
 */
function restartConversation() {
  $("#userInput").prop("disabled", true);
  $(".collapsible").remove();
  

  if (typeof chatChart !== "undefined") {
    chatChart.destroy();
  }

  $(".chart-container").remove();

  if (typeof modalChart !== "undefined") {
    modalChart.destroy();
  }

  $(".chats").html("");
  $(".usrInput").val("");
  send("/restart");
}



// "Restart" button triggers restartConversation function
$("#restart").click(() => {
  restartConversation();
});

// User presses Enter key
$(".usrInput").on("keyup keypress", (e) => {
  const keyCode = e.keyCode || e.which;

  const text = $(".usrInput").val();
  if (keyCode === 13) {
    if (text === "" || $.trim(text) === "") {
      e.preventDefault();
      return false;
    }
    // Destroy the existing chart; if you are not using charts, comment the below lines
    $(".collapsible").remove();
    $(".dropDownMsg").remove();
    if (typeof chatChart !== "undefined") {
      chatChart.destroy();
    }

    $(".chart-container").remove();
    if (typeof modalChart !== "undefined") {
      modalChart.destroy();
    }

    $("#paginated_cards").remove();
    //$(".suggestions").remove();
    $(".quickReplies").remove();
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
  // Destroy the existing chart; if you are not using charts, comment the below lines
  if (typeof chatChart !== "undefined") {
    chatChart.destroy();
  }

  $(".chart-container").remove();
  if (typeof modalChart !== "undefined") {
    modalChart.destroy();
  }

  //$(".suggestions").remove();
  $("#paginated_cards").remove();
  $(".quickReplies").remove();
  $(".usrInput").blur();
  $(".dropDownMsg").remove();
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
$("#clear").click(() => {
  $(".chats").fadeOut("normal", () => {
    $(".chats").html("");
    $(".chats").fadeIn();
  });
});

// "Close" button closes the widget
$("#close").click(() => {
  $(".profile_div").toggle();
  $(".chat_widget").toggle();
  scrollToBottomOfChat();
});

// On click of quickReplies, get the payload value and send it to Rasa
$(document).on("click", ".quickReplies .chip", function () {
  const text = this.innerText;
  const payload = this.getAttribute("data-payload");
  setUserResponse(text);
  send(payload);
  $(".quickReplies").remove();
});

// On click of the suggestion button, get the title value and send it to Rasa
$(document).on("click", ".menu .menuChips", function () {
  const text = this.innerText;
  const payload = this.getAttribute("data-payload");
  setUserResponse(text);
  send(payload);
  //$(".suggestions").remove();
});