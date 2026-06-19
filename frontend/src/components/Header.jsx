import { Link, useLocation } from 'react-router-dom'
import { Scale, History, MessageCircle, FileText } from 'lucide-react'

export default function Header() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '合同分析', icon: FileText },
    { path: '/chat', label: '智能问答', icon: MessageCircle },
    { path: '/history', label: '历史记录', icon: History },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Scale className="w-7 h-7 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">法律文书智能处理平台</span>
        </div>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
