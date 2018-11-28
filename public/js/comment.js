$('.comment-form').on('submit', function(e) {
  console.log('onclick');
  e.preventDefault();
  const url = $(this).attr('action');
  $.ajax({
    headers: {"X-CSRF-Token": $("#comment-csrf").attr('value') },
    type: 'POST',
    url,
    data: $(this).serialize()
  }).done(function(data){
    // get comment back to display
    // user, id, message...
    $('.comments__header').text(`${data.commentsLength + 1} Comments`);
    let commentUser = $('<div>').addClass('comments__item-user').text(data.comment.user);
    let commentTimestamp = $('<div>').addClass('comments__item-timestamp').text(data.formattedTimestamp);
    let commentMessage = $('<div>').addClass('comments__item-message').text(data.comment.message);
    let comment = $('<li>').addClass('comments__item').append(commentUser).append(commentTimestamp).append(commentMessage).appendTo('.comments__list');
    $('.comment-form')[0].reset();
  }).fail(function(req, status, error) {
    console.log(status);
    console.log(error);
  });
});
