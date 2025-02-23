let numOfRows = 20; // 한 페이지 내 출력하는 카드 개수
let PageGroupUnit = 10;  // 페이지 출력 개수 단위

let totalCount = 0;
let totalPages = 0;
let currentPage = 1;

$(function () {
  let url = location.href;
  if (url.indexOf("?") !== -1) {  // 접속 url에 쿼리스트링이 있다면, (상세페이지에서 부터 돌아온 경우)
    getPreviousCards(url);
  } else {  // 접속 url에 쿼리스트링이 없다면, (최초 진입)
    getCards(currentPage); // 페이지 로딩 시 전체 카드목록 조회
    getServiceCat1Data(""); // 서비스 분류 셀렉트 박스 중 대분류 항목 조회
    getAreaCat1Data(""); // 지역 셀렉트 박스 중 광역시/도 항목 조회
  }
  $("#searchBtn").click(function () {  // 검색 버튼 클릭 이벤트 리스너
    history.replaceState({}, null, location.pathname);
    currentPage = 1;
    getCards(currentPage);
    $("html, body").animate({ scrollTop: $("#cardArea").offset().top }, 300);
  }); 
  $(".searchCancel-Btn").click(canselSearch); // 검색초기화 버튼 클릭 이벤트 리스너
});

// 새로운 카드를 가져오는 함수
function getCards(pageNo) {
  $(".spinner-border").show();
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

// 상세페이지에서 목록페이지로 돌아왔을 때, 이전 검색 내역을 출력해주기 위한 함수
function getPreviousCards(url) {
  console.log(url);
  let queryStr = url.split("?")[1];
  let pageNo = getParameter("pageNo");
  let areaCode = getParameter("areaCode");
  let sigunguCode = getParameter("sigunguCode");
  let cat1 = getParameter("cat1");
  let cat2 = getParameter("cat2");
  let cat3 = getParameter("cat3");
  let keyword = getParameter("keyword");
  
  getAreaCat1Data("");
  getServiceCat1Data("");
  
  currentPage = pageNo;
  $("#searchWord").val(decodeURI(keyword));

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

// 셀렉트박스 옵션 출력에 대한 공통 함수
function printSelectOptions(json, htmlSelector, className) {
  let output = "";
  let list = json.response.body.items.item;
  $.each(list, function (index, ele) {
    output += `<option class="${className}" value="${ele.code}">${ele.name}</option>`;
  });
  $(htmlSelector).append(output);
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
  getCards(1);
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

// 상세페이지로 이동 시 쿼리스트링 만들어서 넘겨주는 함수
function goDetailPage(card) {
  let params = [
    $("#areaCode").val(),
    $("#sigunguCode").val(),
    $("#serviceCat1").val(),
    $("#serviceCat2").val(),
    $("#serviceCat3").val(),
    $("#searchWord").val(),
  ];

  let ListUrl = makeSearchUrl(
    SERVICE_URL + LIST_PAGE_URL + `?pageNo=${currentPage}`,
    params
  );
  let DetailUrl = makeSearchUrl(
    SERVICE_URL +
    DETAIL_PAGE_URL +
    `?contentid=${card.id}&pageNo=${currentPage}`,
    params
  );
  // 현재 상태를 히스토리에 저장 (상세페이지에서 뒤로 가기 시 ListUrl로 이동하도록 설정)
  history.pushState({ path: ListUrl.toString() }, "", ListUrl.toString());

  // 상세 페이지로 이동
  window.location.href = DetailUrl.toString();
}

