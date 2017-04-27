const Town = require('mongoose').model('Town');

module.exports = {
  townsGet: (req, res) => {
    Town.find({}).sort({date: 'desc'}).populate('ads').then(towns => {
      res.render('admin/towns', {towns: towns, error: req.session.error});
      delete req.session.error;
    });
  },

  townsPost: (req, res) => {
    let townArgs = req.body;
    let regexTown = /^[A-Z][a-z\s]+$/;
    let errMsg = '';

    Town.findOne({name: townArgs.name}).then(town => {

      if (town || !townArgs.name || !regexTown.test(townArgs.name)) {
        errMsg = 'Town name is invalid or town with that name already exist!';
        req.session.error = errMsg;
        res.redirect('towns');
      } else {
        Town.create(townArgs).then(town => {
          res.redirect('towns');
        });
      }
    });
  },

  townEditGet: (req, res) => {
    let id = req.params.id;

    Town.findOne({_id: id})
      .populate({path: 'ads', populate: {path: 'author category town'}})
      .then(town => {
        let ads = town.ads;
        res.render('admin/town-edit', {town: town, ads: ads, error: req.session.error});
        delete req.session.error;
      });
  },

  townEditPost: (req, res) => {
    let id = req.params.id;
    let name = req.body.name;

    Town.findOne({name: name}).then(town => {
      let regexTown = /^[A-Z][a-z\s]+$/;
      if (town || !regexTown.test(name)) {
        req.session.error = 'Town with that name already exist or town name is invalid!';
        res.redirect(`/admin/town-edit/${id}`);
      } else {
        Town.update({_id: id}, {$set: {name: name}}).then(town => {
          res.redirect('/admin/town-edit/' + id);
        });
      }
    });
  },

  townDeleteGet: (req, res) => {
    let id = req.params.id;

    Town.findOne({_id: id})
      .populate({path: 'ads', populate: {path: 'author category town'}})
      .then(town => {
        let ads = town.ads;
        res.render('admin/town-delete', {town: town, ads: ads});
      });
  },

  townDeletePost: (req, res) => {
    let id = req.params.id;

    Town.findOneAndRemove({_id: id}).then(town => {
      town.deleteTown();
      res.redirect('/admin/towns');
    });
  },
};