// HTML elements
const $loader = document.getElementById('loader');
const $timeline = document.getElementById('timeline');
const $modal = document.getElementById('modal');
const $carousel = document.getElementById('carousel');
const $carouselSlides = $carousel.querySelector('.carousel-inner');
const $search = document.getElementById('search');
const $toast = document.getElementById('toast');
const $toastMessage = $toast.querySelector('.toast-body');

// Variables
var events = [];
var axeMin = null;
var axeMax = null;
var axeTot = null;
var dateMin = null;
var dateMax = null;
var dateTot = null;

// FUNCTIONS
getJSON('./data_timeline.json');

// Retrieve data
async function getJSON(url) {
  let json = await fetch(url);
  if (json.ok) {
    events = await json.json();
    //toastMessage('Fetched ' + events.length + ' events!');
    $loader.style.display = 'none';
    getBounds(events);
  } else { toastMessage('Oops, an error occured while retrieving the events: ' + response.status); }
}

// Calculate zone
function getBounds(events) {
  for (var i = 0; i < events.length; i++) {
    // Get min and max
    if (events[i].Axe && events[i].Axe < axeMin) axeMin = events[i].Axe;
    if (events[i].Axe && events[i].Axe > axeMax) axeMax = events[i].Axe;

    if (events[i].Date && events[i].Date < dateMin) dateMin = events[i].Date;
    if (events[i].Date && events[i].Date > dateMax) dateMax = events[i].Date;
    if (events[i].Fin && events[i].Fin > dateMax) dateMax = events[i].Fin;
  }

  // Calculate ranges
  axeTot = Math.abs(axeMax - axeMin);
  dateTot = Math.abs(dateMax - dateMin);

  // Scale the timeline height
  $timeline.style.minHeight = dateTot + 'rem';

  // Keep going
  renderEvents(events);
}

// Render Events
function renderEvents(events) {
  let eventId = 0;
  let genericId = 0;

  for (var i = 0; i < events.length; i++) {
    // Draw
    if (events[i].Axe && events[i].Date) {
      drawEvent(events[i], eventId);
      writeEvent(events[i], eventId);
      eventId++;
    } else {
      // FLOW POUR LES EVENTS GENERIQUES
      genericId++;
    };
  }
}

// Add event to the timeline
function drawEvent(event, id) {
  let card = document.createElement('div');
  card.id = 'event-' + id;
  card.classList.add('card', 'text-center', 'btn', 'p-0', 'event');
  card.style.cssText = 'left:' + getPosX(event.Axe) + '%;top:' + getPosY(event.Date) + '%;';
  card.onclick = function() { displayModal(id); };

  card.innerHTML = [
    '<div class="card-header d-flex align-items-center justify-content-center">',
      '<span class="d-inline-block bg-secondary rounded-circle p-1 bullet">',
        '<span class="line" style="height:' + getDuration(event.Date, event.Fin) + 'rem;"></span>',
      '</span>',
    '</div>',
    '<div class="card-body">',
      '<h5 class="card-title fs-6 fw-bold">' + event.Date + '</h5>',
      '<p class="card-text fw-normal">' + (event.Titre || '') + '</p>',
    '</div>',
  ].join('');

  $timeline.appendChild(card);
}

// Create the event's carousel item
function writeEvent(event, id) {
  let slide = document.createElement('div');
  slide.id = 'slide-' + id;
  slide.classList.add('carousel-item', 'w-100', 'h-100', 'slide');

  slide.innerHTML = [
    '<div class="carousel-caption d-md-block">',
      '<h5>' + (event.Titre || '') + '</h5>',
      '<p>' + renderDates(event.Date, event.Fin) + '</p>',
      '<p>' + (event.Explication || '') + '</p>',
    '</div>'
  ].join('');

  $carouselSlides.appendChild(slide);
}

// Display modal
function displayModal(event) {
  let active = $carousel.querySelector('.active');
  let item = $carousel.querySelector('#slide-' + event);
  if (active) active.classList.remove('active');
  item.classList.add('active');

  let modal = new bootstrap.Modal($modal, { keyboard: true });
  modal.show();
};

// HELPERS

// Trigger message
function toastMessage(message) {
  $toastMessage.innerHTML = message;

  let toast = new bootstrap.Toast($toast);
  toast.show();
}

// Render event's date(s)
function renderDates(start, end) {
  if (end && end != null) return start + '&nbsp;/&nbsp;' + end;
  else return start;
}

// Place the card on the X axis ('axe')
function getPosX(axe) {
  return (Math.abs(Math.abs(axeMin) + axe) / axeTot * 100).toFixed(2);
};

// Place the card on the Y axis ('date')
function getPosY(date) {
  return (Math.abs(date - Math.abs(dateMax)) / dateTot * 100).toFixed(2);
};

// Calculate the duration bar
function getDuration(start, end) {
  if (end === null) return 0;
  return Math.round((end - start));
};