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

      // Step 2: Call the v3/organizations API to locate the organisation you want to update
      const orgOptions = {
        url: 'https://api.us-south.cf.cloud.ibm.com/v3/organizations',
        headers: {
          'authorization': uaaToken,
          'content-type': 'application/json'
        },
        method: 'GET'
      };

      return rp(orgOptions).then(function (parsedBody2) {
        return [parsedBody2, uaaToken];
      });
    })
    .then(function (vals) {

      const [parsedBody2, uaaToken] = vals;
      let orgGuid = "";

      let jsonData = JSON.parse(parsedBody2)
      for (let i = 0; i < jsonData.resources.length; i++) {
          let resource = jsonData.resources[i];
          if (resource.name === orgName) {
            orgGuid = resource.guid;
            console.log(orgGuid);
            break;
          }
      }
      var dataObj = {
        "name": orgName + "-XXXX"
      };
      var dataString = JSON.stringify(dataObj)

      // Step 3: Call the v2/organizations API to actually update the org name
      const orgModOptions = {
        url: 'https://mccp.us-south.cf.cloud.ibm.com/v2/organizations/' + orgGuid,
        headers: {
          'authorization': uaaToken,
          'content-type': 'application/json'
        },
        method: 'PUT',
        body: dataString
      };

      return rp(orgModOptions);
    })
    .catch(function (err) {
        console.log(err);
    });
