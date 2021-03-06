import * as convert from "./type-conversion.js";

window.jsPDF = window.jspdf.jsPDF;

/* 
글자에 관한 정보 -> 추후 머신러닝의 결과에 따라 수정가능
현재는 파이썬에 만든 것과 최대한 흡사하게 만듦
char: 220, line: 173
가로 여백 : 0.45
세로 여백 : 1.1
*/

function textToPDF(text, fileName, isRandom) {
  convert.ttfToBase64().then((result) => {
    const pdf = new jsPDF("p", "pt", "a4");
    const fontDataURL = result;

    pdf.addFileToVFS("D2CodingBold.ttf", fontDataURL);
    pdf.addFont("D2CodingBold.ttf", "D2CodingBold", "normal");
    pdf.setFont("D2CodingBold");
    pdf.setFontSize(3.8); // hex에 대해서는 3pt로 적용되도록 수정
    pdf.setTextColor("0"); // 검은색

    // 나중에 파일 종류에 따라서 다양하게 수정할 수 있도록 바꾸기
    // 변수 이름도 수정 할 수도?
    const sizeInfo = {};

    sizeInfo.marginTop = convert.cmToPoint(1.8);
    sizeInfo.marginSide = convert.cmToPoint(1);
    sizeInfo.pageW = pdf.internal.pageSize.getWidth();
    sizeInfo.pageH = pdf.internal.pageSize.getHeight();
    sizeInfo.charW = pdf.getTextDimensions("A").w + 0.45;
    sizeInfo.charH = pdf.getTextDimensions("A").h * 1.2;

    let pos = {
      x: sizeInfo.marginSide,
      y: sizeInfo.marginTop,
    };

    let index = {
      page: 1,
      line: 1,
      char: 1,
    };

    for (const c of text) {
      // 새 페이지 추가
      if (pos.y > sizeInfo.pageH - sizeInfo.marginSide) {
        pdf.addPage();
        pos.x = sizeInfo.marginSide;
        pos.y = sizeInfo.marginTop;
        index.page += 1;
        index.line = 1;
      }

      pdf.setTextColor("0.5"); // guide는 회색으로 표시
      addGuideToPage(pdf, pos, index, sizeInfo, fileName);
      pdf.setTextColor("0");
      pdf.text(pos.x, pos.y, c);
      pos.x += sizeInfo.charW;
      index.char += 1;

      // 줄바꿈
      if (pos.x > sizeInfo.pageW - sizeInfo.marginSide) {
        pos.x = sizeInfo.marginSide;
        pos.y += sizeInfo.charH;
        pos.y = convert.roundDcmPlace(pos.y);
        index.line += 1;
        index.char = 1;
      }
    }

    const fileSuffix = "-changed";

    if (isRandom) {
      pdf.save(`${fileName}` + ".pdf");
    } else {
      pdf.save(`${fileName}` + fileSuffix + ".pdf");
    }
  });
}

function addGuideToPage(pdf, pos, index, sizeInfo, fileName) {
  // 인쇄 될 때 가장자리 잘림에 따른 여백 추가
  const indentV = convert.cmToPoint(0.5);
  const indentH = convert.cmToPoint(0.5);
  // 페이지 가이드라인 추가
  if (index.line == 1 && index.char == 1) {
    const pageString = "page " + index.page;
    pdf.text(indentH, sizeInfo.charH + indentV, pageString);
    pdf.text(indentH, sizeInfo.charH * 2 + indentV, fileName);
  }
  // 가로 가이드라인 추가
  if (index.line == 1 && index.char % 10 == 0) {
    const charString = convert.fitNumToGuide(index.char);
    pdf.text(pos.x, sizeInfo.charH + indentV, charString);
    pdf.text(pos.x, sizeInfo.pageH - indentV, charString);
  }
  // 세로 가이드라인 추가
  if (index.char == 1 && index.line % 10 == 0) {
    const lineString = convert.fitNumToGuide(index.line);
    pdf.text(indentH, pos.y, lineString);
    pdf.text(sizeInfo.pageW - sizeInfo.charW - indentH, pos.y, lineString);
  }
}

export { textToPDF };
