const fs = require('fs-extra')
const path = require('path')


// const result = {
//   repetitionRate: '0.5',
//   textTotal: 100,
//   imageTotal: 100,

//   repetitions: [
//     {
//       pdf1Page: 1, // pdf1 pageNumber
//       pdf1coord: [], // pdf1 coord
//       pdf1BlockIdx: 1, // pdf1 block index
//       pdf2Page: 1, // pdf2 pageNumber
//       pdf2coord: [], // pdf2 coord
//       pdf2BlockIdx: 1, // pdf1 block index
//       type: 'text', // 'text' 'image',

//       content: '重复内容', // text only from pdf2
//       image: '', // image only from pdf2
//     }
//   ],
// }


/*
`coord_pdf1, coord_pdf2, text_pdf1, text_pdf2, image_pdf1, image_pdf2, text_match, image_match`
- coord_pdf1 和 coord_pdf2是坐标，coord_pdf1[i][j]是第i页的第j个box的坐标，格式是(x1,y1), (x2,y2)，代表box的两个对角点
- text_pdf1和text_pdf2是pdf的文本内容，text_pdf1[i][j]表示第一个Pdf文件的第i页的第j个box内的文本
- image_pdf1和image_pdf2是pdf的图片内容，image_pdf1[i][j]是第一个Pdf文件的第i页的第j个图片，图片是PIL Image格式的
- text_match列表中的每个元素都是 (x,a), (y,b)格式的，表示PDF1的第x页的第a个box和PDF2的y页的第b个box匹配到一起
- image_match列表中的每个元素也是(x,a), (y,b)格式的，含义同上
*/
const transfromDigital = (data) => { 

  if (typeof data === 'string') { 
    data = JSON.parse(data)
  }

  let offset = 2
  const coordPdf1 = data[0 + offset]
  const coordPdf2 = data[1 + offset]
  const textPdf1 = data[2 + offset]
  const textPdf2 = data[3 + offset]
  // const imagePdf1 = data[4]
  const imagePdf2 = data[5 + offset]
  const textMatch = data[6 + offset]
  const imageMatch = data[7 + offset]

  const textRepetitions = textMatch.map((matchItem, index) => {
    const [textPdf1Page, textPdf1BlockIdx] = matchItem[0]
    const [textPdf2Page, textPdf2BlockIdx] = matchItem[1]

    const pdf1coord = coordPdf1[textPdf1Page][textPdf1BlockIdx]
    // const pdf2coord = coordPdf2[textPdf2Page][textPdf2BlockIdx]
    const pdf2text = textPdf2[textPdf2Page][textPdf2BlockIdx]
    const pdf1text = textPdf1[textPdf1Page][textPdf1BlockIdx]

    return {
      id: `${textPdf1Page}-${textPdf1BlockIdx}-${textPdf2Page}-${textPdf2BlockIdx}`,
      index,
      pdf1CoordStr: `${textPdf1Page}-${textPdf1BlockIdx}-${pdf1coord.join(',')}`,
      pdf1Page: textPdf1Page,
      pdf1coord,
      pdf1BlockIdx: textPdf1BlockIdx,
      pdf2Page: textPdf2Page,
      pdf2BlockIdx: textPdf2BlockIdx,
      type: 'text',
      text: pdf2text,
      pdf1text,
    }
  })
    // .filter(item => item.text.length > 20 && item.pdf1text.length > 20);

  const imageRepetitions = imageMatch.map((matchItem, index) => {
    const [imagePdf1Page, imagePdf1BlockIdx] = matchItem[0]
    const [imagePdf2Page, imagePdf2BlockIdx] = matchItem[1]

    const pdf1coord = coordPdf1[imagePdf1Page][imagePdf1BlockIdx]
    const pdf2coord = coordPdf2[imagePdf2Page][imagePdf2BlockIdx]
    const pdf2image = imagePdf2[imagePdf2Page][imagePdf2BlockIdx]

    return {
      id: `${imagePdf1Page}-${imagePdf1BlockIdx}-${imagePdf2Page}-${imagePdf2BlockIdx}`,
      index,
      pdf1Page: imagePdf1Page,
      pdf1coord,
      pdf1BlockIdx: imagePdf1BlockIdx,
      pdf2Page: imagePdf2Page,
      pdf2coord,
      pdf2BlockIdx: imagePdf2BlockIdx,
      type: 'image',
      image: pdf2image,
    }
  });

  // textTotal 计算 text_pdf1 中总共有多少个块

  let pdf1TextTotal = 0
  for (let i = 0; i < textPdf1.length; i++) {
    const page = textPdf1[i]
    pdf1TextTotal += page.length
  }
  

  return {
    repetitionRate: 0.5,
    pdf1TextTotal,
    textRepetitionCount: textRepetitions.length,
    imageRepetitionCount: imageRepetitions.length,
    textRepetitions,
    imageRepetitions
  }
}


/*
返回`ocr1, ocr2, match_result, pdf1, pdf2`
       2   3      4             5     6  

- 其中ocr1[i][0][j]表示第i页的第j个OCR块的坐标，坐标是四个点，从左上角顺时针到左下角
- ocr[i][1][j]表示第i页的第j个OCR块的文字识别内容
- ocr[i][2][j]表示第i页的第j个OCR块的识别置信度，每个置信度都介于0，1之间，越靠近1表示识别越精确
- ocr2和ocr1同理，只不过表示第2个PDF扫描件的扫描结果
- match_result的格式是(x,a),(y,b)，表示pdf1的第x页的a块和pdf2的y页的b块匹配上了
- pdf1是把第一个扫描件的每一页当成一个图片返回，pdf1[i]表示第i页对应的图片
- pdf2同理
*/
const transfromScan = async (data, duplicateResult) => {
  
  // 如果 data 是 buffer ，转换成 string utf8

  if (typeof data === 'string') { 
    data = JSON.parse(data)
  }

  const ocr1 = data[2]
  const ocr2 = data[3]
  const matchResult = data[4]
  const pdf1PageData = data[5]

  console.log('transfromScan', data.length, pdf1PageData.length)

  const ocrRepetitions = matchResult.map((matchItem, index) => {
    const [ocr1Page, ocr1BlockIdx] = matchItem[0]
    const [ocr2Page, ocr2BlockIdx] = matchItem[1]
    const pdf1coord = ocr1[ocr1Page][0][ocr1BlockIdx]
    const pdf2Content = ocr2[ocr2Page][1][ocr2BlockIdx]
    return {
      id: `${ocr1Page}-${ocr1BlockIdx}-${ocr2Page}-${ocr2BlockIdx}`,
      index,
      pdf1Page: ocr1Page,
      pdf1coord,
      pdf1BlockIdx: ocr1BlockIdx,
      pdf2Page: ocr2Page,
      type: 'text',
      text: pdf2Content,
    }
  }); 

  // pdf1Pages.data 为 base64 数据， 对其中每一项， 写入文件到 output_scan_pdf1 文件夹中，命名为 `pdf1-${index}.png`
  const staticDir = path.join(__dirname, `../static/ocr-pdf/${duplicateResult._id}`)
  fs.ensureDirSync(staticDir)

  const pdf1Pages = []

  // await Promise.all(pdf1PageData.map(async (item, index) => {
  //   await fs.writeFile(path.join(staticDir, `${index}.png`), item.data, 'base64')
  //   item.src = `/static/ocr-pdf/${duplicateResult._id}/${index}.png`

  //   pdf1Pages.push({
  //     width: item.width,
  //     height: item.height,
  //     src: `/static/ocr-pdf/${duplicateResult._id}/${index}.png`
  //   })
  // }))


  pdf1PageData.forEach(async (item, index) => {

    console.log('pdf1PageData', index, item.data.length)
    fs.writeFileSync(path.join(staticDir, `${index}.png`), item.data, 'base64')
    item.src = `/static/ocr-pdf/${duplicateResult._id}/${index}.png`

    pdf1Pages.push({
      width: item.width,
      height: item.height,
      src: `/static/ocr-pdf/${duplicateResult._id}/${index}.png`
    })
  })
  

  return {
    repetitionRate: 0.5,
    total: ocrRepetitions.length,
    ocrRepetitions,
    pdf1Pages
  }
}

module.exports = {
  transfromScan,
  transfromDigital,
}

// const scan = require('./input_scan.json')
// const digital = require('./input_digital.json')

// const exec = async () => {
//   const result = await transfromScan(scan, { _id: 'mockID'})
//   console.log(result)
// }

// fs.writeFileSync('./output_scan_transfromed.json', JSON.stringify(transfromScan(scan, { _id: 'mockID'}), null, 2))
// fs.writeFileSync('./output_digital.json', JSON.stringify(transfromDigital(digital), null, 2))