const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

function initializeTown(townName) {
  let townData = {name: townName};
  Town.findOne(townData).then(town => {
    if (!town) {
      Town.create(townData);
    }
  });
}

let townSchema = mongoose.Schema(
  {
    name: {type: String, required: true, unique: true},
    ads: [{type: ObjectId, ref: 'Ad'}]
  }
);

townSchema.method({
  deleteTown: function () {
    let Ad = mongoose.model('Ad');
    for (let ad of this.ads){
      Ad.findById(ad).then(ad => {
        ad.deleteAd();
        ad.remove();
      });
    }
  }
});

townSchema.set('versionKey', false);

let Town = mongoose.model('Town', townSchema);

module.exports = Town;

module.exports.initialize = () => {
  initializeTown('Plovdiv');
  initializeTown('Varna');
  initializeTown('Burgas');
  initializeTown('Sliven');
  initializeTown('Stara Zagora');
  initializeTown('Sofia');
  initializeTown('Pernik');
  initializeTown('Pleven');
};