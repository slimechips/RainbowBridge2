import rainbowSDK from './rainbow-sdk.min.js';
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
let category;
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


        username = localStorage.getItem('username');
        email = localStorage.getItem('email');
        category = localStorage.getItem('category');
        browser = localStorage.getItem('browser');

        if (email === null || email === undefined || email === '') {
            console.log('Invalid email given');
            return;
          }
        
        const body = JSON.stringify({
            support_req: {
                name: username,
                email,
                reqId: "ayylmao",
                browserId: browser,
                category,
            }
        });
        
        fetch("http://13.76.87.194:3030/user/newsupportreq", {
            method: "POST",
            body,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
          return response.text();
        })
        .then(htmltext => {
            console.log("fetched") 
            setupConvo(JSON.parse(htmltext));
            checkIntervalTimer = setInterval(() => {
                checkConvoStatusNetwork(reqIdG);
            }, 5000);
        }) 
        .catch((err) => {
          console.error(err);
          pollForSupportRequest(email);
        });
    }
};

if (requestButton !== undefined){
    requestButton.addEventListener('click', requestClick, false);
}

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

  const pollForSupportRequest = (email) => {
      console.log("pollForSupportRequest")
    reqStatusInterval = setInterval(() => {
      checkForSupportRequest(email);
    }, 5000);
  }
  
  const checkForSupportRequest = (email) => {
    const apiUrl = `http://13.76.87.194:3030/common/reqstatus?email=${email}`;
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

  const checkConvoStatusNetwork = (reqId) => {
    const apiUrl = `http://13.76.87.194:3030/common/reqstatus?reqId=${reqId}`;
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
        //   closeConvo();
        }
      })
      .catch(console.error);
  };


  const setupConvo = (html) => {
    agentId = html.support_req.agentId;
    guestId = html.support_req.guestId;
    agentName = html.support_req.agentName;
    reqIdG = html.support_req.reqId;
    agentStatusText.innerHTML = agentName;

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


  document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);  
  rainbowSDK.start();
  rainbowSDK.load();