var viewModel; // global to make debugging easier

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  $(function () {
    var client = new WindowsAzure.MobileServiceClient('https://eventrecorder.azure-mobile.net/', 'lGXaOUkxcMJPsNApiRLvoxoxgaXDLb16');
    var dataContainerName = 'evidenceData';

    function takePhoto(successCallback, failCallback) {
      navigator.camera.getPicture(successCallback, failCallback, {
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        correctOrientation: true
      });
    };

    function getGeneralLocation(successCallback, failCallback) {
      navigator.geolocation.getCurrentPosition(successCallback, failCallback,
          { maximumAge: 30000, timeout: 5000, enableHighAccuracy: false });
    }

    function getDetailedLocation(successCallback, failCallback) {
      navigator.geolocation.getCurrentPosition(successCallback, failCallback,
          { maximumAge: 5000, timeout: 60000, enableHighAccuracy: true });
    }

    function Photo() {
      var self = this;

      self.evidenceType = "photo";
      self.isRecorded = ko.observable(false);
      self.photoSrc = ko.observable(undefined);

      self.location = ko.observable(undefined);
      self.timeTaken = ko.observable(undefined);

      self.record = function () {
        takePhoto(function (result) {
          self.photoSrc(result);
          self.timeTaken(new Date());

          getGeneralLocation(function (location) {
            self.location(ko.toJSON(location));
          }, function (error) {
            self.location(undefined);
          });

          getDetailedLocation(function (location) {
            self.location(ko.toJSON(location));
          }, function (error) { });
          self.isRecorded(true);
        }, function (error) {
          viewModel.evidence().remove(self);
        });

      };
      
      self.getData = function () {
        return {
          "time" : self.timeTaken,
          "location": ko.toJSON(self.location),
          "photo" : self.photoSrc()
        };
      }
    };

    function ViewModel() {
      var self = this;

      self.evidence = ko.observableArray();

      self.lastEvidenceIsRecorded = ko.computed(function () {
        if (self.evidence().length == 0) {
          return true;
        } else {
          return self.evidence()[self.evidence().length - 1].isRecorded();
        }
      });

      self.addPhoto = function () {
        var photo = new Photo();
        self.evidence.push(photo);
        photo.record();
      };

      self.send = function () {
        var events = client.getTable('events');
        var evidence = client.getTable('evidence');

        events.insert({ }).then(function (newEvent) {
          for (var ii = 0; ii < self.evidence().length; ii++) {
            var evidenceData = self.evidence()[ii].getData();

            evidenceData.eventId = newEvent.id;

            evidence.insert(evidenceData).then(function (newEvidence) {
              alert("Evidence stored");
            });
          }
        });
      };
    };

    viewModel = new ViewModel();
    ko.applyBindings(viewModel);
  });
};
