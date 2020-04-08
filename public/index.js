/* Chose one of the import statement below */
import rainbowSDK from './rainbow-sdk.min.js';
// const rainbowSDK = require('rainbow-web-sdk');
 // If you use the bundler (for example - Webpack)
 // Run using ./node_modules/http-server/bin/http-server public/ -p 8887

let chatArea;
const sendArea = document.getElementById('sendchatarea');
const sendMessageBtn = document.getElementsByClassName('sendbutton')[0];
//const categoryDropdown = document.getElementsByClassName('dropdownlist')[0];
const requestButton = document.getElementsByClassName('requestbutton')[0];
// var agentStatusText;
var username = document.getElementById('username_input');
var email = document.getElementById('email_input');
var category_input = document.getElementById('category_input');



const sendClick = () => {
    chatArea.innerHTML += `You: \n ${sendArea.value} \n\n`;
    sendArea.value = '';
};

const requestClick = () => {
    console.log("testttttt");
    console.log('name: ',username.value);
    console.log('email: ',email.value);
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
    console.log("browserID: ",browser);

    localStorage.setItem('username', username.value);
    localStorage.setItem('email', email.value);
    localStorage.setItem('category', category_input.value);
    localStorage.setItem('browser', browser);
    
    window.location.href ="chat.html";
};

if (requestButton !== undefined){
    requestButton.addEventListener('click', requestClick, false);
}
if (sendMessageBtn !== undefined){
    sendMessageBtn.addEventListener('click', sendClick, false);
}