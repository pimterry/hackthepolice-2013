var viewModel; // global to make debugging easier

$(function () {
  var client = new WindowsAzure.MobileServiceClient('https://eventrecorder.azure-mobile.net/', 'lGXaOUkxcMJPsNApiRLvoxoxgaXDLb16');

  function Photo() {
    var self = this;

    self.evidenceType = "photo";
    self.isRecorded = ko.observable(false);
    self.photoSrc = ko.observable(undefined);

    self.record = function () {
      self.isRecorded(true);
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
