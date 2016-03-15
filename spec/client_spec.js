describe("giantSwarm", function() {

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

  var GiantSwarm = require('../lib/client');
  var configuration = require('./configuration');

  var mocked_request = require('superagent');
  var config = require('./superagent-mock-config');

  require('superagent-mock')(mocked_request, config);

  beforeEach(function() {
    giantSwarm = new GiantSwarm();
    giantSwarm.setApiEndpoint('https://api.giantswarm.io');
    giantSwarm.setAuthToken('valid_token');
    giantSwarm.setClusterId(null);
    giantSwarm.setUnauthorizedCallback(function() { null });
  });

  // setApiEndpoint
  it("should throw an exception when given a non string url", function(done){
    expect(
      function(){ giantSwarm.setApiEndpoint(3) }
    ).toThrowError("Parameter 'url' must be of type string")
    done();
  });

  it("should throw an exception when given no url", function(done){
    expect(
      function(){ giantSwarm.setApiEndpoint() }
    ).toThrowError("Parameter 'url' must be given")
    done();
  });

  it("should set the websocketEndpoint correctly for http", function(done){
    giantSwarm.setApiEndpoint("http://api.example.com");
    expect(giantSwarm._getWebsocketEndpoint()).toEqual('ws://api.example.com');
    done();
  });

  it("should set the websocketEndpoint correctly for https", function(done){
    giantSwarm.setApiEndpoint("https://api.example.com");
    expect(giantSwarm._getWebsocketEndpoint()).toEqual('wss://api.example.com');
    done();
  });

  it("should fetch organizations which the current user is a member of", function(done){
    giantSwarm.setApiEndpoint("https://api.example.io");
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.memberships(function(data){
      expect(typeof(data)).toEqual('object');
      expect(data.length).toBeGreaterThan(0);
      expect(typeof(data[0])).toEqual('string');
      done();
    }, function(err){
      fail(err);
      done();
    });
  });

  // ping

  it("should allow me to ping the right server", function(done){
    giantSwarm.ping(function(){
      done();
    }, function(err){
      fail('ping() error callback called. This shouldn\'t have happened.' + err);
      done();
    });
  });

  it("should not allow me to ping google.com", function(done){
    giantSwarm.setApiEndpoint('https://www.google.com');
    giantSwarm.ping(function(){
      fail('ping() success callback called. This shouldn\'t have happened.');
      done();
    }, function(err){
      done();
    });
  });

  it("should forbid to call ping without callback", function(){
    var func = function() {
      giantSwarm.ping();
    };
    expect(func).toThrowError('an onSuccess callback must be given and it must be a function');
  });

  it("should forbid to call ping with non-function parameter", function(){
    var func = function() {
      giantSwarm.ping("foo");
    };
    expect(func).toThrowError('an onSuccess callback must be given and it must be a function');
  });

  // // authenticate, user

  it("should be able to authenticate a valid user", function(done){
    giantSwarm.authenticate(configuration.existingUser.username,
      configuration.existingUser.password,
      function(){
        authToken = giantSwarm.getAuthToken();
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  it("should not be able to authenticate an invalid user", function(done){
    giantSwarm.authenticate(configuration.existingUser.username,
      'fooBarBlahFakePassword',
      function(){
        fail('an invalid user was able to authenticate');
        done();
      }, function(err){
        done();
      });
  });

  it("should be able to authenticate with a valid token", function(done){
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.user(function(data){
      expect(data.username).toEqual(configuration.existingUser.username);
      done();
    }, function(err){
      fail(err);
      done();
    });
  });

  it("should not be able to authenticate with an invalid token", function(done){
    giantSwarm.setAuthToken('invalid_token');
    giantSwarm.user(function(data){
      fail('user() function called successCallback');
      done();
    }, function(err){
      expect(typeof(err)).toEqual('object');
      done();
    });
  });

  // // setClusterId

  it("should set the clusterId", function(done){
    giantSwarm.setClusterId('fakecluster.example.com');
    expect(giantSwarm._getClusterId()).toEqual("fakecluster.example.com");
    done();
  });

  it("should throw an error on non string clusterIds", function(done){
    expect(function(){giantSwarm.setClusterId(3)}).toThrow();
    expect(function(){giantSwarm.setClusterId()}).toThrow();
    done();
  });

  // // setUnauthorizedCallback

  it("should set the callback and call it when a unauthorized call is made", function(done){
    giantSwarm.setAuthToken('invalid_token');
    giantSwarm.setUnauthorizedCallback(function() { done(); });
    giantSwarm.user(function() {
      fail("Success callback called.")
      done();
    }, function() {

    });
  });

  // // // memberships

  it("should fetch organizations which the current user is a member of", function(done){
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.memberships(function(data){
      expect(typeof(data)).toEqual('object');
      expect(data.length).toBeGreaterThan(0);
      expect(typeof(data[0])).toEqual('string');
      done();
    }, function(err){
      fail(err);
      done();
    });
  });

  // // // organization

  it("should fetch organization details", function(done){
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.organization(configuration.organizationName,
      function(data){
        expect(typeof(data)).toEqual('object');
        expect(typeof(data.id)).toEqual('string');
        expect(typeof(data.members)).not.toEqual('undefined');
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  // // // environments

  it("should fetch environments within an organization", function(done){
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.environments(configuration.organizationName,
      function(data){
        expect(typeof(data)).toEqual('object');
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  // // // services

  it("should fetch services within an environment", function(done){
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.services(configuration.organizationName,
      configuration.environmentName,
      function(data){
        expect(typeof(data)).toEqual('object');
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  // // // serviceStatus

  it("should fetch the status of a service", function(done){
    giantSwarm.serviceStatus(configuration.organizationName,
      configuration.environmentName,
      configuration.serviceName,
      function(data){
        expect(typeof(data)).toEqual('object');
        expect(typeof(data.name)).not.toEqual('undefined');
        expect(typeof(data.components)).not.toEqual('undefined');
        expect(typeof(data.components[0].instances[0].id)).not.toEqual('undefined');
        expect(typeof(data.components[0].instances[0].status)).not.toEqual('undefined');
        expect(data.components[0].instances[0].create_date).toEqual('2015-08-13T08:46:46.827236888Z');
        expect(typeof(data.status)).not.toEqual('undefined');
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  // // // service definition

  it("should fetch the definition of a service", function(done){
    giantSwarm.serviceDefinition(configuration.organizationName,
      configuration.environmentName,
      configuration.serviceName,
      function(data){
        expect(typeof(data)).toEqual('object');
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  // // // service stop

  it("should stop a service", function(done){
   giantSwarm.stopService(configuration.organizationName,
     configuration.environmentName,
     configuration.serviceName,
     function(data){
       // expect(typeof(data)).toEqual('object');
       done();
     }, function(err){
       fail(err);
       done();
     });
  });

  // // // service start

  it("should start a service", function(done){
    giantSwarm.startService(configuration.organizationName,
      configuration.environmentName,
      configuration.serviceName,
      function(data){
        // expect(typeof(data)).toEqual('object');
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  // // // componentStatus

  it("should fetch the status of a known component", function(done){
    giantSwarm.componentStatus(
      configuration.organizationName,
      configuration.environmentName,
      configuration.serviceName,
      configuration.componentName,
      function(data){
        expect(typeof(data)).toEqual('object');
        expect(typeof(data.components)).toEqual('object');
        expect(data.components[0].name).toEqual('webserver');
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  it("calls the error callback on unknown component", function(done){
    giantSwarm.componentStatus(
      configuration.organizationName,
      configuration.environmentName,
      configuration.serviceName,
      "unknown_component",
      function(data){
        fail("success callback was called for an unkown component");
        done();
      }, function(err){
        done();
      });
  });

  // // startComponent

  it("starts a known component", function(done){
    giantSwarm.startComponent(
      configuration.organizationName,
      configuration.environmentName,
      configuration.serviceName,
      "known_component",
      function(data){
        done();
      }, function(err){
        fail("error callback was called for a known component " + err);
        done();
      });
  });

  it("calls the error callback for an unknown component", function(done){
    giantSwarm.startComponent(
      configuration.organizationName,
      configuration.environmentName,
      configuration.serviceName,
      "unknown_component",
      function(data){
        fail("success callback was called for an unknown component");
        done();
      }, function(err){
        done();
      });
  });

  // // stopComponent

  it("stops a known component", function(done){
    giantSwarm.stopComponent(
      configuration.organizationName,
      configuration.environmentName,
      configuration.serviceName,
      "known_component",
      function(data){
        done();
      }, function(err){
        fail("error callback was called for a known component");
        done();
      });
  });

  it("calls error callback for unknown component", function(done){
    giantSwarm.stopComponent(
      configuration.organizationName,
      configuration.environmentName,
      configuration.serviceName,
      "unknown_component",
      function(data){
        fail("success callback was called for an unknown component");
        done();
      }, function(err){
        done();
      });
  });


  // // instanceStats

  it("should fetch the stats of an instance", function(done){
    giantSwarm.instanceStats(configuration.organizationName,
      configuration.instanceId,
      function(data){
        expect(typeof(data)).toEqual('object');
        expect(typeof(data.ComponentName)).not.toEqual('undefined');
        expect(typeof(data.MemoryUsageMb)).not.toEqual('undefined');
        expect(typeof(data.MemoryCapacityMb)).not.toEqual('undefined');
        expect(typeof(data.MemoryUsagePercent)).not.toEqual('undefined');
        expect(typeof(data.CpuUsagePercent)).not.toEqual('undefined');
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  // // instanceLogs

  it("responds with 10 lines by default", function(done){
    giantSwarm.instanceLogs(configuration.organizationName,
      configuration.instanceId,
      null,
      function(data){
        expect(data.indexOf("Line 10")).toBeGreaterThan(-1);
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  it("works when there are no log lines returned", function(done) {
    giantSwarm.instanceLogs(configuration.organizationName,
      "instanceWithNoLogs",
      null,
      function(data){
        done();
      }, function(err){
        fail(err);
        done();
      });
  })

  it("responds with 2 lines when asked", function(done){
    giantSwarm.instanceLogs(configuration.organizationName,
      configuration.instanceId,
      1,
      function(data){
        expect(data.indexOf("Line 1")).toBeGreaterThan(-1);
        expect(data.indexOf("Line 2")).toBeGreaterThan(-1);
        done();
      }, function(err){
        fail(err);
        done();
      });
  });

  it("calls error callback for unknown instance", function(done){
    giantSwarm.instanceLogs(configuration.organizationName,
      "invalid_instance",
      1,
      function(data){
        fail("success callback was called for unknown instance")
        done();
      }, function(err){
        done();
      });
  });

  // streamLogs

  it("returns a websocket with a sensible url to stream logs, calls the message callback onmessage", function(done){
    giantSwarm.streamLogs(configuration.organizationName,
      [configuration.instanceId],
      function(message){done();},
      function(socket){
        expect(socket.url).toEqual("wss://api.giantswarm.io/v1/org/oponder/stream/logs?p=websocket_token");
        socket.onmessage('test');
      }, function(err){
        fail("error callback was called for known instance " + err)
        done();
      });
  });


  // streamStats

  it("returns a websocket with a sensible url to stream stats, calls the message callback onmessage", function(done){
    giantSwarm.streamStats(configuration.organizationName,
      [configuration.instanceId],
      2,
      function(message){done();},
      function(socket){
        expect(socket.url).toEqual("wss://api.giantswarm.io/v1/org/oponder/stream/stats?p=websocket_token");
        socket.onmessage('test');
      }, function(err){
        fail("error callback was called for known instance")
        done();
      });
  });


  // // logout

  it("logs out a logged in user", function(done){
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.logout(
      function(data){
        done()
      },
      function(err){
        fail("error callback was called for logged in user " + err)
        done();
      });
  });

  it("calls error callback for non logged in user", function(done){
    giantSwarm.setAuthToken("invalid_token");

    giantSwarm.logout(
      function(data){
        fail("success callback was called for invalid token ")
        done()
      },
      function(err){
        done();
      });
  });

  // // isAuthenticated

  it("returns true when user is logged in", function(done){
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.isAuthenticated(
      function(response){
        expect(response).toEqual(true);
        done();
      });
  });

  it("returns false when user is logged out", function(done){
    giantSwarm.setAuthToken("not_logged_in_user");
    giantSwarm.isAuthenticated(
      function(response){
        expect(response).toEqual(false);
        done();
      });
  });

  // Null Dates

  it("converts 0001-01-01T00:00:00Z to null for dates", function(done) {
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.serviceStatus(configuration.organizationName,
      configuration.environmentName,
      "deleting_service",
      function(data){
        expect(data.components[0].instances[0].create_date).toEqual(null);
        done();
      }, function(err){
        fail(err);
        done();
      });
  }),

  // Activity Tracking

  // // setActivity

  it('sets the X-Giant-Swarm-Activity header', function() {
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.setActivity("doing-a-cool-activity")

    var response = giantSwarm.memberships(function(data){}, function(){});

    expect(response.headers["X-Giant-Swarm-Activity"]).toEqual("doing-a-cool-activity")
  });

  it('keeps the X-Giant-Swarm-Activity header for all subsequent requests', function() {
    giantSwarm.setAuthToken("valid_token");
    giantSwarm.setActivity("doing-something-that-takes-multiple-api-calls")

    var response = giantSwarm.memberships(function(data){}, function(){});

    expect(response.headers["X-Giant-Swarm-Activity"]).toEqual("doing-something-that-takes-multiple-api-calls")

    var response_2 = giantSwarm.memberships(function(data){}, function(){});

    expect(response.headers["X-Giant-Swarm-Activity"]).toEqual("doing-something-that-takes-multiple-api-calls")
  });

  it('does not set the X-Giant-Swarm-Activity header when not called', function() {
    giantSwarm.setAuthToken("valid_token");

    var response = giantSwarm.memberships(function(data){}, function(){});

    expect(response.headers["X-Giant-Swarm-Activity"]).toEqual(undefined)
  });


  // Request ID
  //

  it('sets a random request ID for each instantiation of the client', function() {
    giantSwarm.setAuthToken("valid_token");
    var request = giantSwarm.memberships(function(data){}, function(){});
    firstRequestID = request.headers["X-Request-ID"]

    giantSwarm2 = new GiantSwarm();
    giantSwarm2.setAuthToken("valid_token");
    var request = giantSwarm2.memberships(function(data){}, function(){});
    secondRequestID = request.headers["X-Request-ID"]

    expect(firstRequestID).not.toEqual(secondRequestID);
  });

  // Request ID
  //

  it('uses the same request ID for each request made with the same client', function() {
    giantSwarm.setAuthToken("valid_token");
    var request = giantSwarm.memberships(function(data){}, function(){});
    firstRequestID = request.headers["X-Request-ID"]

    var response = giantSwarm.memberships(function(data){}, function(){});
    secondRequestID = request.headers["X-Request-ID"]

    expect(firstRequestID).toEqual(secondRequestID);
  });
});
