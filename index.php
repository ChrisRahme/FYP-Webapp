<!doctype html>
<!-- rasa run -m models --enable-api --cors "*" --debug -->

<html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link rel="stylesheet" href="assets/css/chatroom.css"/>
        <!--<link rel="stylesheet" href="https://npm-scalableminds.s3.eu-central-1.amazonaws.com/@scalableminds/chatroom@master/dist/Chatroom.css"/>-->
        <link rel="stylesheet" href="assets/css/main.css"/>
    </head>

    <body>
        <h1>Chatbot WebApp</h1>

        <div class="chat-container">
            <script src="assets/js/chatroom.js"/></script>
            <!--<script src="https://npm-scalableminds.s3.eu-central-1.amazonaws.com/@scalableminds/chatroom@master/dist/Chatroom.js"/></script>-->
            <script type="text/javascript">
                var chatroom = new window.Chatroom({
                    host: "http://localhost:5005",
                    title: "Rasa Assistant",
                    container: document.querySelector(".chat-container"),
                    welcomeMessage: "Hi, I’m GDS automated virtual assistant. How can I help you today?",
                    //speechRecognition: "en-US",
                    //voiceLang: "en-US"
                });
                chatroom.openChat();
            </script>
        </div>

        <div>
            <script>!(function () {
                let e = document.createElement("script"),
                    t = document.head || document.getElementsByTagName("head")[0];
                (e.src =
                    "https://cdn.jsdelivr.net/npm/rasa-webchat/lib/index.js"),
                    (e.async = !0),
                    (e.onload = () => {
                    window.WebChat.default(
                        {
                            customData: { language: "en" },
                            socketUrl: "https://bf-botfront.development.agents.botfront.cloud",
                            title: "Rasa Assistant",
                            subtitle: ""
                        },
                        null
                    );
                    }),
                    t.insertBefore(e, t.firstChild);
                })();
            </script>
        </div>
        
        <h2>To start the servers:</h2>
        <p>rasa run actions --cors "*"</p>
        <p>rasa run --enable-api --cors "*" --debug</p>
        
        <h2>GitHub repos:</h2>
        <p>Chatroom: https://github.com/scalableminds/chatroom</p>
        <p>Webchat: https://github.com/botfront/rasa-webchat</p>

    </body>
</html>