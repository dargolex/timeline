$(document).ready(function() {
  const banner = $('#banner');
  const container = $('#timeline');
  const debug = $('#info');
  const search = $('#search');
  const xMargin = 250;
  const yMargin = $(container).width() / 100;
  const xUnit = 20;
  const yUnit = 15;
  var events = [];
  var xMin = 0;
  var xMax = 1;
  var xTot = 1;
  var xSize = 1;
  var yTot = 180;
  var ySize = 180;

  // Retrieve Data
  $.getJSON('https://dargolex.github.io/timeline/data_timeline.json', function(data) {
    events = data;
    calcLimits(events);
    drawEvents(events);
    displayModals();
    scrollToYear();
    $('.spinner-border').hide();
  }).fail(function() { $(debug).html('<span style="color:red;">[Error]</span> Couldn\'t retrieve data.'); });

  // Calc Limits
  function calcLimits(items) {
    $(items).each(function(index, item){
      item.Date < xMin ? xMin = item.Date : '';
      item.Date > xMax ? xMax = item.Date : ''; //certains events n'ont pas de fin ???
      item.Fin > xMax ? xMax = item.Fin : '';
    });
    xTot = Math.abs(xMax - xMin);
    xSize = xTot * xUnit;
    ySize = yTot * yUnit;
    //$(container).width(xSize);
    $(container).height(xSize);
    //$(debug).html(xSize + '/' + ySize + 'px');
  }

  // Draw Events
  function drawEvents(items) {
    $(items).each(function(index, item) {
      if (item.Date) {
        $(container).append([
          '<div id="ev' + (index + 1) + '" class="event" style="left:' + getPositionY(item.Axe + 80) + 'px;bottom:' + getPositionX(item.Date) + 'px;z-index:' + (items.length - index) + '">',
            '<span class="bullet"><span class="line" style="height:' + getDuration(item.Date, item.Fin) + 'px;"></span></span>',
            '<span class="name">' + (item.Titre || index) + '</span>',
            '<span class="date">' + item.Date + '</span>',
          '</div>',
          '<div id="mod' + (index + 1) + '" class="modal">',
            '<div class="modal_name">' + (item.Titre || index) + '</div>',
            '<div class="modal_date"> ' + renderDates(item.Date, item.Fin) + '</div>',
            '<div class="modal_description">' + (item.Explication || '') + '</div>',
          '</div>'
        ].join(''));
      } else {
        $(banner).append([
          '<div id="ev' + (index + 1) + '" class="generic-event" style="z-index:' + (items.length - index) + '">',
            '<span class="name">' + (item.Titre || index) + '</span>',
          '</div>',
          '<div id="mod' + (index + 1) + '" class="modal">',
            '<div class="modal_name">' + (item.Titre || index) + '</div>',
            '<div class="modal_description">' + (item.Explication || '') + '</div>',
          '</div>'
        ].join(''));
      };

      $(debug).html('Retrieved ' + items.length + ' events.');
      setTimeout( function() { $(debug).hide(); }, 3000);
    });
  };
  function renderDates(start, end) {
    if (end != null) return start + '&nbsp;/&nbsp;' + end;
    else return start;
  }

  // Calc Positions
  function getPositionX(date) {
    let scaleX = (xSize - xMargin) / xTot;
    return Math.round(((Math.abs(xMin) + date) * scaleX) + (xMargin / 2));
  };
  function getPositionY(date) {
    let scaleY = ($(container).width() - yMargin) / yTot;
    return Math.round((date * scaleY) + (yMargin / 2));
  };
  function getDuration(start, end) {
    if (end === null) return 0;
    let scaleX = (xSize - xMargin) / xTot;
    return Math.round((end - start) * scaleX);
  };

  // Display modals
  function displayModals() {
    $('.event, .generic-event').hover(function() {
      $('#mod' + $(this).attr('id').replace('ev','')).addClass('active');
    }, function() {
      $('.modal.active').removeClass('active');
    });
  };

  // Scroll to year
  function scrollToYear() {
    $(search).on('change paste keyup blur', function() {
      let search = parseInt($(this).val().trim());
      if (search >= xMin && search <= xMax) {
        $('body').animate({ scrollTop: $(container).height() - getPositionX(search) });
      };
    });
  }

  // Display Toast
  //const toastTrigger = document.getElementById('liveToastBtn');
  const toastDiv = document.getElementById('liveToast');
  //if (toastTrigger) {
    //toastTrigger.addEventListener('click', () => {
      const toastVar = new bootstrap.Toast(toastDiv);
      ///////////////////toastVar.show();
    //})
  //}
});