import rainbowSDK from './rainbow-sdk.min.js';

const myChat = document.getElementById('mychat');
const yourChat = document.getElementById('yourchat');
const chat = document.getElementsByClassName('chat')[0];
const sendArea = document.getElementById('sendchatarea');
const agentStatusText = document.getElementById('agent_status');
const sendMessageBtn = document.getElementsByClassName('sendbutton')[0];
const quitBtn = document.getElementsByClassName('quitbutton')[0];
let guestId;
let agentId;
let agentName;
let currentConvo;
let reqIdG;
let username;
let email;
let category;
let browser;
let checkIntervalTimer;

const onReady = async () => {
  quitBtn.addEventListener('click', closeConvoNetwork, false);
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
      }).then((response) => {
        return response.text();
      })
      .then(htmltext => {
        setupConvo(htmltext);
        checkIntervalTimer = setInterval(() => {
          checkConvoStatusNetwork(reqIdG);
        }, 5000);
      })
      .catch((err) => {
        console.error(err);
        pollForSupportRequest(email);
      });
      // alert("Connecting to Agent");
  
    });

};

const pollForSupportRequest = (email) => {
  const apiUrl = `http://localhost:3030/common/reqstatus?email=${email}`;
  fetch(apiUrl)
    .then((response) => {
      if (response.status >= 400) {
        throw new Error('Error requesting status');
      }
      return response.text();
    })
    .then((htmlText) => {
      if (!htmlText.active) {
        setTimeout(() => {
          pollForSupportRequest(email);
        }, 5000);
        throw new Error('Support Req not avail yet');
      }
      setupConvo(htmlText);              
    })
    .catch(console.error);
};

const setupConvo = (htmlText) => {
  const html = JSON.parse(htmlText);
  agentId = html.support_req.agentId;
  guestId = html.support_req.guestId;
  agentName = html.support_req.agentName;
  reqIdG = html.support_req.reqId;
  agentStatusText.innerHTML = agentName;
  // localStorage.setItem("agent_name", agentName);
  // localStorage.setItem("rainbow_sdk", rainbowSDK);
      
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

const checkConvoStatusNetwork = (reqId) => {
  const apiUrl = `http://localhost:3030/common/reqstatus?reqId=${reqId}`;
  fetch(apiUrl)
    .then((response) => {
      if (response.status >= 400) {
        throw new Error('Failed to check status');
      }
      return response.text();
    })
    .then((htmlText) => {
      console.log(htmlText);
      const html = JSON.parse(htmlText);
      const { active } = html;
      if (!active) {
        clearInterval(checkIntervalTimer);
        closeConvo();
      }
    })
    .catch(console.error);
};

const closeConvoNetwork = () => {
  const apiUrl = `http://localhost:3030/common/closereq/?reqId=${reqIdG}&agentId=${agentId}`;
  clearInterval(checkIntervalTimer);
  fetch(apiUrl)
    .then((response) => response.text())
    .then((htmlText) => {
      console.log(htmlText);
    })
    .catch(console.error)
    .finally(() => closeConvo());
};

const closeConvo = () => {
  // TODO: Close convo
  console.log('Closing convo');
};

document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);

document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);
rainbowSDK.start();
rainbowSDK.load();
