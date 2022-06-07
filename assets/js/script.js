var launchAPIURL = 'https://api.spacexdata.com/v4/launches';
var payloadAPIURL = 'https://api.spacexdata.com/v4/payloads';
var crewAPIURL = 'https://api.spacexdata.com/v4/crew';
var nasaAPODURL = 'https://api.nasa.gov/planetary/apod?api_key=py57IzyGVvqWhA4eZ4r3dX4dLx2eRV1JbInR5nlB'

// global object to hold past current and future launches
var launches = {
  past: null,
  current: null,
  future: null,
}

// holds info pertaining to each launch
function launch(description, launchDate, crew, payloadCustomers){
  if (description === null){
    this.description = "CONFIDENTIAL";
  }
  else{
    this.description = description;
  }
  
  this.launchDate = launchDate;
  this.crew = crew;
  this.payloadCustomers = payloadCustomers;
}

// grabs nasa picture of the day
function getNasaAPODApi() {
  var fullURL = nasaAPODURL + "&start_date=" + moment().subtract(1, 'day').format("YYYY-MM-DD")
  fetch(fullURL)
    .then(function (response) {
      if (response.status !== 200) {
        console.log("Check response status!");
      }
      return response.json();
    })
    .then(function (data) {
      renderAPODs(data);
    });
}

// grabs spacex launch info
function getLaunchApi() {
  fetch(launchAPIURL)
    .then(function (response) {
      if (response.status !== 200) {
        console.log("Check response status!");
      }
      return response.json();
    })
    .then(function (data) {
      
      // data is not returned in chronological order. must be sorted chronologically to search for past, current, future
      data.sort(function(a, b){return a.date_unix - b.date_unix});

      for (var i = 0; i < data.length-2; i++){
        if (currentMoment >= data[i].date_unix && currentMoment < data[i+1].date_unix){
            launches.past = new launch(data[i].details, data[i].date_unix, data[i].crew, data[i].payloads);
            launches.current = new launch(data[i+1].details, data[i+1].date_unix, data[i+1].crew, data[i+1].payloads);
            launches.future = new launch(data[i+2].details, data[i+2].date_unix, data[i+2].crew, data[i+2].payloads);
        }
      }

      // launch data returns crew ids.... not their names. must do separate api call to get 
      // crew name given their id
      replaceCrewIDWithName();
    });
}

// calls spacex crew api
function replaceCrewIDWithName() {
  fetch(crewAPIURL)
    .then(function (response) {
      if (response.status !== 200) {
        console.log("Check response status!");
      }
      return response.json();
    })
    .then(function (data) {
      
      // grabs crew name given crew id, replaces crew name property
      for (var i = 0; i < launches.past.crew.length; i++){
        var name = data.find(o => o.id === launches.past.crew[i]).name;
        launches.past.crew[i] = name;
      }

      for (var i = 0; i < launches.current.crew.length; i++){
        var name = data.find(o => o.id === launches.current.crew[i]).name;
        launches.current.crew[i] = name;
      }

      for (var i = 0; i < launches.future.crew.length; i++){
        var name = data.find(o => o.id === launches.future.crew[i]).name;
        launches.future.crew[i] = name;
      }

      // launch data returns payload ids.... not their names. must do separate api call to get 
      // payload name given their id
      replacePayloadIDWithName();
    });
}

// calls spacex payload api
function replacePayloadIDWithName() {
  fetch(payloadAPIURL)
    .then(function (response) {
      if (response.status !== 200) {
        console.log("Check response status!");
      }
      return response.json();
    })
    .then(function (data) {
      
      // grabs payload name given payload id, replaces payload name property
      for (var i = 0; i < launches.past.payloadCustomers.length; i++){
        var name = data.find(o => o.id === launches.past.payloadCustomers[i]).name;
        launches.past.payloadCustomers[i] = name;
      }

      for (var i = 0; i < launches.current.payloadCustomers.length; i++){
        var name = data.find(o => o.id === launches.current.payloadCustomers[i]).name;
        launches.current.payloadCustomers[i] = name;
      }

      for (var i = 0; i < launches.future.payloadCustomers.length; i++){
        var name = data.find(o => o.id === launches.future.payloadCustomers[i]).name;
        launches.future.payloadCustomers[i] = name;
      }

      // renders relevant data to carousel cards specified by id
      renderLaunchData("past");
      renderLaunchData("current")
      renderLaunchData("future")
    });
}

// grabs image elements, changes their src attribute to current picture of day
function renderAPODs(data){
  var todayImgEl = $('.img-today');
  var yesterdayImgEl = $('.img-yesterday');
  todayImgEl.attr('src', data[1].url);
  yesterdayImgEl.attr('src', data[0].url);
}

// renders relevant data for each card
function renderLaunchData(elemID){
  var mainContainerEl = $('#' + elemID + '-launch-info');

  var launchInfo = launches[elemID];
  
  var countDownEl = $('<h4>');
  var countDownTimerEl = $('<p>');
  if (elemID === "past") {
    countDownEl.text("Time Since Launch:");
  }
  else{
    countDownEl.text("Count Down To Launch:");
  }
  
  startCountDown(countDownTimerEl, launchInfo.launchDate);

  var descriptionTagEl = $('<h4>');
  var descriptionEl = $('<p>');
  descriptionTagEl.text("Description:");
  descriptionEl.text(launchInfo.description);
  
  var launchDateTagEl = $('<h4>');
  var launchDateEl = $('<p>');
  launchDateTagEl.text("Launch Date:");
  launchDateEl.text(moment(launchInfo.launchDate, "X").format('lll') + " (local)");

  var crewTagEl = $('<h4>');
  var crewEl = $('<div>');
  crewTagEl.text("Crew:");

  if (launchInfo.crew.length === 0) {
    var crewMemberEl = $('<p>');
    crewMemberEl.text("UNMANNED");
    crewEl.append(crewMemberEl);
  }
  else{
    for (var i = 0; i < launchInfo.crew.length; i++){
      var crewMemberEl = $('<p>');
      crewMemberEl.text(launchInfo.crew[i]);
      crewEl.append(crewMemberEl);
    }
  }

  var payloadTagEl = $('<h4>');
  var payloadEl = $('<p>');
  payloadTagEl.text("Payload Customers:");
  payloadEl.text(launchInfo.payloadCustomers.join('\n'));

  mainContainerEl.append(countDownEl);
  mainContainerEl.append(countDownTimerEl);
  mainContainerEl.append(descriptionTagEl);
  mainContainerEl.append(descriptionEl);
  mainContainerEl.append(launchDateTagEl);
  mainContainerEl.append(launchDateEl);
  mainContainerEl.append(crewTagEl);
  mainContainerEl.append(crewEl);
  mainContainerEl.append(payloadTagEl);
  mainContainerEl.append(payloadEl);
}

// starts a countdown timer on each element
function startCountDown(element, launchDate) {
  var then = moment.unix(launchDate)

  setInterval(function() {
    var now = moment();
    var diff = then.diff(now);
    var dur = moment.duration(diff);
    var s = Math.floor(dur.asHours()) + " : " + String(Math.abs(Math.floor(dur.asMinutes())%60)).padStart(2, '0') + " : " + String(Math.abs(Math.floor(dur.asSeconds())%60)).padStart(2, '0');

    element.text(s);

  }, 1000);
}

// used for flipping background picture according to toggle switch
function setBackgroundImg(bgElem, state){
  if (state){
    bgElem.css("background-image", "url(assets/images/rocket.jpg)");
  } 
  else{
    bgElem.css("background-image", "url(assets/images/milkyway.jpg)");
  }
}

// grab current moment to use for countdown timers
var currentMoment = moment().unix();

// starts fetching spacex api data and running chain of functions
getLaunchApi();

// grabs nasa pictures of the day and renders to sidenav
getNasaAPODApi();

// handles toggle button state, switching background image, and setting local storage
var button = $('#bg-switch-button');
var backgroundimg = $('.bg-image');
var backgroundState = JSON.parse(localStorage.getItem("bgState"));

if (backgroundState === null) {
  backgroundState = false;
}

button.prop('checked', backgroundState);
setBackgroundImg(backgroundimg, backgroundState);

button.on("change", function(){
  var state = $(this).prop('checked');
  localStorage.setItem("bgState", state);
  setBackgroundImg(backgroundimg, state);
});
