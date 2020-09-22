const mongoose = require('mongoose');
const Link = mongoose.model('Link');

module.exports = {
  async insert (req, res){
    const links = await Link.create(req.body);
    return res.json(links);
  }
}
