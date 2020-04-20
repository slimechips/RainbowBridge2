// import rainbowSDK from './rainbow-sdk.min.js';
/* Chose one of the import statement below */
// const rainbowSDK = require('rainbow-web-sdk');
 // If you use the bundler (for example - Webpack)
 // Run using ./node_modules/http-server/bin/http-server public/ -p 8887

//const categoryDropdown = document.getElementsByClassName('dropdownlist')[0];
const requestButton = document.getElementsByClassName('requestbutton')[0];
// var agentStatusText;
var username = document.getElementById('username_input');
var email = document.getElementById('email_input');
var category_input = document.getElementById('category_input');
let guestId;
let agentId;
let agentName;
let currentConvo;
let reqIdG;
let browser;
let checkIntervalTimer;
let reqStatusInterval;

const onReady = async () => {
    if (requestButton){
        requestButton.addEventListener('click', requestClick, false);
    }
};

var isloading = {
    start: function() {
      if (document.getElementById('wfLoading')) {
        return;
      }
      var ele = document.createElement('div');
      ele.setAttribute('id', 'wfLoading');
      ele.classList.add('loading-layer');
      ele.innerHTML = '<div class="loadingtext">Searching for Agent<div><span class="loading-wrap"><span class="loading-text"><span>.</span><span>.</span><span>.</span></span></span>';
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

const requestClick = () => {

    console.log("testttttt");
    console.log('name: ',username.value);
    console.log('email: ',email.value);
    console.log('category: ',category_input.value);

    var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    var letters = /^[A-Za-z]+$/;

    if (!regExp.test(email.value)) {
        alert("Please Enter Valid Email Address")
    }else if(!letters.test(username.value)){
        alert("Please Enter Only letters for Username");    
    }else{
         isloading.start();

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


        const usernameVal = localStorage.getItem('username');
        const emailVal = localStorage.getItem('email');
        const category = localStorage.getItem('category');
        const browserVal = localStorage.getItem('browser');

        if (email === null || email === undefined || email === '') {
            console.log('Invalid email given');
            return;
          }
        
        const body = JSON.stringify({
            support_req: {
                name: usernameVal,
                email: emailVal,
                reqId: "ayylmao",
                browserId: browserVal,
                category,
            }
        });
        const apiUrl = "http://13.76.87.194:3030/user/newsupportreq";
        // const apiUrl = "http://localhost:3030/user/newsupportreq";
        fetch(apiUrl, {
            method: "POST",
            body,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
          return response.text();
        })
        .then(htmltext => {
            const htmlJson = JSON.parse(htmltext);
            if (htmlJson.error) throw new Error(htmlJson.error);
            console.log('Session now active');
            agentId = htmlJson.support_req.agentId;
            guestId = htmlJson.support_req.guestId;
            agentName = htmlJson.support_req.agentName;
            reqIdG = htmlJson.support_req.reqId;
            localStorage.setItem('agentId',agentId)
            localStorage.setItem('guestId',guestId)
            localStorage.setItem('agentName',agentName)
            localStorage.setItem('reqIdG',reqIdG);
            window.location.href = "chat.html";
        }) 
        .catch((err) => {
          console.error(err.message);
          if (err.message === 'No available agents') {
            pollForSupportRequest(email);
          } else {
            alert(err.message);
            isloading.stop();
          }
        });
    }
};

if (requestButton !== undefined){
    requestButton.addEventListener('click', requestClick, false);
}


const pollForSupportRequest = (email) => {
    console.log("pollForSupportRequest")
  reqStatusInterval = setInterval(() => {
    checkForSupportRequest(email);
  }, 5000);
}

const checkForSupportRequest = (email) => {
  const apiUrl = `http://13.76.87.194:3030/common/reqstatus?email=${email}`;
  // const apiUrl = `http://localhost:3030/common/reqstatus?email=${email}`;

  console.log("checkForSupportRequest")
  fetch(apiUrl)
    .then((response) => {
      if (response.status >= 400) {
        throw new Error('Error requesting status');
      }
      return response.text();
    })
    .then((htmlText) => {
      const html = JSON.parse(htmlText)
      console.log(html)
      

      if (html.active === true) {
        console.log('Session now active');
        agentId = html.support_req.agentId;
        guestId = html.support_req.guestId;
        agentName = html.support_req.agentName;
        reqIdG = html.support_req.reqId;
        localStorage.setItem('agentId',agentId)
        localStorage.setItem('guestId',guestId)
        localStorage.setItem('agentName',agentName)
        localStorage.setItem('reqIdG',reqIdG)
        clearInterval(reqStatusInterval);
      //   alert("going to next page")
        window.location.href ="chat.html";
      }else if (html.error == 'Adding support req failed'){
          alert("Invalid Data")
      }else if (html.error == 'Support req pending'){
          alert("Queuing")
      }else if (html.active ===false){
          alert("Queuing")
      }
    })
    .catch(console.error);
};  
