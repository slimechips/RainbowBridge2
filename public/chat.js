import rainbowSDK from './rainbow-sdk.min.js';
console.log("page2");

const myChat = document.getElementById('mychat');
const yourChat = document.getElementById('yourchat');
const chat = document.getElementsByClassName('chat')[0];
const sendArea = document.getElementById('sendchatarea');
const sendMessageBtn = document.getElementsByClassName('sendbutton')[0];
var agentStatusText = document.getElementById('agent_status');
var username;
var email;
var category_input;
let guestId;
let agentId;
let agentName;

const onReady = async () => {

    if (sendMessageBtn){
        sendMessageBtn.addEventListener('click', sendClick, false);
    }
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
};

const sendClick = () => {
    var myDIV = document.createElement("div");

    myDIV.innerHTML += `\n ${sendArea.value} \n`;

    myDIV.setAttribute("class","mychat");
    
    document.getElementsByClassName('chat')[0].appendChild(myDIV);
    sendArea.value = '';
};

const agentMessage = (message) => {
    var yourDIV = document.createElement("div");
    yourDIV.innerHTML += `\n ${message} <\n`;

    yourDIV.setAttribute("id","mychat");
    
    document.getElementsByClassName('chat')[0].appendChild(yourDIV);
};

var getCookie = function(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
};

console.log(getCookie('email'))

email = getCookie('email');
rainbowSDK.connection.signin(email.value, 'Rainbow1!')
.then(res => {
    console.log(res);
    document.addEventListener(rainbowSDK.conversations.RAINBOW_ONCONVERSATIONCHANGED, (msg) => {
        console.log(msg);
        agentMessage(msg);
    })
            // rainbowSDK.im.sendMessageToConversation(conv, "Hilol");
            
})
.catch(err => console.error(err));


console.log("cookie :" + getCookie("agentName"))
agentStatusText.innerHTML = getCookie("agentName");



document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);

document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);
rainbowSDK.start();
rainbowSDK.load();


