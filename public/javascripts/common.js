$('a[data-toggle="collapse"]').on('click', function(e){
  $($(this).attr('href')).toggleClass('collapsed');
  e.preventDefault();
});
$('a[data-toggle="drawer"]').on('click', function(e){
  $($(this).attr('href')).toggleClass('closed');
  $('body').toggleClass('no-scrolled');
  e.preventDefault();
});
