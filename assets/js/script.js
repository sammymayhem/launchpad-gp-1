var launchAPIURL = 'https://api.spacexdata.com/v4/launches';
var payloadAPIURL = 'https://api.spacexdata.com/v4/payloads';
var crewAPIURL = 'https://api.spacexdata.com/v4/crew';

var launches = {
  past: null,
  current: null,
  future: null,
}

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

function getLaunchApi() {
  fetch(launchAPIURL)
    .then(function (response) {
      if (response.status !== 200) {
        console.log("Check response status!");
      }
      return response.json();
    })
    .then(function (data) {

      data.sort(function(a, b){return a.date_unix - b.date_unix});

      for (var i = 0; i < data.length-2; i++){
        if (currentMoment >= data[i].date_unix && currentMoment < data[i+1].date_unix){
            launches.past = new launch(data[i].details, data[i].date_unix, data[i].crew, data[i].payloads);
            launches.current = new launch(data[i+1].details, data[i+1].date_unix, data[i+1].crew, data[i+1].payloads);
            launches.future = new launch(data[i+2].details, data[i+2].date_unix, data[i+2].crew, data[i+2].payloads);
        }
      }

      replaceCrewIDWithName();
      replacePayloadIDWithName();


      renderLaunchData("past");
      renderLaunchData("current")
      renderLaunchData("future")
    });
}

function replaceCrewIDWithName() {
  fetch(crewAPIURL)
    .then(function (response) {
      if (response.status !== 200) {
        console.log("Check response status!");
      }
      return response.json();
    })
    .then(function (data) {
      
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
    });
}

function replacePayloadIDWithName() {
  fetch(payloadAPIURL)
    .then(function (response) {
      if (response.status !== 200) {
        console.log("Check response status!");
      }
      return response.json();
    })
    .then(function (data) {
      
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
    });
}

function renderLaunchData(elemID){
  var mainContainerEl = $('#' + elemID + '-launch-info');

  var launchInfo = launches[elemID];

  console.log(launchInfo);
  
  var countDownEl = $('<h2>');
  var countDownTimerEl = $('<p>');
  countDownEl.text("Count Down To Launch:");
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
  var crewEl = $('<p>');
  crewTagEl.text("Crew:");
  crewEl.text(launchInfo.crew.join('\n'));

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

var currentMoment = moment().unix();
getLaunchApi();
