import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Cropper from 'react-easy-crop'
import './styles.css'

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

const CropDialog = ({ open, file, style, onSave, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [cropArea, setCropArea] = useState(null)
  const [image, setImage] = useState(undefined)

  useEffect(() => {
    if (open && file) {
      const imageReader = new FileReader()
      imageReader.readAsDataURL(file)
      imageReader.onloadend = () => {
        setImage(imageReader.result)
      }
    }
  }, [open, file])

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCropArea(croppedAreaPixels)
  }

  const handleSave = () => {
    const img = new Image()
    img.src = image

    img.onload = function () {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const { x, y, width, height } = cropArea
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height)
      const croppedImageData = canvas.toDataURL('image/jpeg')
      onSave(croppedImageData)
    }
  }

  return open ? (
    <div className="modal-root">
      <div className="modal-mask"></div>
      <div className="modal-wrap">
        <div className="modal" style={style}>
          <div className="crop-container">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="controls">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(e.target.value)
              }}
              className="zoom-range"
            />
          </div>

          <div className="modal-footer">
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  ) : null
}

const Attachment = ({ label, onUpload }) => {
  const inputRef = useRef(null)

  const [text, setText] = useState(false)

  const handleClick = () => {
    inputRef.current.click()
  }

  const allowedExtensions = ['jpg', 'jpeg', 'png', 'JPG', 'PNG', 'JPEG']

  function checkFileExtension(extension) {
    return allowedExtensions.includes(extension)
  }

  const handleChange = () => {
    const file = inputRef.current.files[0]
    const fileName = inputRef.current.value.split('\\').pop()
    var extension = fileName.split('.').pop()
    console.log(extension)
    if (checkFileExtension(extension)) {
      setText(fileName)
      onUpload(file)
    } else {
      //todo throw new Error maybe with toast!
    }
  }

  return (
    <div>
      <div>
        <p>{label}</p>

        <div className="attachment" onClick={handleClick}>
          <img src={Image} alt="" />
          <p style={{ color: text ? '#fff' : '#c4c4c4' }}>
            {text ? text : 'Add attachment'}
          </p>
        </div>
      </div>
      <input ref={inputRef} type="file" onChange={handleChange} />
    </div>
  )
}

const App = () => {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)

  const handleUpload = (uploadedFile) => {
    setFile(uploadedFile)
    setOpen(true)
  }

  return (
    <div className="App">
      <Attachment label="Upload logo image" onUpload={handleUpload} />
      <CropDialog
        open={open}
        file={file}
        style={{ width: 600, height: 400 }}
        onClose={() => setOpen(false)}
        onSave={(croppedImageData) => {
          console.log('croppedImageData: ', croppedImageData)
          setOpen(false)
          setFile(dataURLtoFile(croppedImageData, file.name))
        }}
      />
    </div>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
