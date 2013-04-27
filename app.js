var viewModel; // global to make debugging easier



$(function () {
  var client = new WindowsAzure.MobileServiceClient('https://eventrecorder.azure-mobile.net/', 'lGXaOUkxcMJPsNApiRLvoxoxgaXDLb16');

  function takePhoto(successCallback, failCallback) {
    navigator.camera.getPicture(successCallback, failCallback, {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      correctOrientation: true
    });
  };

  function getLocation(successCallback, failCallback) {
    navigator.geolocation.getCurrentPosition(successCallback, failCallback,
        { maximumAge: 5000, timeout: 5000, enableHighAccuracy: true });
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

        getLocation(function (location) {
          self.location(ko.toJSON(location));
        }, function () {
          self.location(undefined);
        });
        self.isRecorded(true);
      }, function (error) { alert("Error taking photo: " + error); });

    };
  };

  function ViewModel() {
    var self = this;

    self.evidence = ko.observableArray();

    self.lastEvidenceIsRecorded = ko.computed(function () {
      if (self.evidence().length == 0) {
        return true;
      } else {
        return self.evidence()[self.evidence().length - 1].isRecorded;
      }
    });

    self.addPhoto = function () {
      self.evidence.push(new Photo());
    };

    self.send = function () {
    };
  };

  viewModel = new ViewModel();
  ko.applyBindings(viewModel);
});
