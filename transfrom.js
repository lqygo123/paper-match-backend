const fs = require('fs')
const data = require('./input_scan.json') 

const result = {
  repetitionRate: '0.5',
  textTotal: 100,
  imageTotal: 100,

  repetitions: [
    {
      pdf1Page: 1, // pdf1 pageNumber
      pdf1coord: [], // pdf1 coord
      pdf1BlockIdx: 1, // pdf1 block index
      pdf2Page: 1, // pdf2 pageNumber
      pdf2coord: [], // pdf2 coord
      pdf2BlockIdx: 1, // pdf1 block index
      type: 'text', // 'text' 'image',

      content: '重复内容', // text only from pdf2
      image: '', // image only from pdf2
    }
  ],
}


/*
`coord_pdf1, coord_pdf2, text_pdf1, text_pdf2, image_pdf1, image_pdf2, text_match, image_match`
- coord_pdf1 和 coord_pdf2是坐标，coord_pdf1[i][j]是第i页的第j个box的坐标，格式是(x1,y1), (x2,y2)，代表box的两个对角点
- text_pdf1和text_pdf2是pdf的文本内容，text_pdf1[i][j]表示第一个Pdf文件的第i页的第j个box内的文本
- image_pdf1和image_pdf2是pdf的图片内容，image_pdf1[i][j]是第一个Pdf文件的第i页的第j个图片，图片是PIL Image格式的
- text_match列表中的每个元素都是 (x,a), (y,b)格式的，表示PDF1的第x页的第a个box和PDF2的y页的第b个box匹配到一起
- image_match列表中的每个元素也是(x,a), (y,b)格式的，含义同上
*/
const transfromDigital = (data) => { 
  const coordPdf1 = data[0]
  const coordPdf2 = data[1]
  // const textPdf1 = data[2]
  const textPdf2 = data[3]
  // const imagePdf1 = data[4]
  const imagePdf2 = data[5]
  const textMatch = data[6]
  const imageMatch = data[7]

  const textRepetitions = textMatch.map(matchItem => {
    const [textPdf1Page, textPdf1BlockIdx] = matchItem[0]
    const [textPdf2Page, textPdf2BlockIdx] = matchItem[1]

    const pdf1coord = coordPdf1[textPdf1Page][textPdf1BlockIdx]
    const pdf2coord = coordPdf2[textPdf2Page][textPdf2BlockIdx]
    const pdf2text = textPdf2[textPdf2Page][textPdf2BlockIdx]

    return {
      id: `${textPdf1Page}-${textPdf1BlockIdx}-${textPdf2Page}-${textPdf2BlockIdx}`,
      pdf1Page: textPdf1Page,
      pdf1coord,
      pdf1BlockIdx: textPdf1BlockIdx,
      pdf2Page: textPdf2Page,
      pdf2coord,
      pdf2BlockIdx: textPdf2BlockIdx,
      type: 'text',
      text: pdf2text,
    }
  });

  const imageRepetitions = imageMatch.map(matchItem => {
    const [imagePdf1Page, imagePdf1BlockIdx] = matchItem[0]
    const [imagePdf2Page, imagePdf2BlockIdx] = matchItem[1]

    const pdf1coord = coordPdf1[imagePdf1Page][imagePdf1BlockIdx]
    const pdf2coord = coordPdf2[imagePdf2Page][imagePdf2BlockIdx]
    const pdf2image = imagePdf2[imagePdf2Page][imagePdf2BlockIdx]

    return {
      id: `${imagePdf1Page}-${imagePdf1BlockIdx}-${imagePdf2Page}-${imagePdf2BlockIdx}`,
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
  

  return {
    repetitionRate: 0.5,
    textTotal: textRepetitions.length,
    imageTotal: imageRepetitions.length,
    textRepetitions,
    imageRepetitions
  }
}


/*
返回`ocr1, ocr2, match_result, pdf1, pdf2`

- 其中ocr1[i][0][j]表示第i页的第j个OCR块的坐标，坐标是四个点，从左上角顺时针到左下角
- ocr[i][1][j]表示第i页的第j个OCR块的文字识别内容
- ocr[i][2][j]表示第i页的第j个OCR块的识别置信度，每个置信度都介于0，1之间，越靠近1表示识别越精确
- ocr2和ocr1同理，只不过表示第2个PDF扫描件的扫描结果
- match_result的格式是(x,a),(y,b)，表示pdf1的第x页的a块和pdf2的y页的b块匹配上了
- pdf1是把第一个扫描件的每一页当成一个图片返回，pdf1[i]表示第i页对应的图片
- pdf2同理
*/
const transfromScan = (data) => {
  const ocr1 = data[0]
  const ocr2 = data[1]
  const matchResult = data[2]
  // const pdf2 = data[4]

  const ocrRepetitions = matchResult.map(matchItem => {
    const [ocr1Page, ocr1BlockIdx] = matchItem[0]
    const [ocr2Page, ocr2BlockIdx] = matchItem[1]

    // const pdf1image = pdf1[ocr1Page]
    // const pdf2image = pdf2[ocr2Page]

    const pdf1coord = ocr1[ocr1Page][0][ocr1BlockIdx]
    const pdf2coord = ocr2[ocr2Page][0][ocr2BlockIdx]

    return {
      id: `${ocr1Page}-${ocr1BlockIdx}-${ocr2Page}-${ocr2BlockIdx}`,
      pdf1Page: ocr1Page,
      pdf1coord,
      pdf1BlockIdx: ocr1BlockIdx,
      pdf2Page: ocr2Page,
      pdf2coord,
      pdf2BlockIdx: ocr2BlockIdx,
      type: 'image',
      // image: pdf2[ocr2Page][1][ocr2BlockIdx],
    }
  }); 

  return {
    repetitionRate: 0.5,
    total: ocrRepetitions.length,
    ocrRepetitions,
  }
}

const res = transfromScan(data)

fs.writeFileSync('./output_scan.json', JSON.stringify(res, null, 2))