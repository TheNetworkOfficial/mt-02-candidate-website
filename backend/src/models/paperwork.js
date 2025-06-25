const { Schema, model } = require('mongoose');

const FileSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

const PaperworkSchema = new Schema({
  reptileId: { type: Number, required: true },
  userId: { type: Number, required: true },
  files: [FileSchema],
  signedOn: { type: Date, default: Date.now }
});

module.exports = model('Paperwork', PaperworkSchema, 'paperwork');
