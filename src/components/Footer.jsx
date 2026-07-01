import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search Notes' },
  { to: '/questions', label: 'Question Bank' },
]

const legalLinks = [
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/privacy', label: 'Privacy Policy' },
]

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ml', label: 'മലയാളം (Malayalam)' },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: '#',
    path: (
      <path d="M12 2c-2.72 0-3.06.01-4.12.06-1.06.05-1.79.22-2.43.47a4.9 4.9 0 0 0-1.77 1.15A4.9 4.9 0 0 0 2.53 5.45c-.25.64-.42 1.37-.47 2.43C2.01 8.94 2 9.28 2 12s.01 3.06.06 4.12c.05 1.06.22 1.79.47 2.43.26.66.6 1.22 1.15 1.77.55.55 1.11.9 1.77 1.15.64.25 1.37.42 2.43.47C8.94 21.99 9.28 22 12 22s3.06-.01 4.12-.06c1.06-.05 1.79-.22 2.43-.47a4.9 4.9 0 0 0 1.77-1.15 4.9 4.9 0 0 0 1.15-1.77c.25-.64.42-1.37.47-2.43.05-1.06.06-1.4.06-4.12s-.01-3.06-.06-4.12c-.05-1.06-.22-1.79-.47-2.43a4.9 4.9 0 0 0-1.15-1.77A4.9 4.9 0 0 0 18.55.53c-.64-.25-1.37-.42-2.43-.47C15.06.01 14.72 0 12 0Zm0 4.87A5.13 5.13 0 1 1 6.87 10 5.13 5.13 0 0 1 12 4.87Zm0 8.46A3.33 3.33 0 1 0 8.67 10 3.33 3.33 0 0 0 12 13.33Zm5.34-8.66a1.2 1.2 0 1 1-1.2-1.2 1.2 1.2 0 0 1 1.2 1.2Z" />
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    path: <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.7A20 20 0 0 0 14.6 3.5c-2.3 0-3.9 1.4-3.9 4v2.4H8v3.1h2.7V21Z" />,
  },
  {
    label: 'YouTube',
    href: '#',
    path: (
      <path d="M23.5 6.6a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.5A3 3 0 0 0 .5 6.6 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.4 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.4ZM9.6 15.5v-7l6.3 3.5Z" />
    ),
  },
  {
    label: 'Telegram',
    href: 'https://t.me/kuhsnotebot',
    path: (
      <path d="m21.9 3.7-3.1 15.6c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9L18 6.1c.5-.4-.1-.6-.7-.2L6.2 13.1l-4.8-1.5c-1-.3-1-1 .2-1.5l19-7.3c.9-.3 1.6.2 1.3 1.9Z" />
    ),
  },
]

export default function Footer() {
  const [language, setLanguage] = useState('en')

  function handleLanguageChange(event) {
    const value = event.target.value

    if (value !== 'en') {
      toast('More languages are coming soon!')
      return
    }

    setLanguage(value)
  }

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10 text-slate-600 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="text-base font-bold text-brand-blue">KUHS MLT Notes</span>
          <p className="mt-3 text-sm leading-6">
            A free notes portal for KUHS BSc MLT students — searchable by subject, paper, and year.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Quick Links</h3>
          <ul className="mt-3 space-y-2">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm font-medium hover:text-brand-blue">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Legal</h3>
          <ul className="mt-3 space-y-2">
            {legalLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm font-medium hover:text-brand-blue">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Connect</h3>
          <div className="mt-3 flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-brand-light hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  {social.path}
                </svg>
              </a>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Language</span>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              {languages.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-slate-100 pt-6 text-center text-xs font-medium text-slate-500">
        © {new Date().getFullYear()} KUHS BSc MLT Notes Portal · For educational use only
      </div>
    </footer>
  )
}
