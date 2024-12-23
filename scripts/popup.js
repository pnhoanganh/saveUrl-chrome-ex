const addBtn = document.getElementById("add-btn");
const urlInput = document.getElementById("url-input");
const urlListEl = document.querySelector(".url-list");

let urlList = getSavedUrls();

renderUrlList();

addBtn.addEventListener("click", () => {
  const urlName = urlInput.value;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (
      urlList.some(
        ({ title }) => title === urlName || title === tabs[0].title
      ) ||
      urlList.some(({ url }) => url === tabs[0].url)
    ) {
      return;
    }

    let pageTitle;
    if (urlName.length > 0) {
      pageTitle = urlName;
    } else {
      pageTitle = tabs[0].title;
    }

    const url = { url: tabs[0].url, title: pageTitle };

    urlList.push(url);
    localStorage.setItem("urls", JSON.stringify(urlList));
    urlInput.value = "";
    renderUrlList();
  });
});

urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addBtn.click();
});

function getSavedUrls() {
  if (localStorage.getItem("urls")) {
    return JSON.parse(localStorage.getItem("urls"));
  }
  return [];
}

function renderUrlList() {
  urlListEl.innerHTML = "";
  if (urlList.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.classList.add("text-muted", "text-center");
    emptyMessage.textContent = "Your URL archive is empty";
    urlListEl.appendChild(emptyMessage);
    return;
  }

  urlList.forEach(({ url, title }, index) => {
    const urlEl = document.createElement("div");
    urlEl.classList.add("url", "list-group-item", "list-group-item-action");
    urlEl.innerHTML = `
      <a href="${url}" class="text-decoration-none text-dark w-100">${title}</a>
      <i class="bi bi-trash3-fill text-danger" data-index="${index}"></i>`;
    urlListEl.appendChild(urlEl);
  });

  const links = urlListEl.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: link.href });
    });
  });

  const deleteBtns = urlListEl.querySelectorAll(".bi-trash3-fill");
  deleteBtns.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      urlList.splice(index, 1);
      localStorage.setItem("urls", JSON.stringify(urlList));
      renderUrlList();
    });
  });
}
