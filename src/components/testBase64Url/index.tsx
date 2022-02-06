import React, {useState} from 'react';
import {Input} from 'antd';

const TestBase64Url = () => {
  const [url, setUrl] = useState('#');
  return (
    <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <Input.TextArea onBlur={(val) => setUrl(val.target.value)} />
      <div style={{flex: '0 0 50%', marginLeft: '10px'}}>
        <img style={{border: '1px solid #fff'}} src={url} alt="" />
      </div>
    </div>
  )
}
export default TestBase64Url