var mongoose = require('mongoose');  
var blobSchema = new mongoose.Schema({  
  name: String,
  query: String,
  badge: Number,
  date: { type: Date, default: Date.now },
  isChecked: Boolean
});
mongoose.model('Blob', blobSchema);