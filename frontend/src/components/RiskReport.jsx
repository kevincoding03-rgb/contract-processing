import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react'

const RISK_STYLES = {
  高: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  中: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
  },
  低: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: Info,
    iconColor: 'text-blue-500',
  },
  未知: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
    icon: Info,
    iconColor: 'text-gray-500',
  },
}

function RiskBadge({ level }) {
  const style = RISK_STYLES[level] || RISK_STYLES['未知']
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}>
      {level}风险
    </span>
  )
}

export default function RiskReport({ analysis, filename }) {
  if (!analysis) return null

  const { risk_level, risk_points = [], summary, raw_response } = analysis
  const overallStyle = RISK_STYLES[risk_level] || RISK_STYLES['未知']
  const OverallIcon = overallStyle.icon

  return (
    <div className="space-y-6">
      {/* 总览卡片 */}
      <div className={`card ${overallStyle.bg} ${overallStyle.border} border`}>
        <div className="flex items-center gap-3 mb-2">
          <OverallIcon className={`w-6 h-6 ${overallStyle.iconColor}`} />
          <h2 className="text-lg font-semibold text-gray-900">
            合同风险分析报告
          </h2>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-gray-600">文件：{filename}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">整体风险等级：</span>
          <RiskBadge level={risk_level} />
        </div>
      </div>

      {/* 风险点列表 */}
      {risk_points.length > 0 && (
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            风险点详情（共 {risk_points.length} 项）
          </h3>
          <div className="space-y-4">
            {risk_points.map((point, index) => {
              const style = RISK_STYLES[point.risk_level] || RISK_STYLES['未知']
              const Icon = style.icon
              return (
                <div key={index} className={`rounded-lg border p-4 ${style.bg} ${style.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${style.iconColor}`} />
                      <span className="font-medium text-gray-900">
                        风险点 {index + 1}
                      </span>
                    </div>
                    <RiskBadge level={point.risk_level} />
                  </div>
                  {point.location && (
                    <p className="text-sm text-gray-500 mb-1">
                      位置：{point.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 mb-2">{point.description}</p>
                  {point.suggestion && (
                    <div className="flex items-start gap-2 bg-white/60 rounded p-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600">{point.suggestion}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 总结 */}
      {summary && (
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">总结与建议</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</p>
        </div>
      )}

      {/* 原始响应（当无法解析JSON时显示） */}
      {raw_response && !risk_points.length && (
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">AI 原始分析</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{raw_response}</p>
        </div>
      )}
    </div>
  )
}
