// HTML elements
const $loader = document.getElementById('loader');
const $timeline = document.getElementById('timeline');
const $slides = document.getElementById('modal-slides');
const $carousel = document.getElementById('carousel');
const $carouselSlides = $carousel.querySelector('.carousel-inner');
const $events = document.getElementById('modal-table');
const $table = document.getElementById('table');
const $tableItems = $table.querySelector('tbody');
const $years = document.getElementById('years');
const $search = document.getElementById('search');
const $dates = document.getElementById('dates');
const $toast = document.getElementById('toast');
const $toastMessage = $toast.querySelector('.toast-body');

const slidesModal = new bootstrap.Modal($slides, { keyboard: true });
const tableModal = new bootstrap.Modal($events);

// Variables
var dates = [ -52, 0, 476, 1492, 1789 ];
var eventsData = [];
var axeMin = null;
var axeMax = null;
var axeTot = null;
var dateMin = null;
var dateMax = null;
var dateTot = null;
var idMin = null;
var idMax = null;
var currentEvent = null;

// FUNCTIONS
getJSON('./data_timeline.json');

// Retrieve data
async function getJSON(url) {
  let json = await fetch(url);
  if (json.ok) {
    eventsData = await json.json();
    //toastMessage('Fetched ' + events.length + ' events!');
    $loader.style.display = 'none';
    $timeline.style.display = 'block';
    getBounds(eventsData);
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

  idMin = eventsData.reduce((min, i) => i.Id < min.Id ? i : min).Id;
  idMax = eventsData.reduce((max, i) => i.Id > max.Id ? i : max).Id;

  // Calculate ranges
  axeTot = Math.abs(axeMax - axeMin);
  dateTot = Math.abs(dateMax - dateMin);

  // Scale the timeline height
  $timeline.style.minHeight = dateTot + 'rem';

  startDrawing(events);
}

// Generating stuff
function startDrawing(events) {
  renderYears(dateMin, dateMax);
  renderEvents(events);
  manageYearsMenu(dates);
  carouselControls();
}

// Vertical years
function renderYears(min, max) {
  for (let i = min; i <= max; i++) {
    let year = document.createElement('div');
    year.id = 'year-' + i;
    year.classList.add('year');
    year.style.cssText = 'top:' + getPosY(i) + '%;';
    $timeline.appendChild(year);
  }
}

// Render Events
function renderEvents(events) {
  for (let i = 0; i < events.length; i++) {
    // Draw
    if ((events[i].Axe || events[i].Axe == 0) && (events[i].Date || events[i].Date == 0) && (events[i].Date != "/" || events[i].Axe != "/"))  {
      renderEvent(events[i], i);
      renderRow(events[i]);
    } else if ((events[i].Axe == null) && (events[i].Date == null)) {
      addGenericEvent(events[i], i);
      renderRow(events[i]);
    };
    //renderSlide(events[i], i);
  }
}

// Add event to the timeline
function renderEvent(event, id) {
  let card = document.createElement('div');
  card.id = 'event-' + id;
  card.classList.add('card', 'text-center', 'btn', 'p-0', 'event');
  card.style.cssText = 'left:' + getPosX(event.Axe) + '%;top:' + getPosY(event.Date) + '%;';
  card.onclick = function() { /*displaySlideModal(id);*/ loadSlide(event.Id); };

  card.innerHTML = [
    '<div class="card-header d-flex align-items-center justify-content-center py-1">',
      '<span class="d-inline-block bg-secondary rounded-circle p-1 bullet">',
        '<span class="line" style="height:' + getDuration(event.Date, event.Fin) + 'rem;"></span>',
      '</span>',
    '</div>',
    '<div class="card-body p-2">',
      '<h5 class="card-title fs-6 fw-bold mb-1">' + event.Date + '</h5>',
      '<p class="card-text fw-normal">' + (event.Titre || '') + '</p>',
    '</div>',
  ].join('');

  $timeline.appendChild(card);
}

// Create the event's slide (outdated)
function renderSlide(event, id) {
  let slide = document.createElement('div');
  slide.id = 'slide-' + id;
  slide.classList.add('carousel-item', 'w-100', 'h-100', 'slide');

  slide.innerHTML = [
    '<div class="carousel-caption d-md-block h-100 top-0 bottom-0 p-3 overflow-scroll">',
      '<h5>' + (event.Titre || '') + '</h5>',
      '<p class="fw-bold">' + renderDates(event.Date, event.Fin) + '</p>',
      '<p class="text-justify">' + (event.Explication || '') + '</p>',
      '<img class="img-fluid" src="' + (event.Image || './assets/pixel.png') + '">',
    '</div>'
  ].join('');

  $carouselSlides.appendChild(slide);
}

// Create the event's table row
function renderRow(event) {
  let row = document.createElement('tr');
  row.innerHTML = [
    '<td class="fw-bold">' + renderDates(event.Date, event.Fin) + '</td>',
    '<td>' + (event.Titre || '') + '</td>',
    '<td class="text-justify fst-italic">' + (event.Explication || '') + '</td>'
  ].join('');

  $tableItems.appendChild(row);
}

// Load slide for current event
function loadSlide(id) {
  let event = eventsData.find(function(i) { return i.Id == id; });
  if (!event) return;
  currentEvent = id;

  let slide = document.createElement('div');
  slide.id = 'slide-' + id;
  slide.classList.add('carousel-item', 'w-100', 'h-100', 'slide', 'active');

  slide.innerHTML = [
    '<div class="carousel-caption d-md-block h-100 top-0 bottom-0 p-3 overflow-scroll">',
      '<h5>' + (event.Titre || '') + '</h5>',
      '<p class="fw-bold">' + renderDates(event.Date, event.Fin) + '</p>',
      '<p class="text-justify">' + (event.Explication || '') + '</p>',
      '<img class="img-fluid" src="' + (event.Image || './assets/pixel.png') + '">',
    '</div>'
  ].join('');

  $carouselSlides.innerHTML = '';
  $carouselSlides.appendChild(slide);

  slidesModal.show();
}

// Handle click on carousel controls
function carouselControls() {
  let $prev = $carousel.querySelector('.carousel-control-prev');
  let $next = $carousel.querySelector('.carousel-control-next');

  $prev.onclick = function() { prevEvent() };
  $next.onclick = function() { nextEvent() };
};
function prevEvent() {
  let id = currentEvent <= idMin ? idMax : currentEvent - 1;
  loadSlide(id);
};
function nextEvent() {
  let id = currentEvent >= idMax ? idMin : currentEvent + 1;
  loadSlide(id);
};

// Display slide modal (outdated)
function displaySlideModal(event) {
  let active = $carousel.querySelector('.active');
  let item = $carousel.querySelector('#slide-' + event);
  if (active) active.classList.remove('active');
  item.classList.add('active');

  slidesModal.show();
};

// Display table modal
function displayTableModal() {
  tableModal.show();
};

// Add generic event to the menu
function addGenericEvent(event, id) {
  let date = document.createElement('li');
  date.innerHTML = '<li><a class="dropdown-item rounded-2">' + event.Titre + '</a></li>'
  date.onclick = function() { /*displaySlideModal(id);*/ loadSlide(event.Id); };
  $dates.appendChild(date);
}

// Generate dates menu++
function manageYearsMenu(years) {
  // Writing important dates
  for (let i = years.length - 1; i >= 0; i--) {
    let year = document.createElement('li');
    year.innerHTML = '<li><a class="dropdown-item rounded-2" href="#year-' + years[i] + '">' + years[i] + '</a></li>'
    $years.appendChild(year);
  }

  // Add listener to the year input
  $search.addEventListener('blur', function() {
    scrollToYear(this.value);
  });

  // Scroll to year (onload)
  let year = window.location.hash;
  if (year && year.indexOf('#year-') == 0) window.location.hash = ''; scrollToYear(year.replace('#year-', ''));
}

// HELPERS

// Render event's date(s)
function renderDates(start, end) {
  if (start && end && start != null && end != null) return start + '&nbsp;/&nbsp;' + end;
  else if (start && start != null) return start;
  else return '';
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

// Scroll to year
function scrollToYear(year) {
  year = parseInt(year);
  if (!year) return;
  else if (year < dateMin) year = dateMin;
  else if (year > dateMax) year = dateMax;
  window.location.hash = 'year-' + year;
}

// Trigger message
function toastMessage(message) {
  $toastMessage.innerHTML = message;

  let toast = new bootstrap.Toast($toast);
  toast.show();
}