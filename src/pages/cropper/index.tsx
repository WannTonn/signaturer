import React, { useState, useRef, useEffect } from 'react';
import { useObserver } from 'mobx-react';
import { Slider, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Cropper from 'react-cropper';
import getCleanImg, { downloadImg } from './imgUtil';
// import Base64Tester from '@/components/testBase64Url';
import "cropperjs/dist/cropper.css";
import './style.scss';
// const defaultImgUrl = 'https://blogs.wanntonn.fun/images/_header.jpg';
import defaultImgUrl from './static/sign.jpeg';
const CropperComponent = () => {
  const [image, setImage] = useState(defaultImgUrl);
  const [cropData, setCropData] = useState('');
  const [cropper, setCropper] = useState<any>();
  const [fileList, setFileList] = useState<any>([]);
  const [cropping, setCropping] = useState(false);
  useEffect(() => {
    if (cropData) {setCropping(false); message.destroy()};
  }, [cropData])
  /**
   * @description 开始裁剪
   * @param isSignature 是否是制作签名
    */
  const handleCrop = (isSignature: boolean = false) => {
    if (cropper) {
      message.loading('正在制作中，请耐心等候...', 0)
      setCropping(true);
      let croppedImgCanvasData = cropper.getCroppedCanvas();
      getCleanImgData(croppedImgCanvasData, isSignature);

    }
  }
  /**
   * @description 处理图像
   */
  const getCleanImgData = (canvasItem: any, isSignature: boolean = false) => {
    let rawImgBaseData = canvasItem.toDataURL("image/png", 1); // 将canvas 转换成base64
    let clearImgWhiteData;
    let { width, height } = canvasItem;
    let context = canvasItem.getContext('2d');
    let imgData = context.getImageData(0, 0, width, height);

    if (isSignature) {
      // 先转换成黑白图
      getCleanImg(imgData, rawImgBaseData).then((canvasItem) => {
        // 再将白底去除，抠出黑色文字
        clearImgWhiteData = isSignature ? clearImgBackground(canvasItem) : null;
        // 将图片赋值
        setCropData(clearImgWhiteData);
      })
    } else {
      setCropData(rawImgBaseData);
    }
  }
  /**
   * @description 去除白底
    */
  const clearImgBackground = (canvasItem: any,) => {

    //背景颜色  白色
    const rgba = [255, 255, 255, 255];
    // 容差大小
    const tolerance = 60;
    const [r0, g0, b0, a0] = rgba;
    var r, g, b, a;
    let { width, height } = canvasItem;
    let context = canvasItem.getContext('2d');
    let imgData = context.getImageData(0, 0, width, height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      r = imgData.data[i];
      g = imgData.data[i + 1];
      b = imgData.data[i + 2];
      a = imgData.data[i + 3];
      const t = Math.sqrt(
        (r - r0) ** 2 + (g - g0) ** 2 + (b - b0) ** 2 + (a - a0) ** 2
      );
      if (t <= tolerance) {
        imgData.data[i] = 0;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = 0;
        imgData.data[i + 3] = 0;
      }
    }
    context.putImageData(imgData, 0, 0);
    const newBase64 = canvasItem.toDataURL("image/png", 1);
    return newBase64;
  }

  /**
   * @description 将base64 转换成 blob
   * @param urlData
   * @returns blobData
    */
  /* const convertBase64UrlToBlob = (urlData) => {
    var mimeString = urlData.split(",")[0].split(":")[1].split(";")[0]; // mime类型
    var byteString = atob(urlData.split(",")[1]); //base64 解码
    var arrayBuffer = new ArrayBuffer(byteString.length); //创建缓冲数组
    var intArray = new Uint8Array(arrayBuffer); //创建视图
    for (var i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([intArray], { type: mimeString });
  } */
  /**
   * @description 将成品图片下载
   * 
    */
  const handleDownLoad = async () => {
    if (!cropData) {
      message.error('成品区空空如也，请先制作成品');
      return;
    };
    await downloadImg(cropData, '签名.png');
  }
  return useObserver(() => (
    <div className='cropperWrapper'>
      <div className="title">Signaturer</div>
      <Cropper
        style={{ height: 400, width: '100%' }}
        zoomTo={0.5}
        initialAspectRatio={1}
        preview=".img-preview"
        src={image}
        viewMode={1}
        toggleDragModeOnDblclick={false}
        minCropBoxHeight={100}
        minCropBoxWidth={100}
        background={true}
        responsive={true}
        autoCropArea={1}
        checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
        onInitialized={(instance) => {
          setCropper(instance);
        }}
        guides={true}

      />
      <div className='rotateWrapper'>
        <p className="title">拖动滚动条调整角度：</p>
        <Slider style={{ width: '200px', display: 'inline-block' }} max={360} onChange={(deg) => (cropper.rotateTo(deg))}></Slider>
        <Upload
          disabled={cropping}
          accept='image/png,image/jpg,image/jpeg'
          beforeUpload={(file) => {
            setFileList([...fileList, file]);
            const reader = new FileReader();
            reader.onload = () => {
              setImage(reader.result as any);
            }
            reader.readAsDataURL(file)
            return false;
          }}
        >
          <Button disabled={cropping} icon={<UploadOutlined />}>选择签名图</Button>
        </Upload>
        <Button className='opt-btn' disabled={cropping} onClick={() => handleCrop()}>制作普通裁剪</Button>
        <Button className='opt-btn' disabled={cropping} onClick={() => handleCrop(true)}>制作透底签名</Button>
        <Button className='opt-btn' disabled={cropping} onClick={() => handleDownLoad()}>下载成品图</Button>
      </div>
      <div className='operateWrapper'>
        <div className='previewWrapper'>
          <p className='title'>预览区</p>
          <div className='h-300'>
            <div className='img-preview' style={{ width: '40vw', maxWidth: '50vw', height: '300px', overflow: 'hidden' }}></div>
          </div>
        </div>
        <div className='croppedWrapper'>
          <p className='title'>成品区</p>
          <div className='croppedImgBox'>
            <img src={cropData} width="100%" alt="" />
          </div>
        </div>

      </div>

      {/* <Base64Tester /> */}
    </div>
  ))
}

export default CropperComponent;