// const SERVICE_URL = "http://amorparami.cafe24.com/frontProject/";  // 운영
const SERVICE_URL = ""; // 로컬
const LIST_PAGE_URL = `touristAttractionList.html`;
const DETAIL_PAGE_URL = `touristAttractionDetail.html`;

const MY_KEY = `Mr%2FoLDV0QvesS1eTgQhWGB5QVE8m0cS4exeRvZdGXTV9HktCkhWBrEhPAMt2RYHN%2B2kvhbKkMka%2BK%2BgLlESbsA%3D%3D`;
const CONTENT_TYPE_ID = 12;

const AREA_CODE_URL = `http://apis.data.go.kr/B551011/KorService1/areaCode1`; // 3번 지역코드 조회
const SERVICE_CATEGORY_URL = `http://apis.data.go.kr/B551011/KorService1/categoryCode1`; // 4번 서비스분류코드 조회
const AREA_BASE_SEARCH_URL = `http://apis.data.go.kr/B551011/KorService1/areaBasedList1`; // 5번 지역기반 관광정보 조회
const KEYWORD_BASE_SEARCH_URL = `http://apis.data.go.kr/B551011/KorService1/searchKeyword1`; // 7번 키워드 검색 조회
const DETAIL_COMMON_URL = `http://apis.data.go.kr/B551011/KorService1/detailCommon1`; // 10번 공통정보조회
const DETAIL_INTRO_URL = `http://apis.data.go.kr/B551011/KorService1/detailIntro1`; // 11번 소개정보 조회
const DETAIL_INFO_URL = `http://apis.data.go.kr/B551011/KorService1/detailInfo1`; // 12번 반복정보 조회
const DETAIL_IMAGE_URL = `http://apis.data.go.kr/B551011/KorService1/detailImage1`; // 13번 이미지 정보 조회

const REQUIRED_PARMAS = `?MobileOS=ETC&MobileApp=AppTest&serviceKey=${MY_KEY}&_type=json`;
const FOR_SEARCH_PARAMS = `&contentTypeId=${CONTENT_TYPE_ID}&listYN=Y&arrange=Q`;

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

// 쿼리스트링에서 value 찾는 함수
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

// 찜 설정/해제 함수
function setLike(likeIcon) {
  if (likeIcon.children[0].classList.contains("fa-regular")) {
    likeIcon.children[0].classList.remove("fa-regular");
    likeIcon.children[0].classList.add("fa-solid");
    saveCookie(`like${likeIcon.id}`, CONTENT_TYPE_ID, 6);
  } else {
    likeIcon.children[0].classList.add("fa-regular");
    likeIcon.children[0].classList.remove("fa-solid");
    saveCookie(`like${likeIcon.id}`, "", 0);
  }
}

// 쿠키 저장 함수
function saveCookie(cookieName, cookieValue, expMonth) {
  let now = new Date();
  now.setMonth(now.getMonth() + expMonth);

  let tmpCookie =
    cookieName + "=" + cookieValue + ";expires=" + now.toUTCString();
  document.cookie = tmpCookie;
}

// 쿠키 읽기 함수
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
