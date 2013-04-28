var viewModel; // global to make debugging easier

function onDeviceReady() {
  $(function () {
    var client = new WindowsAzure.MobileServiceClient('https://eventrecorder.azure-mobile.net/', 'lGXaOUkxcMJPsNApiRLvoxoxgaXDLb16');
    var mapsKey = 'AIzaSyAApAkr0eQRXR6quhknBqsJJySlJreB2hc';

    function loadEvidenceForEvent(eventId, callback) {
      evidence = client.getTable('evidence');
      evidence.where({eventId: eventId}).read().then(function(loadedEvidence) {
        callback(loadedEvidence);
      });
    }

    function Event(viewModel, eventData) {
      var self = this;

      self.id = eventData.id;
      self.selected = ko.observable(false);
      self.loading = ko.observable(false);
      self.time = moment(eventData.recordedAt);
      self.evidence = ko.observableArray();

      self.toggleOpen = function () {
        if (self.selected() === true) {
          self.close();
        } else {
          self.open();
        }
      };

      self.open = function () {
        if (self.evidence().length == 0 && !self.loading()) {
          self.loading(true);

          loadEvidenceForEvent(self.id, function(loadedEvidence) {
            for (var ii = 0; ii < loadedEvidence.length; ii++) {
              self.evidence.push(loadedEvidence[ii]);
            }
            self.loading(false);
          });
        }

        self.selected(true);
        viewModel.selectedEvent(this);
      };

      self.close = function () {
        self.selected(false);
        viewModel.selectedEvent(undefined);
      }
    }

    function ViewModel() {
      var self = this;
      
      self.user = ko.observable(client.currentUser);
      self.loggedIn = ko.computed(function () {
        return (typeof self.user() != 'undefined' && 
                self.user() != null); 
      });
      self.login = function () {
        client.login("google").then(function () {
          self.user(client.currentUser);
          self.loadEvents();
        });
      };
      self.logout = function () {
        client.logout();
        self.user(undefined);
        self.events([]);
      };

      function eventIsSelected() {
        return typeof self.selectedEvent() != 'undefined';
      };

      self.events = ko.observableArray();
      self.selectedEvent = ko.observable(undefined);

      self.visibleEvents = ko.computed(function () {
        if (!eventIsSelected()) {
          return self.events();
        } else {
          return [self.selectedEvent];
        }
      });

      self.loadEvents = function () {
        var events = client.getTable("events");
        events.orderByDescending("recordedAt").read().then(function (loadedEvents) {
          for (var ii = 0; ii < loadedEvents.length; ii++) {
            var eventData = loadedEvents[ii];
            self.events.push(new Event(self, eventData));
          }
        });
      }
    };

    viewModel = new ViewModel();
    viewModel.login();
    ko.applyBindings(viewModel);
  });
};
