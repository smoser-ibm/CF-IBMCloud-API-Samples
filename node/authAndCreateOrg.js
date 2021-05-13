var rp = require('request-promise');

const apiKey = '<Put your IBM Cloud API Key here>';

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

      // Step 2: Call the mccp v2/organizations API to create the organisation
      var dataObj = {
        "name": "my-new-organization-" + Math.floor(Date.now() / 1000),
      };

      var dataString = JSON.stringify(dataObj)

      const orgOptions = {
        url: 'https://mccp.us-south.cf.cloud.ibm.com/v2/organizations',
        headers: {
          'Authorization': uaaToken,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: dataString
      };

      return rp(orgOptions);
    })
    .catch(function (err) {
        console.log(err);
    });
