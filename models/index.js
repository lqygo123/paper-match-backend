const mongoose = require('mongoose');

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
  skipFileIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  mode: String,
  result: Object,
  abstract: Object
});

const reportSchema = new mongoose.Schema({
  results: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DuplicateResult' }],
  reportTime: Date,
  /*
    metaInfo: {
      projectName: String,
      biddingID: String,
      biddingCompany: String,
      biddingAgent: String,
      participateCompany: String,
      time: string,
    }
  */
  metaInfo: Object,
})

// 创建模型
const File = mongoose.model('File', fileSchema);
const DuplicateResult = mongoose.model('DuplicateResult', duplicateResultSchema);
const Report = mongoose.model('Report', reportSchema);

module.exports = {
  File,
  DuplicateResult,
  Report
};
