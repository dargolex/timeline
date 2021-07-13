$(document).ready(function() {
  /*TEST*/
  $('body').append('<div id="timeline"></div>');
  var testJSON = [{ "name": "Event 1", "start": 476, "end": 1492, "continent": 4, "description": "LALALAAAA" }, { "name": "Event 2", "start": 234, "end": 567, "continent": 1, "description": "LALALAAAA" }];
  drawEvents(testJSON);
  /*END*/


  // Retrieve Data
  $.getJSON('./data.json', function(data){
    events = data;
    drawEvents(events);
  });

  // Draw Events
  function drawEvents(items) {
    $(items).each(function(index, item){
      if(item.start){
        $('#timeline').append([
          '<div id="ev' + index + '" class="event" style="top:' + getPositionY(item.continent) + 'px;left:' + getPositionX(item.start) + 'px;">',
            '<span class="name">' + (item.name || index) + '</span>',
            '<span class="bullet"><span class="line" style="width:' + getPositionX(item.end - item.start) + 'px;"></span></span>',
            '<span class="date">' + item.start + '</span>',
            '<div class="modal">' + item.description + '</div>',
          '</div>'
        ].join(''));
      };
    });
  };

  // Calc Positions
  function getPositionX(date) {
    let scaleX = window.innerWidth / 2000;
    return Math.round(date * scaleX);
  };
  function getPositionY(date) {
    let scaleY = window.innerHeight / 5;
    return Math.round(date * scaleY);
  };
});