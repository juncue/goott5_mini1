// 페이지 출력 함수
function printPagination() {
    $(".pagination").empty(); 
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
    history.replaceState({}, null, location.pathname);
    currentPage = page;
    getCards(currentPage);
    printPagination();
    $("html, body").animate({ scrollTop: $("#cardArea").offset().top }, 500);
  }