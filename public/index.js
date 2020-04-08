/* Chose one of the import statement below */
import rainbowSDK from './rainbow-sdk.min.js';
// const rainbowSDK = require('rainbow-web-sdk');
 // If you use the bundler (for example - Webpack)

const chatArea = document.getElementById('chatarea');
const sendArea = document.getElementById('sendchatarea');
const sendMessageBtn = document.getElementsByClassName('sendbutton')[0];
//const categoryDropdown = document.getElementsByClassName('dropdownlist')[0];
const requestButton = document.getElementsByClassName('requestbutton')[0];

var username = document.getElementById('username_input');
var email = document.getElementById('email_input');
var category_input = document.getElementById('category_input');
let guestId;
let agentId;
let agentName;

const onReady = async () => {
    if (requestButton){
        requestButton.addEventListener('click', requestClick, false);
    }
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
    chatArea.innerHTML += `You: \n ${sendArea.value} \n\n`;
    sendArea.value = '';
};


var setCookie = function(name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp*24*60*60*1000);
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
};

var getCookie = function(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
};

const requestClick = () => {
    console.log("testttttt");
    console.log('name: ',username.value);
    console.log('email: ',email.value);
    setCookie("email",email.value,1);
    console.log('category: ',category_input.value);
    
    // var userAgentInfo = window.navigator.userAgent;
    // console.log(userAgentInfo,"userAgentInfo")
    
    var userAgent = window.navigator.userAgent.toLowerCase(); //크롬일 경우 isChrome에는 Chrome이라는 문잘의 위치 값이 반환되고 크롬이 아닐경우는 //-1이 반환된다. 나머지도 동일 
    var isChrome = userAgent.indexOf('chrome'); 
    var isEdge = userAgent.indexOf('edge'); 
    var isIE = userAgent.indexOf('trident'); 
    var browser = 'bnbn';
    if(isChrome > -1){ 
        if(isEdge > -1){ //Edge는 Chrome과 Edge 모두의 값을 가지고 있기 때문에 
            browser = 'edge';
            //alert("Edge 브라우저"); 
        } else { 
            browser = 'chrome';
            //alert("Chrome 브라우저"); 
        } 
    } else { 
        browser = 'ie';
        //alert("Chrome이 아닙니다"); 
    }
    console.log("browserID: ",browser)
    

    
    // TODO: Add http call to request for agent
    const body = JSON.stringify({
        support_req: {
            name: username.value,
            email: email.value,
            reqId: "ayylmao",
            browserId: browser,
            category: category_input.value
        }
    })
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
        console.log(html)
        
        if (html.error == 'Adding support req failed'){
            console.log("No Available Agent")
            setCookie("agentName", "No Available Agent", 1);
            console.log("cookie :" + getCookie("agentavail"))
            // agentStatusText.innerHTML = "No Available Agent";
        }else{
            agentId = html.support_req.agentId;
            setCookie('agentId',html.support_req.agentId,1);
            guestId = html.support_req.guestId;
            setCookie('guestId',html.support_req.guestId,1);
            agentName = html.support_req.agentName;
            setCookie('agentName',html.support_req.agentName,1);
            // agentStatusText.innerHTML = agentName;
        }
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
    });
    // alert("Connecting to Agent");
    window.location ="chat.html";
    
    
};


    
    


const agentMessage = (message) => {
    chatArea.innerHTML += `Agent: \n ${message} \n\n`;
};

document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);

document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);
rainbowSDK.start();
rainbowSDK.load();