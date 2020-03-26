/* Chose one of the import statement below */
import rainbowSDK from './rainbow-sdk.min.js';
// const rainbowSDK = require('rainbow-web-sdk');
 // If you use the bundler (for example - Webpack)

const chatArea = document.getElementById('chatarea');
const sendArea = document.getElementById('sendchatarea');
const sendMessageBtn = document.getElementsByClassName('sendbutton')[0];
const categoryDropdown = document.getElementsByClassName('dropdownlist')[0];
const requestButton = document.getElementsByClassName('requestbutton')[0];
const agentStatusText = document.getElementsByClassName('agent_status')[0];

const onReady = async () => {
    sendMessageBtn.addEventListener('click', sendClick, false);
    requestButton.addEventListener('click', requestClick, false);

    var myRainbowLogin = "noahlrd1995@gmail.com";       // Replace by your login
    var myRainbowPassword = "Dmc4life!"; // Replace by your password
    var timeToLive = 600;
    
    // The SDK for Web is ready to be used, so you can sign in
    let account = await rainbowSDK.connection.signin(myRainbowLogin, myRainbowPassword)
        console.log(rainbowSDK.admin);
          // Successfully signed to Rainbow and the SDK is started completely. Rainbow data can be retrieved.
          /*rainbowSDK.admin.createAnonymousGuestUser(timeToLive).then((guest_user)=> {
              console.log(guest_user);
          }).catch(err=>{console.log(err);})*/
    let contact = await rainbowSDK.contacts.searchById('5e7b64f735c8367f99b8f2a5');
        console.log(contact);
    let conv = await rainbowSDK.conversations.openConversationForContact(contact);
        console.log(conv);
    let obj = await rainbowSDK.im.sendMessageToConversation(conv, 'Test2')
    console.log(obj.data);
};

var onLoaded = function onLoaded() {
    console.log('[Hello World] :: On SDK Loaded !');

    rainbowSDK
        .initialize('88aaae506e6911ea88b46f998ddae648', 'hxw0CY4TnZ1SmXE6iUySdJ8IFXAHEGm7sTG1h41pHxRTrtIEzfyNmzjvhGqVcmey')
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
    chatArea.innerHTML += `You: \n ${sendArea.value} \n\n`;
    sendArea.value = '';
};

const requestClick = () => {
    // TODO: Add http call to request for agent
    
};

const agentMessage = (message) => {
    chatArea.innerHTML += `Agent: \n ${message} \n\n`;
};

document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);

document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);
rainbowSDK.start();
rainbowSDK.load();