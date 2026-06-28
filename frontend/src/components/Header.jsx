import { Link, useLocation } from 'react-router-dom'
import { Scale, History, MessageCircle, FileText, Languages } from 'lucide-react'
import { useLanguage } from '../i18n'

export default function Header() {
  const location = useLocation()
  const { t, lang, switchLang } = useLanguage()

  const navItems = [
    { path: '/', label: t('navAnalyze'), icon: FileText },
    { path: '/chat', label: t('navChat'), icon: MessageCircle },
    { path: '/history', label: t('navHistory'), icon: History },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Scale className="w-7 h-7 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">{t('appTitle')}</span>
        </div>
        <div className="flex items-center gap-2">
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
          <button
            type="button"
            onClick={() => switchLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors ml-1"
            title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <Languages className="w-4 h-4" />
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </div>
    </header>
  )
}
