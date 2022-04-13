var launchAPIURL = 'https://api.spacexdata.com/v4/launches';
var payloadAPIURL = 'https://api.spacexdata.com/v4/payloads';
var crewAPIURL = 'https://api.spacexdata.com/v4/crew';

var launches = {
  past: null,
  current: null,
  future: null,
}

function launch(description, launchDate, crew, payloadCustomers){
  this.description = description;
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

      renderLaunchData();

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

// FUNCTION TO BUILD NEXT!!!!!
function renderLaunchData(){
  console.log("Build me up before you go go");
}


var currentMoment = moment().unix();
getLaunchApi();


