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

      // Step 2: Call the v3/organizations API to locate the organisation
      // where you want to create the space under
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
            break;
          }
      }

      const dataObj = {
          name: 'new-space-' + Math.floor(Date.now() / 1000),
          relationships: {
            organization: {
              data: {
                guid: orgGuid
              }
            }
          }
      };
      const dataString = JSON.stringify(dataObj);

      // Step 3: Call the v3/spaces API to create a new space
      const space_options = {
        url: 'https://api.us-south.cf.cloud.ibm.com/v3/spaces',
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
