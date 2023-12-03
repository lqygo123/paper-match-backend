const express = require("express");
const { getNetdiskFile } = require("../common/netdisk");
const axios = require("axios");
const { SGB_BASE_URL } = require('../../config')
const multer = require("multer");
const FormData = require("form-data");
const router = express.Router();
const path = require("path");

const upload = multer();

const uploadFile = async (file) => {
  try {
    // const authInfo = await getNetdiskAuthInfo();
    const url = `${SGB_BASE_URL}/api/v1/swan/sgb-service/ocr/upload`;
    const formData = new FormData();
    formData.append("file", file.buffer, file.originalname);
    formData.append("desc", "test");

    
    const ext = path.extname(file.originalname)

    const headers = {
      "X-Consumer-Custom-Public": "true",
      // authorization: `Bearer ${authInfo.jwt}`,
      ...formData.getHeaders(),
    };
    const response = await axios.post(url, formData, { headers });
    response.data.ext = ext
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const response = await uploadFile(req.file);
    if (!response) {
      res.status(500).json({ code: 1, message: "上传失败" });
      return;
    }
    console.log('upload res', response)
    if (!response.Bsn_ID) { 
      res.status(500).json({ code: 1, message: "上传失败，Bsn_ID 不存在" });
      return
    }
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id: fileId } = req.params;
    const response = await getNetdiskFile(fileId);

    // 从 response.headers 中获取  content-type
    // 作为返回头的 content-type
    res.set('Cache-Control', 'public');
    const contentType = response.headers["content-type"];
    res.set("Content-Type", contentType);
    res.send(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

router.post("/ocr/idcard", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    const response = await uploadFile(file);
    if (!response || !response.Bsn_ID) {
      res.status(500).json({ code: 1, message: "上传失败" });
      return;
    }

    /* 
     OCR 接口获取信息
      POST /api/v1/swan/sgb-service/ocr/idCard
      body
      {
          "bsnId":"fdafda"
      }
    */
    // const authInfo = await getNetdiskAuthInfo();
    const url = `${SGB_BASE_URL}/api/v1/swan/sgb-service/ocr/idCard?bsnId=${response.Bsn_ID}`;
    const params = {
      bsnId: response.Bsn_ID,
    };
    const headers = {
      "X-Consumer-Custom-Public": "true",
      // authorization: `Bearer ${authInfo.jwt}`,
    };
    const ocrResponse = await axios.post(url, params, { headers });
    if (!ocrResponse || !ocrResponse.data) {
      res.status(500).json({ code: 1, message: "OCR 识别失败" });
      return;
    }

    console.log(`${url} bsnId: ${response.Bsn_ID} ocrResponse：`, ocrResponse.data)

    // return res.json(ocrResponse.data);

    if (ocrResponse.data['C-Response-Code'] !== '000000000000') { 
      res.status(500).json({ code: 1, message: "OCR 识别失败" });
      return;
    } else {
      const payload = JSON.parse(ocrResponse.data['C-Response-Body'].Data_Enqr_Rslt)[0].result[0].elements
      res.json({
        code: 0,
        message: "OCR 识别成功",
        data: payload
      })
    }

   
    // 暂时 mock data
    // res.json({
    //   code: 0,
    //   message: "OCR 识别成功",
    //   data: {
    //     name: "阿鲁巴",
    //     address: "地狱南区公爵街 666 号",
    //     gender: "男",
    //     nation: "汉",
    //     bornDate: "2022-01-01",
    //     IDNumber: "4503241995021454845",
    //     issueInstitution: "啊啊啊",
    //     validityPeriod: "xxxxxx产出xxxx",
    //   },
    // });
  } catch (error) {
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

module.exports = router;
