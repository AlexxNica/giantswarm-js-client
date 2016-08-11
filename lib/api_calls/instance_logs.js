var stampit = require('stampit');
var RequestHelper = require('../request_helper.js');

module.exports = stampit().
  compose(RequestHelper).
  methods({
    instanceLogs: function(params) {
      return this.getRequest(
        this.apiEndpoint + "/v1/org/" + params.organizationName + "/instance/" + params.instanceId + "/logs",
        {
          query: {
            t: params.numLines
          }
        }
      ).
      then(function(response) {
        return {
          result: response.text,
          rawResponse: response
        }
      });
    }
  });