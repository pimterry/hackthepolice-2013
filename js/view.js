var viewModel; // global to make debugging easier

function onDeviceReady() {
  $(function () {
    var client = new WindowsAzure.MobileServiceClient('https://eventrecorder.azure-mobile.net/', 'lGXaOUkxcMJPsNApiRLvoxoxgaXDLb16');

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
            for (var ii = 0; ii < loadedEvidence; ii++) {
              self.evidence.push(loadedEvidence);
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
        events.orderBy("recordedAt").read().then(function (loadedEvents) {
          for (var ii = 0; ii < loadedEvents.length; ii++) {
            var eventData = loadedEvents[ii];
            self.events.push(new Event(self, eventData));
          }
        });
      }
    };

    viewModel = new ViewModel();
    viewModel.loadEvents();
    ko.applyBindings(viewModel);
  });
};