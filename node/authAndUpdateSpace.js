var rp = require('request-promise');

const apiKey = '<Put your IBM Cloud API Key here>';
const orgName = '';

const uaaOptions = {
  url: 'https://iam.cloud.ibm.com/cloudfoundry/login/us-south/oauth/token',
  form: {
    grant_type: 'password',
    username: 'apikey',
    password: apiKey
  },
  headers: {
    'authorization': 'basic ' + (Buffer.from("cf:").toString('base64')),
  },
  method: 'POST'
};

rp(uaaOptions)
    .then(function (parsedBody) {

      //Step 1: Obtain an access token to talk to the Cloud Foundry API
      const uaaToken = "bearer " + JSON.parse(parsedBody).access_token;

      // Step 2: Call the v3/spaces API to locate the space
      // that you want to update
      const spacesOptions = {
        url: 'https://api.us-south.cf.cloud.ibm.com/v3/spaces',
        headers: {
          'authorization': uaaToken,
          'content-type': 'application/json'
        },
        method: 'GET'
      };

      return rp(spacesOptions).then(function (parsedBody2) {
        return [parsedBody2, uaaToken];
      });
    })
    .then(function (vals) {

      const [parsedBody2, uaaToken] = vals;
      let spaceGuid = "";

      let jsonData = JSON.parse(parsedBody2)
      for (let i = 0; i < jsonData.resources.length; i++) {
          let resource = jsonData.resources[i];
          if (resource.name === spaceName) {
             spaceGuid = resource.guid;
             break;
          }
      }

      var dataObj = {
        "name": "new-space-name"
      };
      var dataString = JSON.stringify(dataObj)

      // Step 3: Call the v3/spaces API to update the space name to "new-space-name"
      const space_options = {
        url: 'https://api.us-south.cf.cloud.ibm.com/v3/spaces/' + spaceGuid,
        headers: {
          'authorization': uaaToken,
          'content-type': 'application/json'
        },
        method: 'POST',
        body: dataString
      };

      return rp(space_options);
    })
    .catch(function (err) {
        console.log(err);
    });
