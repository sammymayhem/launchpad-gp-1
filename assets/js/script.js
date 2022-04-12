var launchAPIURL = 'https://api.spacexdata.com/v4/launches';
var payloadAPIURL = 'https://api.spacexdata.com/v4/payloads';
var crewAPIURL = 'https://api.spacexdata.com/v4/crew';

function getApi(launchAPIURL) {
  fetch(launchAPIURL)
    .then(function (response) {
      console.log(response.status);
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

      console.log(launches);
    });
}

var currentMoment = moment().unix();
getApi(launchAPIURL);


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