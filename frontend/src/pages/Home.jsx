import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import RiskReport from '../components/RiskReport'
import { analyzeFile } from '../api/client'

export default function Home() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await analyzeFile(file)
      setResult(data)
    } catch (err) {
      setError(err.message || '分析失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* 标题区 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">合同法律风险分析</h1>
        <p className="text-gray-500">上传合同文件，AI 智能识别法律风险并生成专业报告</p>
      </div>

      {/* 上传区 */}
      {!result && (
        <>
          <FileUpload onFileSelect={setFile} disabled={loading} />

          {file && (
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    开始分析
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-500">正在分析合同内容，请稍候...</p>
              <p className="text-sm text-gray-400 mt-1">AI 模型处理可能需要 2-5 分钟</p>
            </div>
          )}
        </>
      )}

      {/* 结果区 */}
      {result && (
        <>
          <RiskReport analysis={result.analysis} filename={result.filename} />
          <div className="flex justify-center">
            <button type="button" onClick={handleReset} className="btn-secondary">
              分析新文件
            </button>
          </div>
        </>
      )}
    </div>
  )
}
