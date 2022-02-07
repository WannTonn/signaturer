
function getCanvas({ width, height }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/* async function loadImage(path) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = path;
    image.onload = function () {
      resolve(image);
    };
  });
} */

function getCoordinate(imageData, x, y) {
  return (x + y * imageData.width) * 4;
}

// 转换为灰度图并计算均值
function Rgb2GrayAndGetAverage(imageData) {
  let avg = 0;
  let avgCount = 0;
  for (let left = 0; left < imageData.width; left++) {
    for (let top = 0; top < imageData.height; top++) {
      const coordinate = getCoordinate(imageData, left, top);
      const gray =
        0.299 * imageData.data[coordinate] +
        0.587 * imageData.data[coordinate + 1] +
        0.114 * imageData.data[coordinate + 2];

      // 赋值给 RGB，将彩图转换成灰度图
      imageData.data[coordinate] = gray;
      imageData.data[coordinate + 1] = gray;
      imageData.data[coordinate + 2] = gray;

      // 计算平均值时不包含透明的点
      if (imageData.data[coordinate + 3] !== 0) {
        avg = (avg * avgCount + gray) / (avgCount + 1);
        avgCount++;
      }
    }
  }
  return {
    avg,
  };
}

// 根据阈值获取转换函数
function getColorTransformMatrix({ thresholdWhite, thresholdBlack }) {
  const transformMatrix = Array.from({ length: 256 }); // 色值转换函数
  for (let i = 0; i < 256; i++) {
    if (i > thresholdWhite) {
      transformMatrix[i] = 255; // 白色
    } else if (i < thresholdBlack) {
      transformMatrix[i] = 0; // 黑色
    } else {
      transformMatrix[i] = i; // 保持不变
    }
  }
  return transformMatrix;
}

// 根据色阶转换函数转换图像
function transformColorByMatrix(imageData, transformMatrix) {
  for (let left = 0; left < imageData.width; left++) {
    for (let top = 0; top < imageData.height; top++) {
      const coordinate = getCoordinate(imageData, left, top);
      const gray = transformMatrix[imageData.data[coordinate]];
      imageData.data[coordinate] = gray;
      imageData.data[coordinate + 1] = gray;
      imageData.data[coordinate + 2] = gray;
      // imageData.data[coordinate + 3] = alpha;
    }
  }
}

async function transformSignatureImage(img, rawImgBaseData) {
  // const img = await loadImage(imagePath);
  const canvas = getCanvas({
    width: img.width,
    height: img.height,
  });
  const ctx = canvas.getContext("2d");
  // const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const imageData = img;
  let image = new Image(img.width, img.height);
  image.onLoad = () => {
    ctx.drawImage(rawImgBaseData, 0, 0);
  }
  image.src = imageData;

  // 转换为灰度图并计算均值
  const { avg } = Rgb2GrayAndGetAverage(imageData);
  // console.log(imageData);

  // 计算阈值
  // 这个应该可以由用户自定义
  const thresholdWhite = avg - 40; // 灰度大于该阈值会变成白色（255，255，255）
  const thresholdBlack = avg - 80; // 灰度低于该阈值会变成纯黑色（0，0，0）

  // 根据阈值获取色阶转换函数
  const transformMatrix = getColorTransformMatrix({
    thresholdWhite,
    thresholdBlack,
  });

  // 根据色阶转换函数转换图像
  transformColorByMatrix(imageData, transformMatrix);

  ctx.putImageData(imageData, 0, 0);
  // const dataURL = canvas.toDataURL("image/png", 1);
  return canvas;
}
/**
 * @description 下载图片
 * @param url 下载地址
 * @param fileName 文件名
 * 
  */
export async function downloadImg(url, fileName) {
  const res = await fetch(url);
  const blob = await res.blob();
  let a = document.createElement('a');
  let url_1 = window.URL.createObjectURL(blob);
  a.href = url_1;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url_1);
}
export default function getCleanImg(img, rawImgBaseData) {
  return transformSignatureImage(img, rawImgBaseData);
}