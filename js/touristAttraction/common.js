const MY_KEY = `Mr%2FoLDV0QvesS1eTgQhWGB5QVE8m0cS4exeRvZdGXTV9HktCkhWBrEhPAMt2RYHN%2B2kvhbKkMka%2BK%2BgLlESbsA%3D%3D`;
const CONTENT_TYPE_ID = 12;
const SERVICE_URL = "http://amorparami.cafe24.com/frontProject/";
const LIST_PAGE_URL = `touristAttractionList.html`;
const DETAIL_PAGE_URL = `touristAttractionDetail.html`;

// ajax 요청 공통 함수
function requestData(url, callback) {
  $.ajax({
    url: url,
    type: "GET",
    dataType: "json",
    success: function (data) {
      callback(data);
    },
    error: function (data) {
      console.log(data.responseText);
    },
    complete: function () {},
  });
}

// 쿼리스트링 만들어주는 함수
function makeSearchUrl(url, params) {
  let paramNames = [
    "areaCode",
    "sigunguCode",
    "cat1",
    "cat2",
    "cat3",
    "keyword",
  ];
  $.each(params, function (index, ele) {
    if (ele != "noValue") {
      url += `&${paramNames[index]}=${ele}`;
    }
  });
  return url;
}

function getParameter(paramName) {
  let returnVal = "";
  let url = location.href;

  if (url.indexOf("?") !== -1) {
    // 쿼리스트링이 있는 경우
    let queryStr = url.split("?")[1];
    let queryStrArr = queryStr.split("&");

    for (let item of queryStrArr) {
      if (item.split("=")[0] == paramName) {
        returnVal = item.split("=")[1];
        break;
      }
    }
  }
  return returnVal;
}

function saveCookie(cookieName, cookieValue, expMonth) {
  let now = new Date();
  now.setMonth(now.getMonth() + expMonth);

  let tmpCookie =
    cookieName + "=" + cookieValue + ";expires=" + now.toUTCString();
  document.cookie = tmpCookie;
}

function readCookie() {
  let cookArr = document.cookie.split("; ");
  let likeArr = new Array();
  $.each(cookArr, function (index, ele) {
    let cookName = ele.split("=")[0];
    if (cookName.indexOf("like") != -1) {
      likeArr.push(ele.split("=")[0].substring(4));
    }
  });
  return likeArr;
}
