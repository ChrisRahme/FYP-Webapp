<!doctype html>
<!-- rasa run -m models --enable-api --cors "*" --debug -->

<html lang="en">
    <head>
        <link rel="stylesheet" href="assets/css/chatroom.css"/>
        <!--<link rel="stylesheet" href="https://npm-scalableminds.s3.eu-central-1.amazonaws.com/@scalableminds/chatroom@master/dist/Chatroom.css"/>-->
        <link rel="stylesheet" href="assets/css/main.css"/>
    </head>

    <body>
        <h1>Chatbot WebApp</h1>
        <div class="chat-container">
            <!--<script src="assets/js/chatroom.js"/></script>-->
            <script src="https://npm-scalableminds.s3.eu-central-1.amazonaws.com/@scalableminds/chatroom@master/dist/Chatroom.js"/></script>
            <script type="text/javascript">
                var chatroom = new window.Chatroom({
                    host: "http://localhost:5005",
                    title: "Rasa Assistant",
                    container: document.querySelector(".chat-container"),
                    welcomeMessage: "Hi! How may I help you?",
                    //speechRecognition: "en-US",
                    //voiceLang: "en-US"
                });
                chatroom.openChat();
            </script>
        </div>
        
        
    </body>
</html>