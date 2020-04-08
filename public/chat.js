import rainbowSDK from './rainbow-sdk.min.js';

const sendArea = document.getElementById('sendchatarea');
const agentStatusText = document.getElementById('agent_status');
const chatArea = document.getElementById('chatarea');
const sendMessageBtn = document.getElementsByClassName('sendbutton')[0];
let guestId;
let agentId;
let agentName;
let currentConvo;

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
      const username = localStorage.getItem('username');
      const email = localStorage.getItem('email');
      const category = localStorage.getItem('category');
      const browser = localStorage.getItem('browser');
  
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
  chatArea.innerHTML += `YOU: \n ${sendArea.value} \n\n`;
  sendMessageNetwork(sendArea.value);
  sendArea.value = '';
};

const agentMessage = (message) => {
  chatArea.innerHTML += `Agent: \n ${message} \n\n`;
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