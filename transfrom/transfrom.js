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
const transfromDigital = async (data, duplicateResult) => { 
  if (typeof data === 'string') { 
    data = JSON.parse(data)
  }
  const coordPdf1 = data.pdf1_text_coord
  const coordPdf2 = data.pdf2_text_coord
  const coordImagePdf1 = data.pdf1_image_coord
  const coordImagePdf2 = data.pdf2_image_coord
  const textPdf1 = data.pdf1_text
  const textPdf2 = data.pdf2_text
  const imagePdf1 = data.pdf1_image
  const imagePdf2 = data.pdf2_image
  const textMatch = data.text_match
  const imageMatch = data.image_match

  const textRepetitions = textMatch.map((matchItem, index) => {
    const [textPdf1Page, textPdf1BlockIdx] = matchItem[0]
    const [textPdf2Page, textPdf2BlockIdx] = matchItem[1]

    const pdf1coord = coordPdf1[textPdf1Page][textPdf1BlockIdx]
    const pdf2coord = coordPdf2[textPdf2Page][textPdf2BlockIdx]
    const pdf1text = textPdf1[textPdf1Page][textPdf1BlockIdx]
    const pdf2text = textPdf2[textPdf2Page][textPdf2BlockIdx]

    return {
      id: `text-${textPdf1Page}-${textPdf1BlockIdx}-${textPdf2Page}-${textPdf2BlockIdx}`,
      index,
      pdf1CoordStr: `${textPdf1Page}-${textPdf1BlockIdx}-${pdf1coord.join(',')}`,
      pdf2CoordStr: `${textPdf2Page}-${textPdf2BlockIdx}-${pdf2coord.join(',')}`,
      pdf1Page: textPdf1Page,
      pdf1coord,
      pdf2coord,
      pdf1BlockIdx: textPdf1BlockIdx,
      pdf2Page: textPdf2Page,
      pdf2BlockIdx: textPdf2BlockIdx,
      type: 'text',
      text: pdf2text,
      pdf1text,
    }
  })

  const staticDir = path.join(__dirname, `../static/digital-images/${duplicateResult._id}`)
  const compareDir = path.join(__dirname, '../compare')
  fs.ensureDirSync(staticDir)

  const copyFilePromises = []
  let tempFileBaseDir = ''

  const imageRepetitions = imageMatch.map((matchItem, index) => {
    const [imagePdf1Page, imagePdf1BlockIdx] = matchItem[0]
    const [imagePdf2Page, imagePdf2BlockIdx] = matchItem[1]

    const pdf1coord = coordImagePdf1[imagePdf1Page][imagePdf1BlockIdx]
    const pdf2coord = coordImagePdf2[imagePdf2Page][imagePdf2BlockIdx]

    const pdf2image = imagePdf2[imagePdf2Page][imagePdf2BlockIdx]

    const fileBaseName = path.basename(pdf2image)
    copyFilePromises.push(fs.copy(path.join(compareDir, pdf2image), path.join(staticDir, fileBaseName)))
    if (!tempFileBaseDir) tempFileBaseDir = path.dirname(path.join(compareDir, pdf2image))

    return {
      id: `image-${imagePdf1Page}-${imagePdf1BlockIdx}-${imagePdf2Page}-${imagePdf2BlockIdx}`,
      index,
      pdf1Page: imagePdf1Page,
      pdf1coord,
      pdf1BlockIdx: imagePdf1BlockIdx,
      pdf2Page: imagePdf2Page,
      pdf2coord,
      pdf2BlockIdx: imagePdf2BlockIdx,
      type: 'image',
      imgSrc: `/static/digital-images/${duplicateResult._id}/${fileBaseName}`,
    }
  });
  await Promise.all(copyFilePromises)
  if (fs.existsSync(tempFileBaseDir)) { 
    fs.remove(tempFileBaseDir)
  }

  let pdf1TextTotal = 0
  let pdf1ImageTotal = 0
  let pdf2TextTotal = 0
  let pdf2ImageTotal = 0

  for (let i = 0; i < textPdf1.length; i++) {
    const page = textPdf1[i]
    pdf1TextTotal += page.length
  }

  for (let i = 0; i < imagePdf1.length; i++) {
    const page = imagePdf1[i]
    pdf1ImageTotal += page.length
  }

  for (let i = 0; i < textPdf2.length; i++) {
    const page = textPdf2[i]
    pdf2TextTotal += page.length
  }

  for (let i = 0; i < imagePdf2.length; i++) {
    const page = imagePdf2[i]
    pdf2ImageTotal += page.length
  }

  return {
    pdf1TextTotal,
    pdf1ImageTotal,
    pdf2TextTotal,
    pdf2ImageTotal,
    textRepetitionCount: textRepetitions.length || 0,
    imageRepetitionCount: imageRepetitions.length || 0,
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

  const ocr1 = data.pdf1_ocr_result
  const ocr2 = data.pdf2_ocr_result
  const matchResult = data.text_match
  const pdf1PageData = data.pdf1_image
  const pdf2PageData = data.pdf2_image

  const ocrRepetitions = matchResult.map((matchItem, index) => {
    const [ocr1Page, ocr1BlockIdx] = matchItem[0]
    const [ocr2Page, ocr2BlockIdx] = matchItem[1]
    const pdf1coord = ocr1[ocr1Page][0][ocr1BlockIdx]
    const pdf2coord = ocr2[ocr2Page][0][ocr2BlockIdx]
    const pdf2Content = ocr2[ocr2Page][1][ocr2BlockIdx]
    return {
      id: `text-${ocr1Page}-${ocr1BlockIdx}-${ocr2Page}-${ocr2BlockIdx}`,
      index,
      pdf1Page: ocr1Page,
      pdf1coord,
      pdf1BlockIdx: ocr1BlockIdx,
      pdf2Page: ocr2Page,
      pdf2coord,
      pdf2BlockIdx: ocr2BlockIdx,
      type: 'text',
      text: pdf2Content,
    }
  }); 

  // pdf1Pages.data 为 相对路径， 对其中每一项， 拷贝到 static/ocr-pdf/${duplicateResult._id} 目录下
  const staticDir = path.join(__dirname, `../static/ocr-pdf/${duplicateResult._id}`)
  const compareDir = path.join(__dirname, '../compare')
  fs.ensureDirSync(staticDir)

  const pdf1Pages = []
  const pdf2Pages = []

  const copyFilePromises = []
  let tempFileBaseDir = ''

  pdf1PageData.forEach(async (item) => {
    const fileName = path.basename(item.data)
    copyFilePromises.push(fs.copy(path.join(compareDir, item.data), path.join(staticDir, fileName)))
    pdf1Pages.push({
      width: item.width,
      height: item.height,
      src: `/static/ocr-pdf/${duplicateResult._id}/${fileName}`
    })
  })

  pdf2PageData.forEach(async (item) => {
    const fileName = path.basename(item.data)
    copyFilePromises.push(fs.copy(path.join(compareDir, item.data), path.join(staticDir, fileName)))
    if (!tempFileBaseDir) tempFileBaseDir = path.dirname(path.join(compareDir, item.data))
    pdf2Pages.push({
      width: item.width,
      height: item.height,
      src: `/static/ocr-pdf/${duplicateResult._id}/${fileName}`
    })
  })

  await Promise.all(copyFilePromises)
  if (fs.existsSync(tempFileBaseDir)) { 
    fs.remove(tempFileBaseDir)
  }

  let pdf1TextTotal = 0
  let pdf2TextTotal = 0

  for (let i = 0; i < pdf1PageData.length; i++) {
    const page = ocr1[i][1]
    pdf1TextTotal += page.length
  }

  for (let i = 0; i < pdf2PageData.length; i++) {
    const page = ocr2[i][1]
    pdf2TextTotal += page.length
  }

  return {
    pdf1TextTotal,
    pdf1ImageTotal: 0,
    pdf2TextTotal,
    pdf2ImageTotal: 0,
    textRepetitionCount: ocrRepetitions.length || 0,
    imageRepetitionCount: 0,
    ocrRepetitions,
    pdf1Pages,
    pdf2Pages,
  }
}

module.exports = {
  transfromScan,
  transfromDigital,
}