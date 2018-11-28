window.onload = function(e) {
  const navIcon = document.getElementsByClassName('nav__icon')[0];
  const navList = document.querySelector(".nav__links ul");
  navIcon.addEventListener('click', function() {
    navList.classList.toggle("showing");
  });
}
