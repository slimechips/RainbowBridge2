import rainbowSDK from './rainbow-sdk.min.js';

const sendArea = document.getElementById('sendchatarea');
const agentStatusText = document.getElementById('agent_status');
const sendMessageBtn = document.getElementsByClassName('sendbutton')[0];
const quitBtn = document.getElementsByClassName('quitbutton')[0];
var objDiv = document.getElementsByClassName('chat')[0];
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

var isloading = {
  start: function() {
    if (document.getElementById('wfLoading')) {
      return;
    }
    var ele = document.createElement('div');
    ele.setAttribute('id', 'wfLoading');
    ele.classList.add('loading-layer');
    ele.innerHTML = '<div class="loadingtext">Connecting for Agent<div><span class="loading-wrap"><span class="loading-text"><span>.</span><span>.</span><span>.</span></span></span>';
    document.body.append(ele);

    // Animation
    ele.classList.add('active-loading');
  },
  stop: function() {
    var ele = document.getElementById('wfLoading');
    if (ele) {
      ele.remove();
    }
  }
}
isloading.start();


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
    });
    
    setTimeout(function() {
      setupConvo();
    }, 5000);

};



const setupConvo = () => {
  agentId = localStorage.getItem('agentId')
  guestId = localStorage.getItem('guestId')
  agentName = localStorage.getItem('agentName')
  reqIdG = localStorage.getItem('agentId')
  agentStatusText.innerHTML = agentName;

  console.log('Signing in now');
  username = localStorage.getItem('username');
  email = localStorage.getItem('email');
  category = localStorage.getItem('category');
  browser = localStorage.getItem('browser');

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
  

  setTimeout(function() {
    isloading.stop();
  }, 6000);
};

var scrolled = false;
function updateScroll(){
    if(!scrolled){
        var element = document.getElementById("chat");
        element.scrollTop = element.scrollHeight;
    }
}

$("#chat").on('scroll', function(){
    scrolled=true;
});

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
  objDiv.scrollTop = objDiv.scrollHeight;
};

const agentMessage = (message) => {
  const yourDIV = document.createElement("div");
  yourDIV.innerHTML += `\n ${message} \n`;
  yourDIV.setAttribute("class","yourchat");
  document.getElementsByClassName('chat')[0].appendChild(yourDIV);
  objDiv.scrollTop = objDiv.scrollHeight;
};

const extractMessage = (msg) => {
  return msg.detail.message.data;
}

const sendMessageNetwork = (msg) => {
  if (currentConvo === undefined) return;
  rainbowSDK.im.sendMessageToConversation(currentConvo, msg);
};

const closeConvoNetwork = () => {
  const apiUrl = `http://13.76.87.194:3030/common/closereq/?reqId=${reqIdG}&agentId=${agentId}`;
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
  sendMessageBtn.setAttribute("disabled","disabled");
  sendArea.setAttribute("disabled",true)
  sendArea.disabled=true;
  agentStatusText.innerHTML = "Chat Ended";
  console.log('Closing convo');
};

document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);
document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);  
rainbowSDK.start();
rainbowSDK.load();


