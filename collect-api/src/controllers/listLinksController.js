const mongoose = require('mongoose');
const Link = mongoose.model('Link');

module.exports = {
  async list(req, res) {
    try {
      const linksalvos = await Link.find({});
      res.status(200).send(linksalvos);
      return linksalvos;
    } catch (e) {
      res.status(500).send({ message: 'Erro ao listar links.' });
    }
  }
}