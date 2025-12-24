const searchInput = document.querySelector("#searchInput");
const cards = document.querySelectorAll("#document-list .col");

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();

  cards.forEach(card => {
    const title = card
      .querySelector(".card-title")
      .textContent
      .toLowerCase();

    const description = card
      .querySelector(".card-text")
      .textContent
      .toLowerCase();

    // search theo title + mô tả
    if (title.includes(keyword) || description.includes(keyword)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});
