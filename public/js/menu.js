$('.menu__nav li').on('click', function() {
  let drinks = $('.menu__content-drinks');
  let food = $('.menu__content-food');
  if ($(this).hasClass('menu__nav-drinks')) {
    $('.menu__nav-active').toggleClass('menu__nav-active');
    $(this).toggleClass('menu__nav-active');
    console.log('drinks');
    drinks.css('display', 'grid');
    food.css('display', 'none');
  }
  if ($(this).hasClass('menu__nav-food')) {
    $('.menu__nav-active').toggleClass('menu__nav-active');
    $(this).toggleClass('menu__nav-active');
    console.log('food');
    drinks.css('display', 'none');
    food.css('display', 'grid');
  }
});
