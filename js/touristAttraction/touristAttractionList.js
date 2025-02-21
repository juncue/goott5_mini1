const AREA_CODE_URL = `http://apis.data.go.kr/B551011/KorService1/areaCode1`; // 3번 지역코드 조회
const SERVICE_CATEGORY_URL = `http://apis.data.go.kr/B551011/KorService1/categoryCode1`; // 4번 서비스분류코드 조회
const AREA_BASE_SEARCH_URL = `http://apis.data.go.kr/B551011/KorService1/areaBasedList1`; // 5번 지역기반 관광정보 조회
const KEYWORD_BASE_SEARCH_URL = `http://apis.data.go.kr/B551011/KorService1/searchKeyword1`; // 7번 키워드 검색 조회

const REQUIRED_PARMAS = `?MobileOS=ETC&MobileApp=AppTest&serviceKey=${MY_KEY}&_type=json`;
const FOR_SEARCH_PARAMS = `&contentTypeId=${CONTENT_TYPE_ID}&listYN=Y&arrange=Q`;

let numOfRows = 20;
let PageGroupUnit = 10;

let totalCount = 0;
let totalPages = 0;
let currentPage = 1;

$(function () {
  let url = location.href;
  if (url.indexOf("?") !== -1) {
    checkParams(url);
  } else {
    getCards(currentPage); // 페이지 로딩 시 전체 카드목록 조회
    getServiceCat1Data(""); // 서비스 분류 셀렉트 박스 중 대분류 항목 조회
    getAreaCat1Data(""); // 지역 셀렉트 박스 중 광역시/도 항목 조회
  }
  $("#searchBtn").click(function () {
    // history.replaceState({}, null, location.pathname);
    currentPage = 1;
    getCards(currentPage);
    $("html, body").animate({ scrollTop: $("#cardArea").offset().top }, 500);
  }); // 검색 버튼 클릭 이벤트 리스너
  $(".searchCancel-Btn").click(canselSearch); // 검색초기화 버튼 클릭 이벤트 리스너
});

// 카드를 가져오는 함수
function getCards(pageNo) {
  $(".spinner-border").show();
  console.log("::::::::::");
  $("#card").empty();
  // 쿼리스트링을 만들기 위해 검색 조건을 확인
  let params = [
    $("#areaCode").val(),
    $("#sigunguCode").val(),
    $("#serviceCat1").val(),
    $("#serviceCat2").val(),
    $("#serviceCat3").val(),
  ];
  let keyword = $("#searchWord").val();
  if (keyword != "") {
    params.push(keyword);
    let url = makeSearchUrl(
      KEYWORD_BASE_SEARCH_URL +
        REQUIRED_PARMAS +
        FOR_SEARCH_PARAMS +
        `&numOfRows=${numOfRows}&pageNo=${pageNo}`,
      params
    );
    requestData(url, printCards);
  } else {
    let url = makeSearchUrl(
      AREA_BASE_SEARCH_URL +
        REQUIRED_PARMAS +
        FOR_SEARCH_PARAMS +
        `&numOfRows=${numOfRows}&pageNo=${pageNo}`,
      params
    );
    requestData(url, printCards);
  }
}

// ajax로 받아온 카드데이터를 출력해주는 함수
function printCards(json) {
  console.log(json);
  $(".spinner-border").hide();
  totalCount = json.response.body.totalCount;
  totalPages = Math.ceil(totalCount / numOfRows);
  let item = json.response.body.items.item;
  let output = "";
  if (totalCount == 0) {
    $("#totalCount").html(0);
    $(".pagination").empty();
    output = `<div class="resultNoting">검색 결과가 없습니다.</div>`
  } else {
    $("#totalCount").html(totalCount);
    printPagination(); // 페이지 출력
    $.each(item, function (index, ele) {
      let img =
        ele.firstimage != ""
          ? ele.firstimage
          : `img/touristAttraction/no-image.jpeg`;
      let title = ele.title;
      let contentid = ele.contentid;
      let area1 = ele.addr1.split(" ")[0];
      let area2 = ele.addr1.split(" ")[1];
      let likeArr = readCookie(); // 좋아요 체크 카드 표시

      output += `
          <div class="col">
            <div class="card h-100" >
              <a href="javascript:void(0)"><img src="${img}" id="${contentid}" class="card-img-top" alt="${title}" onclick="goDetailPage(this);" /></a>
              <div class="card-body">
                <small class="text-muted">${area1} | ${area2}</small>
                <h5 id="${contentid}" class="card-title" onclick="goDetailPage(this);"><a href="javascript:void(0);">${title}</a></h5>`;

      if (likeArr.indexOf(contentid) != -1) {
        output += `<span id="${contentid}" class="like" onclick="setLike(this);"><i class="fa-solid fa-heart"></i></span>`;
      } else {
        output += `<span id="${contentid}" class="like" onclick="setLike(this);"><i class="fa-regular fa-heart"></i></span>`;
      }
      output += `</div></div></div>`;
    });
  }
  $("#card").append(output);
}

// 셀렉트박스 옵션 출력에 대한 공통 함수
function printSelectOptions(json, htmlSelector, className) {
  let output = "";
  let list = json.response.body.items.item;
  $.each(list, function (index, ele) {
    output += `<option class="${className}" value="${ele.code}">${ele.name}</option>`;
  });
  $(htmlSelector).append(output);
}

// 서비스 분류 셀렉트박스 데이터 조회
function getServiceCat1Data(cat1) {
  let url =
    SERVICE_CATEGORY_URL +
    REQUIRED_PARMAS +
    `&contentTypeId=${CONTENT_TYPE_ID}`;
  requestData(url, function (data) {
    printSelectOptions(data, "#serviceCat1", "serviceCat1");
    if (cat1 != ""){
      $("#serviceCat1 option").attr("selected", false); 
      $("#serviceCat1").val(cat1).attr("selected", true);
    }
  });
}
function getServiceCat2Data(cat1, cat2) {
  let url =
    SERVICE_CATEGORY_URL +
    REQUIRED_PARMAS +
    `&contentTypeId=${CONTENT_TYPE_ID}&cat1=${cat1}`;
  requestData(url, function (data) {
    printSelectOptions(data, "#serviceCat2", "serviceCat2");
    if (cat2 != ""){
      $("#serviceCat2 option").attr("selected", false); 
      $("#serviceCat2").val(cat2).attr("selected", true);
    }
  });
}
function getServiceCat3Data(cat1, cat2, cat3) {
  let url =
    SERVICE_CATEGORY_URL +
    REQUIRED_PARMAS +
    `&contentTypeId=${CONTENT_TYPE_ID}&cat1=${cat1}&cat2=${cat2}`;
  requestData(url, function (data) {
    printSelectOptions(data, "#serviceCat3", "serviceCat3");
    if (cat3 != ""){
      $("#serviceCat3 option").attr("selected", false); 
      $("#serviceCat3").val(cat3).attr("selected", true);
    }
  });
}

// 지역 셀렉트박스 데이터 조회
function getAreaCat1Data(areaCode) {
  let url = AREA_CODE_URL + REQUIRED_PARMAS + `&numOfRows=50`;
  requestData(url, function (data) {
    printSelectOptions(data, "#areaCode", "areaCat1");
    if (areaCode != ""){
      $("#areaCode option").attr("selected", false); 
      $("#areaCode").val(areaCode).attr("selected", true);
    }
  });
}
function getAreaCat2Data(areaCode, sigunguCode) {
  let url = AREA_CODE_URL + REQUIRED_PARMAS + `&areaCode=${areaCode}&numOfRows=100`;
  requestData(url, function (data) {
    printSelectOptions(data, "#sigunguCode", "areaCat2");
    if (sigunguCode != ""){
      $("#sigunguCode option").attr("selected", false); 
      $("#sigunguCode").val(sigunguCode).attr("selected", true);
    }
  });
}

// 셀렉트 박스 변경에 대한 이벤트리스너
$(document).on("change", "#serviceCat1", function () {
  $(".serviceCat2, .serviceCat3").remove();
  if ($(this).selectedIndex != 0) {
    getServiceCat2Data($(this).val(), "");
  }
});
$(document).on("change", "#serviceCat2", function () {
  $(".serviceCat3").remove();
  if ($(this).selectedIndex != 0) {
    getServiceCat3Data($("#serviceCat1").val(), $(this).val(), "");
  }
});
$(document).on("change", "#areaCode", function () {
  $(".areaCat2").remove();
  if ($(this).selectedIndex != 0) {
    getAreaCat2Data($(this).val(), "");
  }
});

// 검색 초기화 함수
function canselSearch() {
  $(".serviceCat1, .serviceCat2, .serviceCat3").remove();
  $(".areaCat1, .areaCat2").remove();
  getServiceCat1Data("");
  getAreaCat1Data("");
  $("#searchWord").val("");
}

// 페이지 출력 함수
function printPagination() {
  $(".pagination").empty();
  console.log(currentPage);
  console.log(totalCount);
  console.log(totalPages);

  let currentPageGroup = Math.ceil(currentPage / PageGroupUnit); // 현재 페이지 그룹
  let startPage = (currentPageGroup - 1) * PageGroupUnit + 1; // 그룹의 첫 페이지
  let endPage = Math.min(startPage + PageGroupUnit - 1, totalPages); // 그룹의 마지막 페이지
  // 이전 버튼 생성
  if (currentPageGroup > 1) {
    $(".pagination").append(`<li class="page-item" onclick="changePage(${
      startPage - 1
    })">
            <a class="page-link" href="javascript:void(0)" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>`);
  }
  // 페이지 번호 버튼 생성
  for (let i = startPage; i <= endPage; i++) {
    let activeClass = i == currentPage ? "active" : "";
    $(".pagination").append(
      `<li class="page-item ${activeClass}" onclick="changePage(${i})"><a class="page-link" href="javascript:void(0)">${i}</a></li>`
    );
  }
  // 다음 버튼 생성
  if (endPage < totalPages) {
    $(".pagination").append(`<li class="page-item" onclick="changePage(${
      endPage + 1
    })">
            <a class="page-link" href="javascript:void(0)" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>`);
  }
}

function changePage(page) {
  currentPage = page;
  getCards(currentPage);
  printPagination();
  $("html, body").animate({ scrollTop: $("#cardArea").offset().top }, 500);
}

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

function goDetailPage(card) {
  let params = [
    $("#areaCode").val(),
    $("#sigunguCode").val(),
    $("#serviceCat1").val(),
    $("#serviceCat2").val(),
    $("#serviceCat3").val(),
    $("#searchWord").val(),
  ];
  let url = makeSearchUrl(
    SERVICE_URL +
      DETAIL_PAGE_URL +
      `?contentId=${card.id}&pageNo=${currentPage}`,
    params
  );
  console.log(url.toString());
  window.location.href = url.toString();
}

function checkParams(url) {
  console.log(url);
  let queryStr = url.split("?")[1];
  let pageNo = getParameter("pageNo");
  let areaCode = getParameter("areaCode");
  let sigunguCode = getParameter("sigunguCode");
  let cat1 = getParameter("cat1");
  let cat2 = getParameter("cat2");
  let cat3 = getParameter("cat3");
  let keyword = getParameter("keyword");
  history.replaceState({}, null, location.pathname);

  currentPage = pageNo;
  $("#searchWord").val(decodeURI(keyword));

  if (keyword != "") {
    let url =
      KEYWORD_BASE_SEARCH_URL +
      REQUIRED_PARMAS +
      FOR_SEARCH_PARAMS +
      `&numOfRows=${numOfRows}&${queryStr}`;
    console.log(url);
    requestData(url, printCards);
  } else {
    let params = queryStr.split("&keyword=")[0];
    let url =
      AREA_BASE_SEARCH_URL +
      REQUIRED_PARMAS +
      FOR_SEARCH_PARAMS +
      `&numOfRows=${numOfRows}&${params}`;
    requestData(url, printCards);
  }
  if (areaCode != "") {
    getAreaCat1Data(areaCode);
    getAreaCat2Data(areaCode, "");
  }
  if (sigunguCode != "") {
    getAreaCat2Data(areaCode, sigunguCode);
  }
  if (cat1 != "") {
    getServiceCat1Data(cat1);
    getServiceCat2Data(cat1, "");
  }
  if (cat2 != "") {
    getServiceCat2Data(cat1, cat2);
    getServiceCat3Data(cat1, cat2, "");
  }
  if (cat3 != "") {
    getServiceCat3Data(cat1, cat2, cat3);
  }
}