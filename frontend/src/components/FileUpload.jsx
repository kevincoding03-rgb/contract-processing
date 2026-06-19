import { useRef, useState } from 'react'
import { Upload, FileText, Image, X } from 'lucide-react'

const ACCEPTED_TYPES = ['.txt', '.pdf', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
const ACCEPTED_MIME = 'text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/gif,image/bmp,image/webp'

export default function FileUpload({ onFileSelect, disabled }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null)

  const isImage = (name) => {
    const ext = '.' + name.split('.').pop().toLowerCase()
    return IMAGE_TYPES.includes(ext)
  }

  const handleFile = (f) => {
    if (!f) return
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    if (!ACCEPTED_TYPES.includes(ext)) {
      alert('仅支持 txt、pdf、docx、jpg、png、gif、bmp、webp 格式文件')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过 10MB')
      return
    }
    setFile(f)
    onFileSelect(f)
    // 图片预览
    if (isImage(f.name)) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    onFileSelect(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">上传合同文件</h2>

      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">拖拽文件到此处，或点击选择文件</p>
          <p className="text-sm text-gray-400">支持 txt、pdf、docx、jpg、png、gif、bmp、webp 格式，最大 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_MIME}
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {isImage(file.name) ? (
                <Image className="w-6 h-6 text-primary-600" />
              ) : (
                <FileText className="w-6 h-6 text-primary-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="text-gray-400 hover:text-red-500 transition-colors"
              disabled={disabled}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {preview && (
            <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
              <img src={preview} alt="预览" className="max-h-64 mx-auto object-contain" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
