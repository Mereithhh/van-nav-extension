const addToolElement = document.querySelector("#addTool")
const openAdminElement = document.querySelector("#openAdmin")
const openWebSiteElement = document.querySelector("#openWebsite")
const openSettingElement = document.querySelector("#openSetting")
const openHtmlElement = document.querySelector("#openHtml")
const confirmPage = document.querySelector("#confirmPage")
const mainPage = document.querySelector("#mainPage")
const settingPage = document.querySelector("#settingPage")
const loadingPage = document.querySelector("#loadingPage")
const confirmBtn = document.querySelector("#confirmAdd")
const cancelBtn = document.querySelector("#cancelAdd")
const settingConfirmBtn = document.querySelector("#confirmSetting")
const settingCancelBtn = document.querySelector("#cancelSetting")
const fetchCatelogBtn = document.querySelector("#fetchCatelog")
const formName = document.querySelector("#name")
const formUrl = document.querySelector("#url")
const formDesc = document.querySelector("#desc")
const formCatelog = document.querySelector("#catelog")
const formLogo = document.querySelector("#logo")
const settingBaseUrl = document.querySelector("#baseUrl")
const settingToken = document.querySelector("#token")
openAdminElement.addEventListener("click", handleOpenAdmin)
openWebSiteElement.addEventListener("click", handleOpenWebsite)
confirmBtn.addEventListener("click", handleConfirm)
cancelBtn.addEventListener("click", handleCancel)
addToolElement.addEventListener("click", handleAddTool)
openSettingElement.addEventListener("click", handleOpenSetting)
openHtmlElement.addEventListener("click", handleOpenHeml)
settingCancelBtn.addEventListener("click", handleOpenSetting)
settingConfirmBtn.addEventListener("click", handleSettingConfirm)
fetchCatelogBtn.addEventListener("click", (ev) => {
  setLoading(true, settingPage);
  fetchCateLog(undefined).then(res => {
  }).finally(() => {
    setLoading(false, settingPage)
  })
})
let BASE_URL = '';
let TOKEN = '';
let SELECT_OPTIONS = null;
let LAST_OPTION = null;

chrome.storage.sync.get(['baseUrl', 'token', 'options', 'lastOption'], function (result) {
  if (!result.baseUrl || !result.token) {
    alert("首次使用请先在设置中设置基础 URL 和 TOKEN!")
    return
  }
  if (!result.options) {
    // fetch
    setLoading(true, mainPage)
    fetchCateLog(undefined).then(res => {
      if (!res?.length) {
        alert("暂无分类信息，请先在后台添加分类！")
      } else {
        addCateLogInSelect();
      }
    }).catch(res => {
      console.log(res)
    }).finally(() => {
      setLoading(false, mainPage)
    })
  } else {
    SELECT_OPTIONS = result.options
    addCateLogInSelect();
  }
  if (result.lastOption) {
    LAST_OPTION = result.lastOption
  }
  BASE_URL = result.baseUrl || "";
  TOKEN = result.token || "";
});

let data = null;

function addCateLogInSelect() {
  const select = document.querySelector("#catelog")
  //先删除所有的子元素
  select.innerHTML = '';
  SELECT_OPTIONS.forEach(i => {
    const option = document.createElement("option")
    option.value = i
    option.text = i
    select.appendChild(option)
  })
}

async function fetchCateLog(ev) {
  try {
    const { data } = await getData(`${BASE_URL}/api/admin/all`)
    const catelogs = data?.catelogs || []
    if (catelogs.length) {
      SELECT_OPTIONS = catelogs.map(i => i.name)
      chrome.storage.sync.set({ options: SELECT_OPTIONS }, function () {
      });
      addCateLogInSelect();
      return SELECT_OPTIONS;
    } else {
      return [];
    }
  } catch (err) {
    return;
  }

}

async function handleAddTool(ev) {
  if (BASE_URL === "" || TOKEN === "") {
    alert("请先在设置中设置基础 URL 和 TOKEN!")
    return;
  }
  confirmPage.classList.toggle("show")
  mainPage.classList.toggle("show")
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const { favIconUrl, title, url } = tab;
  data = {
    catelog: LAST_OPTION || undefined,
    desc: title,
    name: title,
    url: url,
    logo: favIconUrl
  };
  formCatelog.value = data.catelog;
  formDesc.value = data.desc;
  formName.value = data.name;
  formUrl.value = data.url;
  formLogo.value = data.logo;
}

async function handleSettingConfirm(ev) {
  // 读取数据
  let baseUrl = settingBaseUrl.value
  const token = settingToken.value
  if (baseUrl.charAt(baseUrl.length - 1) === '/') {
    baseUrl = baseUrl.slice(0, -1)
  }
  if (baseUrl && baseUrl !== "" && token && token !== "") {
    chrome.storage.sync.set({ token: token, baseUrl: baseUrl }, function () {
      BASE_URL = baseUrl;
      TOKEN = token;
      console.log('Value is set to ', token, baseUrl);
    });
    setLoading(true, settingPage)
    fetchCateLog(undefined).then(res => {
      handleOpenSetting(undefined)

    }).finally(() => { setLoading(false, settingPage) })
  } else {
    alert("都是必填项！")
  }
}

async function handleConfirm(ev) {
  // alert("confirm")
  setLoading(true, confirmPage)
  // 保存上一个 option
  LAST_OPTION = formCatelog.value
  chrome.storage.sync.set({ lastOption: LAST_OPTION }, function () {
  });
  const res = await fetchAddTool()
  if (res?.success == true) {
  } else {
    alert("添加失败！\n" + JSON.stringify(res, null, 2))
  }
  setLoading(false, confirmPage)
  mainPage.classList.toggle("show")
  confirmPage.classList.toggle("show")
  console.log(res)
  window.close();
}
async function handleCancel(ev) {
  mainPage.classList.toggle("show")
  confirmPage.classList.toggle("show")
}
function handleOpenSetting(ev) {
  mainPage.classList.toggle("show")
  settingPage.classList.toggle("show")
  if (BASE_URL !== "" && BASE_URL) {
    settingBaseUrl.value = BASE_URL
  }
  if (TOKEN !== "" && TOKEN) {
    settingToken.value = TOKEN
  }
}
async function handleOpenAdmin(ev) {
  if (BASE_URL === "" || TOKEN === "") {
    alert("请先在设置中设置基础 URL 和 TOKEN!")
    return;
  }
  let tabs = await chrome.tabs.query({ currentWindow: true });
  let tab = tabs.find(i => i?.url?.indexOf(BASE_URL + '/admin') !== -1)
  if (tab) {
    chrome.tabs.update(tab.id, { active: true });
  } else {
    chrome.tabs.create({ url: BASE_URL + '/admin' });
  }
  window.close();
}
async function handleOpenWebsite(ev) {
  if (BASE_URL === "" || TOKEN === "") {
    alert("请先在设置中设置基础 URL 和 TOKEN!")
    return;
  }
  let tabs = await chrome.tabs.query({ currentWindow: true });
  let tab = tabs.find(i => i?.url?.indexOf(BASE_URL) !== -1)
  if (tab) {
    chrome.tabs.update(tab.id, { active: true });
  } else {
    chrome.tabs.create({ url: BASE_URL });
  }
  window.close();
  // chrome.tabs.create({ url: BASE_URL });
}

function setLoading(isLoading, currPage) {
  if (isLoading) {
    currPage.classList.toggle("show")
    loadingPage.classList.toggle("show")
  } else {
    currPage.classList.toggle("show")
    loadingPage.classList.toggle("show")
  }
}

async function fetchAddTool() {
  if (!data) {
    alert("无数据！")
  }
  // 获取实际数据
  data = {
    catelog: formCatelog.value,
    desc: formDesc.value,
    name: formName.value,
    url: formUrl.value,
    logo: formLogo.value
  }

  // 校验必填项
  const mustHave = ['name', 'url', 'desc', 'catelog'];
  const isValid = mustHave.every(key => {
    return data[key] && data[key].length > 0;
  });
  if (!isValid) {
    alert("除了图标都是必填项哦！");
    return;
  }
  return await postData(`${BASE_URL}/api/admin/tool`, data);
}

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      "authorization": TOKEN,
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
async function getData(url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      "authorization": TOKEN,
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function handleOpenHeml(){
  chrome.tabs.create({url: chrome.runtime.getURL('popup.html')});
}