var viewModel; // global to make debugging easier

function onDeviceReady() {
  $(function () {
    var client = new WindowsAzure.MobileServiceClient('https://eventrecorder.azure-mobile.net/', 'lGXaOUkxcMJPsNApiRLvoxoxgaXDLb16');

    function Event(eventData) {
      var self = this;

      self.id = eventData.id;
      self.selected = ko.observable(false);
      self.time = moment(eventData.recordedAt);
    }

    function ViewModel() {
      var self = this;

      self.events = ko.observableArray();
      self.selectedEvent = ko.observable(undefined);

      self.loadEvents = function () {
        var events = client.getTable("events");
        events.orderBy("recordedAt").read().then(function (loadedEvents) {
          for (var ii = 0; ii < loadedEvents.length; ii++) {
            var eventData = loadedEvents[ii];
            self.events.push(new Event(eventData));
          }
        });
      }
    };

    viewModel = new ViewModel();
    viewModel.loadEvents();
    ko.applyBindings(viewModel);
  });
};
