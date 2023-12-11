const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  name: String,
  enabled: Boolean,
});

// file schema
const fileSchema = new mongoose.Schema({
  fileName: String,
  fileFullPash: String,
  uploadTime: Date,
});

// duplicateResult schema
const duplicateResultSchema = new mongoose.Schema({
  biddingFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  biddingFileName: String,
  targetFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  targetFileName: String,
  skipFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  mode: String,
  detail: { type: mongoose.Schema.Types.ObjectId, ref: 'DuplicateResultDetail' },
  abstract: Object
});

const duplicateResultDetailSchema = new mongoose.Schema({
  detail: Object,
  duplicateResultId: { type: mongoose.Schema.Types.ObjectId, ref: 'DuplicateResult' },
});

const reportSchema = new mongoose.Schema({
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DuplicateResult' }],
  reportTime: Date,
  // metaInfo: {
  //   projectName: String,
  //   biddingID: String,
  //   biddingCompany: String,
  //   biddingAgent: String,
  //   participateCompany: String,
  //   time: string,
  // }
  metaInfo: Object,
})

// 创建模型
const User = mongoose.model('User', userSchema);
const File = mongoose.model('File', fileSchema);
const DuplicateResult = mongoose.model('DuplicateResult', duplicateResultSchema);
const DuplicateResultDetail = mongoose.model('DuplicateResultDetail', duplicateResultDetailSchema);
const Report = mongoose.model('Report', reportSchema);

module.exports = {
  User,
  File,
  DuplicateResult,
  DuplicateResultDetail,
  Report,
};
