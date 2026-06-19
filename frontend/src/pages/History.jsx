import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import HistoryList from '../components/HistoryList'
import RiskReport from '../components/RiskReport'
import { getHistory } from '../api/client'

export default function History() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHistory('anonymous')
      setRecords(data.records || [])
    } catch (err) {
      setError(err.message || '获取历史记录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRecord = (record) => {
    setSelectedRecord(record)
  }

  const handleBack = () => {
    setSelectedRecord(null)
  }

  if (selectedRecord) {
    return (
      <div className="space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">返回列表</span>
        </button>
        <RiskReport
          analysis={selectedRecord.result}
          filename={selectedRecord.filename}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">分析历史</h1>
        <Link to="/" className="btn-secondary text-sm">
          新建分析
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : (
        <HistoryList records={records} onSelect={handleSelectRecord} />
      )}
    </div>
  )
}
