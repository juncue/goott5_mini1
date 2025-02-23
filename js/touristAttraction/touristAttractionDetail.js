let contentId = getParameter("contentid");
if (contentId == "") {
  location.href = SERVICE_URL + LIST_PAGE_URL;
}

let likeArr = readCookie();

let title = "";
let overview = "";
let mapx = "";
let mapy = "";
let addr = "";
let img = "";

let basicInfoTitle = ["홈페이지", "주소", "전화번호"];
let basicInfoValue = new Array(3);

let noticeTitle = [
  "문의 및 안내",
  "쉬는날",
  "이용시간",
  "주차",
  "신용카드 가능여부",
  "유모차 가능여부",
  "수용인원",
];
let noticeValue = new Array(7);

let detailInfoTitle = new Array();
let detailInfoValue = new Array();

$(function () {
  getDetailCommon(); //공통정보 가져오기
  getDetailIntro(); //소개정보 가져오기
  getDetailInfo(); //반복정보 가져오기
  getDetailImage(); //이미지정보 가져오기

  // 찜 여부 출력
  if (likeArr.indexOf(contentId) != -1) {
    $(".detailLike").children().eq(0).addClass("fa-solid");
  } else {
    $(".detailLike").children().eq(0).addClass("fa-regular");
  }
  $(window).bind("pageshow", function(event){
    if (event.originalEvent.persisted) {
      goBackListPage()
    }
  })
});

// 공통정보 조회 함수
function getDetailCommon() {
  let url =
    DETAIL_COMMON_URL +
    REQUIRED_PARMAS +
    `&contentId=${contentId}&defaultYN=Y&addrinfoYN=Y&firstImageYN=Y&mapinfoYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y`;
  requestData(url, function (data) {
    console.log(data);
    let item = data.response.body.items.item[0];
    title = item.title;
    overview = item.overview;
    mapx = item.mapx;
    mapy = item.mapy;
    addr = item.addr1;
    img = item.firstimage;

    basicInfoValue[0] = item.homepage;
    basicInfoValue[1] = item.addr1;
    basicInfoValue[2] = item.tel;

    printTitle(title); // 타이틀 출력
    printOverview(overview); // 개요 출력
    printInfo(basicInfoTitle, basicInfoValue, "basicInfo"); // 기본정보 출력
    printMap(mapx, mapy); // 지도 출력
  });
}

// 소개정보 조회 함수
function getDetailIntro() {
  let url =
    DETAIL_INTRO_URL +
    REQUIRED_PARMAS +
    `&contentId=${contentId}&contentTypeId=${CONTENT_TYPE_ID}`;
  requestData(url, function (data) {
    console.log(data);
    let item = data.response.body.items.item[0];
    noticeValue[0] = item.infocenter;
    noticeValue[1] = item.restdate;
    noticeValue[2] = item.usetime;
    noticeValue[3] = item.parking;
    noticeValue[4] = item.chkcreditcard;
    noticeValue[5] = item.chkbabycarriage;
    noticeValue[6] = item.accomcount;

    printInfo(noticeTitle, noticeValue, "notice"); // 이용안내 출력
  });
}

// 반복정보 조회 함수
function getDetailInfo() {
  let url =
    DETAIL_INFO_URL +
    REQUIRED_PARMAS +
    `&contentId=${contentId}&contentTypeId=${CONTENT_TYPE_ID}`;
  requestData(url, function (data) {
    console.log(data);
    let items = data.response.body.items.item;
    $.each(items, function (index, ele) {
      detailInfoTitle[index] = ele.infoname;
      detailInfoValue[index] = ele.infotext;
    });

    printInfo(detailInfoTitle, detailInfoValue, "detailInfo"); // 상세정보 출력
  });
}

// 이미지정보 조회 함수
function getDetailImage() {
  let url =
    DETAIL_IMAGE_URL +
    REQUIRED_PARMAS +
    `&contentId=${contentId}&imageYN=Y&subImageYN=Y`;
  requestData(url, function (data) {
    console.log(data);
    let items = data.response.body.items;

    printImage(items);
  });
}

// 타이틀 출력
function printTitle(title) {
  $("#detailTitle").html(title);
}

// 개요 출력
function printOverview(overview) {
  $("#overview").html(overview);
}

// 탭 정보 출력
function printInfo(title, value, id) {
  let output = `<table class="table">`;
  for (let i = 0; i < title.length; i++) {
    if (value[i] != "") {
      output += `<tr>
                    <th scope="row">${title[i]}</th>
                    <td>${value[i]}</td>
                  </tr>`;
    }
  }
  output += `</table>`;
  $(`#${id}`).html(output);
}

// 이미지 슬라이더 출력
function printImage(data) {
  let carouselIndicators = "";
  let carouselInner = "";
  if (data == "") {
    printalternativeImage();
  } else {
    $.each(data.item, function (index, ele) {
      if (index == 0) {
        carouselIndicators += `<button
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to="${index}"
              class="active"
              aria-current="true"
              aria-label="Slide${index + 1}"
            ></button>`;

        carouselInner += `<div class="carousel-item active">
              <img src="${ele.originimgurl}" class="d-block w-100" alt="${ele.title}" />
            </div>`;
      } else {
        carouselIndicators += `<button
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to="${index}"
              aria-label="Slide${index + 1}"
            ></button>`;

        carouselInner += `<div class="carousel-item">
              <img src="${ele.originimgurl}" class="d-block w-100" alt="${ele.title}" />
            </div>`;
      }
    });

    $(".carousel-indicators").html(carouselIndicators);
    $(".carousel-inner").html(carouselInner);
  }
}
function printalternativeImage(){
  let output = `<img width="100%" src="img/touristAttraction/no-image.jpeg">`
  $("#carouselExampleIndicators").html(output);
}

// 지도 출력
function printMap(mapx, mapy) {
  var mapContainer = document.getElementById("map"), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(mapy, mapx), // 지도의 중심좌표
      level: 3, // 지도의 확대 레벨
    };
  var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다
  // 마커가 표시될 위치입니다
  var markerPosition = new kakao.maps.LatLng(mapy, mapx);
  // 마커를 생성합니다
  var marker = new kakao.maps.Marker({
    position: markerPosition,
  });
  // 마커가 지도 위에 표시되도록 설정합니다
  marker.setMap(map);
  map.setZoomable(false);
  // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
  var zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
}

// 카카오톡 공유하기
function shareMessage() {
  Kakao.init("a71a8751e5612ffa85926cc64a7631a5"); // 사용하려는 앱의 JavaScript 키 입력
  Kakao.Share.sendDefault({
    objectType: "location",
    address: addr,
    addressTitle: addr,
    content: {
      title: title,
      description: `${addr.split(" ")[0]} | ${addr.split(" ")[1]}`,
      imageUrl: img,
      link: {
        // [내 애플리케이션] > [플랫폼] 에서 등록한 사이트 도메인과 일치해야 함
        mobileWebUrl: "http://amorparami.cafe24.com",
        webUrl: "http://amorparami.cafe24.com",
      },
    },
    buttons: [
      {
        title: "웹으로 보기",
        link: {
          mobileWebUrl: `http://amorparami.cafe24.com/frontProject/touristAttractionDetail.html?contentid=${contentId}`,
          webUrl: `http://amorparami.cafe24.com/frontProject/touristAttractionDetail.html?contentid=${contentId}`,
        },
      },
    ],
  });
}

// 목록페이지로 돌아갈 때 받아왔던 쿼리스트링을 그대로 돌려준다.
function goBackListPage() {
  let page = getParameter("pageNo");
  let url = location.href;
  let queryStr = url.split("?")[1];
  
  url = SERVICE_URL + LIST_PAGE_URL + `?pageNo=${page}` + queryStr.substring(queryStr.indexOf("&"));
  window.location.href = url.toString();
}
