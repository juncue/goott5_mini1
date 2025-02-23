function ajaxFunc(parsingType, baseUrl, param) {
  // url 작업
  let paramStr = "";
  // m8RnrLhqyIQCB0JuwmtervG5tpqGYzgFljnm0cOtDgsCwKWImJcFlsAva9dq4jmgKZlVGEVHYuVJDJZGkQLxnw%3D%3D

  // 시도를 전국으로 할 경우
  if (param.areaCode == 0) {
    delete param.areaCode;
  }
  // 시군구를 전국으로 할 경우
  if (param.sigunguCode == 0) {
    delete param.sigunguCode;
  }
  // 음식점 타입을 전체로 할 경우
  if (param.cat3 == 0) {
    delete param.cat1;
    delete param.cat2;
    delete param.cat3;
  }
  console.log("parsingType: ", parsingType, "param", param);

  for (let key in param) paramStr += `${key}=${param[key]}&`;
  paramStr = paramStr.slice(0, -1);

  let url = baseUrl + paramStr;

  console.log("ajaxFunc url:", url);

  // 요청
  $(".loading").show();
  $.ajax({
    url: url,
    type: "GET",
    dataType: "json",
    async: false, // 동기통신방법
    success: function (data) {
      if (
        parsingType == "recentItemParsing" ||
        parsingType == "searchItemParsing" ||
        parsingType == "searchItemNextParsing"
      ) {
        areaBasedList1JSON(parsingType, data);
      }
      if (parsingType == "likeItemParsing")
        detailCommon1JSON(parsingType, data);
    },
    error: function () {},
    complete: function () {
      $(".loading").hide();
    },
  });
}

function areaBasedList1JSON(parsingType, json) {
  console.log("areaBasedList1JSON:", json);
  if (json.response.body.items == "") {
    $(".searchNextBtn").attr("disabled", "disabled");
    $(".searchNextBtn").removeClass("btn btn-outline-success");
    $(".searchNextBtn").addClass("btn btn-outline-secondary");
  } else {
    let itemArr = json.response.body.items.item;

    let outputArr = [];
    for (let i = 0; i < itemArr.length; i++) {
      let contentid = itemArr[i].contentid;
      let contenttypeid = itemArr[i].contenttypeid;
      let title = itemArr[i].title;
      let imgSrc = "";
      if (itemArr[i].firstimage == "") {
        imgSrc = "img/main/no-image.jpeg";
      } else {
        imgSrc = itemArr[i].firstimage;
      }
      let mapX = itemArr[i].mapx;
      let mapY = itemArr[i].mapy;
      outputArr.push({
        contentid: contentid,
        contenttypeid: contenttypeid,
        title: title,
        imgSrc: imgSrc,
        mapX: mapX,
        mapY: mapY,
      });
    }
    let cards = outputCardsPrint(outputArr, "contents");
    if (parsingType == "recentItemParsing")
      $(".recentContentsArea").html(cards);
    if (parsingType == "searchItemParsing") {
      cards += `<button type="button" class="btn btn-outline-success searchNextBtn">더보기</button>`;
      $(".modal-body-full").html(cards);
      $("#modalAlertFull").modal("show");
    }
    if (parsingType == "searchItemNextParsing") {
      $(".searchNextBtn").before(cards);
    }
  }
}

function detailCommon1JSON(parsingType, json) {
  if (!json.response.body.items.item[0]) {
    console.log("없다면, API 호출오류");
  } else {
    item = json.response.body.items.item[0];
    let contentid = item.contentid;
    let contenttypeid = item.contenttypeid;
    let title = item.title;

    let imgSrc = "";
    if (item.firstimage == "") imgSrc = "img/main/no-image.jpeg";
    else imgSrc = item.firstimage;
    let mapX = item.mapx;
    let mapY = item.mapy;

    // 전역변수 객체에 contentid를 key로 해서 객체 안에 객체에 정도 담기
    likeItemObj[contentid] = {
      contentid: contentid,
      contenttypeid: contenttypeid,
      title: title,
      imgSrc: imgSrc,
      mapX: mapX,
      mapY: mapY,
    };
  }
}

function likeItemsCollect(obj, state) {
  let outputArr = [];
  console.log(obj);
  if (obj == "") {
    console.log("좋아요가 없다면?");
  } else {
    for (let key in obj) {
      outputArr.push(obj[key]);
    }

    let cards = outputCardsPrint(outputArr, "like");

    // 처음엔 덮어쓰기, 좋아요 아이템이 추가되면 append하여 뒤에 붙이기
    if (state == "first") $(".likeContentsArea").html(cards);
    else $(".likeContentsArea").append(cards);
  }
}

function likeCountFunc() {
  obj = readAllCookies();
  // 각각 좋아요 개수 카운트
  let categoryTypeIdArr = ["12", "39", "38", "14", "25", "28", "15", "32"];
  let categoryNameArr = [
    "touristAttraction",
    "restaurant",
    "shopping",
    "culture",
    "travel",
    "leports",
    "festival",
    "lodgment",
  ];
  let likeContentTypeIdArr = [];
  let categoryLikeArr = [];
  for (let key in obj) {
    console.log(key);
    if (key.match("like") != null) likeContentTypeIdArr.push(obj[key]);
  }

  for (let i = 0; i < categoryTypeIdArr.length; i++) {
    let tmpArr = likeContentTypeIdArr.filter(
      (item) => item === categoryTypeIdArr[i]
    );
    $(`#like-${categoryNameArr[i]}`).html(` <b>${tmpArr.length}</b>`);
  }
}

function outputCardsPrint(outputArr, type) {
  let cards = ``;
  console.log(outputArr);
  for (let item of outputArr) {
    console.log(item);

    let title = item.title;
    let contenttypeid = item.contenttypeid;
    let contentid = item.contentid;
    // 제목이 너무 길면 줄이기
    if (title.length > 10) {
      title = item.title.substring(0, 10) + "···";
    }
    // contenttypeid별 영문, 한글 배열로 담아오기 [0]은 영문, [1]은 한글
    let ctgyNameArr = changeCtgyName(contenttypeid);

    // 쿠키 유무에 따라 하트 모양 불러오기
    let heartClass = null;
    returnCookieVal = readCookie(`like${contentid}`); // 1이면 채운하트 0이면 빈 하트
    console.log(returnCookieVal);
    if (returnCookieVal == 0) {
      heartClass = "fa-regular fa-heart";
    } else {
      heartClass = "fa-solid fa-heart";
    }

    let params = `?contentid=${contentid}`;
    if (contenttypeid == 39) params += `&mapx=${item.mapX}&mapy=${item.mapY}`;
    if (type == "like") {
      // 음식점의 경우, 파라미터에 mapx, mapy 추가하여 전달
      cards += `
        <div class="col-lg-3 col-md-6" data-aos="zoom-in" id=${contentid}>
            <div class="pricing-tem">
                <h3 style="color: #20c997">${ctgyNameArr[1]}</h3>
                <a href="${ctgyNameArr[0]}Detail.html${params}"><h4 style="height:80px">${title}</h4></a?
                <div class="like-icon" style="width:30px;height:30px;background-color:white; border-radius:50%; position:absolute; top:10%; left:80%;padding: 1px 0px 0px 1px">
                    <i id="${contentid}_${contenttypeid}" class="${heartClass}" style="color:#f1658a; font-size:23px"></i>
                </div>
                <div style="width:100%; height: 150px; overflow:hidden">
                    <a href="${ctgyNameArr[0]}Detail.html${params}"><img width="100%" height="100%" src=${item.imgSrc} alt="" ></a>
                </div>
            </div>
        </div>
      `;
    } else if (type == "contents") {
      cards += `
          <div class="col-xl-3 col-md-6" id=${contentid}>
          <div class="icon-box" >
              <div class="category" style="color:#033f0c;font-weight:900">${ctgyNameArr[1]}</div>
              <h4 class="title" style="height:50px">
              <a href="${ctgyNameArr[0]}Detail.html${params}">${title}</a>
              </h4>
              <div class="like-icon" style="width:30px;height:30px;background-color:white; border-radius:15px; position:absolute; top:8%; left:82%;padding-top: 3px">
                      <i id="${contentid}_${contenttypeid}" class="${heartClass}" style="color:#f1658a; font-size:23px"></i>
                  </div>
                  <div style="width:100%; height: 150px; overflow:hidden">
                      <a href="${ctgyNameArr[0]}Detail.html${params}"><img width="100%" height="100%" src=${item.imgSrc} alt="" ></a>
                  </div>
          </div>
          </div>`;
    }
  }
  return cards;
}

function changeCtgyName(contenttypeid) {
  let ctgyNameArr = [];
  if (contenttypeid == "12") {
    ctgyNameArr[0] = "touristAttraction";
    ctgyNameArr[1] = "관광지";
  } else if (contenttypeid == "39") {
    ctgyNameArr[0] = "restaurant";
    ctgyNameArr[1] = "음식점";
  } else if (contenttypeid == "38") {
    ctgyNameArr[0] = "shopping";
    ctgyNameArr[1] = "쇼핑";
  } else if (contenttypeid == "14") {
    ctgyNameArr[0] = "culture";
    ctgyNameArr[1] = "문화시설";
  } else if (contenttypeid == "25") {
    ctgyNameArr[0] = "travel";
    ctgyNameArr[1] = "여행코스";
  } else if (contenttypeid == "28") {
    ctgyNameArr[0] = "leports";
    ctgyNameArr[1] = "레포츠";
  } else if (contenttypeid == "15") {
    ctgyNameArr[0] = "festival";
    ctgyNameArr[1] = "축제공연행사";
  } else if (contenttypeid == "32") {
    ctgyNameArr[0] = "lodgment";
    ctgyNameArr[1] = "숙박";
  }
  return ctgyNameArr;
}

function readCookie(searchCookieName) {
  let cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    let cookieName = cookie.split("=")[0];
    let cookieValue = cookie.split("=")[1];
    if (cookieName.trim() == searchCookieName) return cookieValue;
  }
  return 0;
}

function saveAllCookies(cookiesObj, expDate) {
  console.log("saveAllCookie", cookiesObj, "expDate", expDate);

  let now = new Date();
  now.setDate(now.getDate() + expDate);
  console.log(now);

  for (let key in cookiesObj) {
    document.cookie =
      key + "=" + cookiesObj[key] + ";expires=" + now.toUTCString();
  }
}

function readAllCookies() {
  let cookies = document.cookie.split(";");
  let cookiesObj = new Object();
  for (let cookie of cookies) {
    cookiesObj[cookie.split("=")[0].trim()] = cookie.split("=")[1];
  }
  console.log("readAllCookies", cookiesObj);
  return cookiesObj;
}
