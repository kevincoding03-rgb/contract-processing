import { FileText, Clock, ChevronRight } from 'lucide-react'
import { useLanguage } from '../i18n'

const RISK_BADGE = {
  高: 'bg-red-100 text-red-700',
  中: 'bg-amber-100 text-amber-700',
  低: 'bg-blue-100 text-blue-700',
  未知: 'bg-gray-100 text-gray-700',
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-blue-100 text-blue-700',
}

const RISK_LABEL_ZH = { 高: '高风险', 中: '中风险', 低: '低风险', 未知: '未知风险' }
const RISK_LABEL_EN = { 高: 'High', 中: 'Medium', 低: 'Low', 未知: 'Unknown', High: 'High', Medium: 'Medium', Low: 'Low' }

export default function HistoryList({ records, onSelect }) {
  const { t, lang } = useLanguage()

  if (!records || records.length === 0) {
    return (
      <div className="card text-center py-12">
        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{t('noRecords')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const riskLevel = record.result?.risk_level || '未知'
        const badgeClass = RISK_BADGE[riskLevel] || RISK_BADGE['未知']
        const riskLabel = lang === 'en' ? (RISK_LABEL_EN[riskLevel] || riskLevel) : (RISK_LABEL_ZH[riskLevel] || riskLevel + '风险')
        const riskPoints = record.result?.risk_points?.length || 0
        const createdAt = new Date(record.created_at).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')

        return (
          <div
            key={record.id}
            className="card flex items-center justify-between cursor-pointer hover:border-primary-300 transition-colors"
            onClick={() => onSelect(record)}
          >
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-primary-500" />
              <div>
                <p className="font-medium text-gray-900">{record.filename}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                    {riskLabel}
                  </span>
                  <span className="text-xs text-gray-400">{t('riskPoints', { count: riskPoints })}</span>
                  <span className="text-xs text-gray-400">{createdAt}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        )
      })}
    </div>
  )
}
