// ------popper-js------
tippy("#Upload_btn", {
  content: "Import CSV!",
  arrow: true,
});
const navSlide = () => {
  const menu = document.querySelector(".menu");
  const nav = document.querySelector(".system_header");
  const btn_Link = document.querySelectorAll(".btn_link");

  menu.addEventListener("click", () => {
    nav.classList.toggle("show_nav");
  });
  document.querySelectorAll(".btn_link").forEach((n) =>
    n.addEventListener("click", () => {
      nav.classList.remove("show_nav");
    })
  );
};
navSlide();
