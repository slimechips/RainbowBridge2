import rainbowSDK from './rainbow-sdk.min.js';

const myChat = document.getElementById('mychat');
const yourChat = document.getElementById('yourchat');
const chat = document.getElementsByClassName('chat')[0];
const sendArea = document.getElementById('sendchatarea');
const agentStatusText = document.getElementById('agent_status');
const sendMessageBtn = document.getElementsByClassName('sendbutton')[0];
let guestId;
let agentId;
let agentName;
let currentConvo;
let username;
let email;
let category;
let browser;

const onReady = async () => {

};

var onLoaded = function onLoaded() {
  console.log('[Hello World] :: On SDK Loaded !');

  rainbowSDK
    .initialize('843d81a06c2311eaa8fbfb2c1e16e226', '0iV19xt6OdGoQb2N9V1Evp1KKkOV9FHRIn8c9bEOFixcwzKwDB3xWAGp1MVmWEkg')
    .then(() => {
        console.log('[Hello World] :: Rainbow SDK is initialized!');
        /*
        rainbowSDK.contacts.searchById(id)
        .then((contact) => {
            console.log(contact);
        })
        .catch(err => {
            console.log(err);
        });
        */
    })
    .catch(err => {
        console.log('[Hello World] :: Something went wrong with the SDK.', err);
    }).then(() => {
      username = localStorage.getItem('username');
      email = localStorage.getItem('email');
      category = localStorage.getItem('category');
      browser = localStorage.getItem('browser');
  
      // TODO: Add http call to request for agent
      const body = JSON.stringify({
          support_req: {
              name: username,
              email,
              reqId: "ayylmao",
              browserId: browser,
              category,
          }
      });
  
      fetch("http://localhost:3030/user/newsupportreq", {
          method: "POST",
          body,
          headers: {
              'Content-Type': 'application/json'
          }
      }).then((response) => response.text())
      .then(htmltext => {
          console.log(htmltext);
          const html = JSON.parse(htmltext);
          console.log(html);
  
          
          if (html.error == 'Adding support req failed'){
              console.log("No Available Agent");
              return;
          } else {
              agentId = html.support_req.agentId;
              guestId = html.support_req.guestId;
              agentName = html.support_req.agentName;
              agentStatusText.innerHTML = agentName;
              // localStorage.setItem("agent_name", agentName);
              // localStorage.setItem("rainbow_sdk", rainbowSDK);
          }
          console.log('Signing in now');
          rainbowSDK.connection.signin(email, 'Rainbow1!')
          .then((res) => {
              console.log(res);
              return rainbowSDK.contacts.searchById(agentId);
          })
          .then(contact => {
            console.log(contact);
            return rainbowSDK.conversations.openConversationForContact(contact);
          })
          .then(conv => {
            console.log(conv);
            currentConvo = conv;
            return rainbowSDK.im.sendMessageToConversation(conv, 'I am the customer hi');
          })
          .then(res => {
            console.log(res);
            document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, (msg, conv, cc) => {
              console.log("ON IM RECIEVED");
              console.log(JSON.stringify(msg));
              console.log(conv);
              console.log(cc);
              agentMessage(extractMessage(msg));
            });
            sendMessageBtn.addEventListener('click', sendClick, false);  
          })
          .catch((err => console.error(err)));
              // rainbowSDK.im.sendMessageToConversation(conv, "Hilol");
              
      })
      .catch(err => console.error(err));
      // alert("Connecting to Agent");
  
    });

};

const sendClick = () => {
  displayMyMessage(sendArea.value);
  sendMessageNetwork(sendArea.value);
  sendArea.value = '';
};

const displayMyMessage = (msg) => {
  const myDIV = document.createElement("div");
  myDIV.innerHTML += `\n ${msg} \n`;
  myDIV.setAttribute("class","mychat");
  document.getElementsByClassName('chat')[0].appendChild(myDIV);
};

const agentMessage = (message) => {
  const yourDIV = document.createElement("div");
  yourDIV.innerHTML += `\n ${message} \n`;

  yourDIV.setAttribute("class","yourchat");
  
  document.getElementsByClassName('chat')[0].appendChild(yourDIV);
};

const extractMessage = (msg) => {
  return msg.detail.message.data;
}

const sendMessageNetwork = (msg) => {
  if (currentConvo === undefined) return;
  rainbowSDK.im.sendMessageToConversation(currentConvo, msg);
};

document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);

document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);
rainbowSDK.start();
rainbowSDK.load();
