import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import FileUpload from '../components/FileUpload'
import RiskReport from '../components/RiskReport'
import { analyzeFile } from '../api/client'
import { useLanguage } from '../i18n'

export default function Home() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const { t } = useLanguage()

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await analyzeFile(file)
      setResult(data)
    } catch (err) {
      setError(err.message || t('analyzeFailed'))
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
      {!result && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('homeTitle')}</h1>
            <p className="text-gray-500">{t('homeSubtitle')}</p>
          </div>

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
                    {t('analyzing')}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    {t('startAnalyze')}
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
              <p className="text-gray-500">{t('analyzingTip')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('analyzingTime')}</p>
            </div>
          )}
        </>
      )}

      {result && (
        <>
          <RiskReport analysis={result.analysis} filename={result.filename} />
          <div className="flex justify-center">
            <button type="button" onClick={handleReset} className="btn-secondary">
              {t('analyzeNewFile')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
