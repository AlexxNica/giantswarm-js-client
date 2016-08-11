var stampit = require('stampit');

if (typeof WebSocket === 'undefined') {
  var WebSocket = require('ws');
}

module.exports = stampit().
  methods({
    streamStats: function(params) {
      var self = this;
      var url = "/v1/org/" + params.organizationName + "/stream/stats";
      var postPayload = {instances: params.instanceIds, interval: params.interval};
      return this.postRequest(this.apiEndpoint + url, postPayload).
      then(function(response) {
        var token = response.body.data;
        var wsUrl = this.websocketEndpoint() + url + '?p=' + token;
        var socket = new WebSocket(wsUrl);

        return {
          result: response.body.data,
          websocket: socket,
          rawResponse: response
        }
      }.bind(this));
    }
  });