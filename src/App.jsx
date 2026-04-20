import { useState, useEffect } from 'react'

const standards = {
  naming: {
    label: 'Naming',
    icon: '⬡',
    color: '#7c6dfa',
    rules: [
      {
        title: 'Variables & Functions',
        level: 'must',
        desc: 'Use snake_case for all variables, function names, and module filenames.',
        good: `user_count = 0\ndef fetch_user_data():\n    ...`,
        bad: `userCount = 0\ndef FetchUserData():\n    ...`,
      },
      {
        title: 'Classes',
        level: 'must',
        desc: 'Use PascalCase for all class names.',
        good: `class UserProfile:\n    ...`,
        bad: `class user_profile:\n    ...`,
      },
      {
        title: 'Constants',
        level: 'must',
        desc: 'Use UPPER_SNAKE_CASE for module-level constants.',
        good: `MAX_RETRIES = 3\nBASE_URL = "https://api.example.com"`,
        bad: `maxRetries = 3\nbaseUrl = "https://api.example.com"`,
      },
      {
        title: 'Be Descriptive',
        level: 'should',
        desc: 'Names should communicate intent. Single-letter vars only in comprehensions/lambdas.',
        good: `invoice_total = sum(item.price for item in items)`,
        bad: `t = sum(i.p for i in lst)`,
      },
    ],
  },
  style: {
    label: 'Style',
    icon: '◈',
    color: '#34d399',
    rules: [
      {
        title: 'Formatter: Black',
        level: 'must',
        desc: 'Run black . before every commit. Line length: 88 chars.',
        good: `pip install black\nblack .          # format project\nblack --check .  # CI check`,
      },
      {
        title: 'Linter: Ruff',
        level: 'must',
        desc: 'Use Ruff for fast linting — replaces flake8 + isort.',
        good: `pip install ruff\nruff check .        # lint\nruff check --fix .  # auto-fix`,
      },
      {
        title: 'Type Hints',
        level: 'should',
        desc: 'Add type hints to all public function signatures.',
        good: `def get_user(user_id: int) -> User | None:\n    ...`,
        bad: `def get_user(user_id):\n    ...`,
      },
      {
        title: 'Import Order',
        level: 'must',
        desc: 'stdlib → third-party → local. One blank line between groups.',
        good: `import os\nimport sys\n\nimport requests\nfrom pydantic import BaseModel\n\nfrom myapp.models import User`,
      },
    ],
  },
  docs: {
    label: 'Docs',
    icon: '◎',
    color: '#60a5fa',
    rules: [
      {
        title: 'Google-style Docstrings',
        level: 'must',
        desc: 'All public functions must have docstrings with Args, Returns, Raises.',
        good: `def calculate_discount(price: float, rate: float) -> float:\n    """Apply a percentage discount to a price.\n\n    Args:\n        price: Original item price in dollars.\n        rate: Discount rate as a decimal.\n\n    Returns:\n        Discounted price.\n\n    Raises:\n        ValueError: If rate is not between 0 and 1.\n    """`,
      },
      {
        title: 'Comments: Why, Not What',
        level: 'should',
        desc: 'Comments explain intent the code cannot express itself.',
        good: `# Retry up to 3x — the upstream API\n# is flaky under high load\nfor attempt in range(MAX_RETRIES):`,
        bad: `# loop 3 times\nfor attempt in range(3):`,
      },
      {
        title: 'Module Docstrings',
        level: 'tip',
        desc: 'Every module should have a one-line summary at the top.',
        good: `"""Handles authentication and session management."""\n\nimport os\n...`,
      },
    ],
  },
  structure: {
    label: 'Structure',
    icon: '▦',
    color: '#fbbf24',
    rules: [
      {
        title: 'Project Layout',
        level: 'should',
        desc: 'Follow a consistent layout so any team member can navigate any project.',
        good: `my_project/\n├── src/\n│   └── my_package/\n│       ├── __init__.py\n│       ├── models.py\n│       └── services.py\n├── tests/\n│   ├── conftest.py\n│   └── test_services.py\n├── pyproject.toml\n└── README.md`,
      },
      {
        title: 'One Class Per File',
        level: 'should',
        desc: 'Keep files focused. If a file exceeds ~300 lines, consider splitting.',
      },
      {
        title: 'Tests Mirror Source',
        level: 'must',
        desc: 'Each source file has a corresponding test file.',
        good: `src/my_package/services.py\n  → tests/test_services.py\n\ndef test_get_user_returns_none_when_not_found():\n    ...`,
      },
      {
        title: 'Config via Env Vars',
        level: 'must',
        desc: 'Never hardcode secrets. Use .env files + pydantic-settings.',
      },
    ],
  },
  errors: {
    label: 'Errors',
    icon: '◉',
    color: '#f87171',
    rules: [
      {
        title: 'Catch Specific Exceptions',
        level: 'must',
        desc: 'Never use bare except: or except Exception: without re-raising or logging.',
        good: `try:\n    response = requests.get(url, timeout=5)\n    response.raise_for_status()\nexcept requests.Timeout:\n    logger.warning("Request timed out: %s", url)\n    raise`,
        bad: `try:\n    response = requests.get(url)\nexcept:\n    pass`,
      },
      {
        title: 'Structured Logging',
        level: 'must',
        desc: "Use Python's logging module. No bare print() in production code.",
        good: `import logging\nlogger = logging.getLogger(__name__)\n\nlogger.info("Processing order %s", order_id)`,
      },
      {
        title: 'Custom Exceptions',
        level: 'tip',
        desc: 'Define a base exception for your package, then subclass for specific cases.',
        good: `class AppError(Exception): ...\nclass UserNotFoundError(AppError): ...\nclass InsufficientFundsError(AppError): ...`,
      },
    ],
  },
}

const checklist = [
  { group: 'Code Quality', items: [
    'Black formatter passes (black --check .)',
    'Ruff linter passes with no errors',
    'Type hints added to all new public functions',
    'No hardcoded secrets or API keys',
  ]},
  { group: 'Documentation', items: [
    'All new public functions have Google-style docstrings',
    'New modules have a one-line summary docstring',
    'Comments explain why, not just what',
  ]},
  { group: 'Tests', items: [
    'New logic has corresponding tests in tests/',
    'All tests pass locally (pytest)',
    'No silent exception swallowing introduced',
  ]},
  { group: 'Review Readiness', items: [
    'PR description explains what changed and why',
    'Diff is focused — unrelated changes in separate PR',
  ]},
]

const levelColors = {
  must: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', label: 'must' },
  should: { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', label: 'should' },
  tip: { bg: 'rgba(52,211,153,0.12)', color: '#34d399', label: 'tip' },
}

function CodeBlock({ code, variant }) {
  const borderColor = variant === 'good' ? '#34d399' : '#f87171'
  const labelColor = variant === 'good' ? '#34d399' : '#f87171'
  const labelText = variant === 'good' ? '✓ good' : '✗ avoid'
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: labelColor, marginBottom: 4, fontFamily: 'var(--mono)', fontWeight: 700 }}>{labelText}</div>
      <pre style={{
        background: 'rgba(0,0,0,0.4)',
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: '0 6px 6px 0',
        padding: '10px 12px',
        fontFamily: 'var(--mono)',
        fontSize: 12,
        color: '#d0d0e8',
        whiteSpace: 'pre',
        overflowX: 'auto',
        lineHeight: 1.7,
        margin: 0,
      }}>{code}</pre>
    </div>
  )
}

function RuleCard({ rule }) {
  const lv = levelColors[rule.level]
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '1.25rem',
      marginBottom: 12,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{rule.title}</span>
        <span style={{
          fontSize: 11, padding: '2px 9px', borderRadius: 999,
          background: lv.bg, color: lv.color, fontFamily: 'var(--mono)', fontWeight: 700,
        }}>{lv.label}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: rule.good ? 10 : 0, lineHeight: 1.6 }}>{rule.desc}</p>
      {(rule.good || rule.bad) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {rule.good && <CodeBlock code={rule.good} variant="good" />}
          {rule.bad && <CodeBlock code={rule.bad} variant="bad" />}
        </div>
      )}
    </div>
  )
}

function ChecklistPanel() {
  const [checked, setChecked] = useState({})
  const allItems = checklist.flatMap(g => g.items)
  const doneCount = Object.values(checked).filter(Boolean).length
  const pct = Math.round((doneCount / allItems.length) * 100)

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{doneCount} of {allItems.length} checked</span>
          <span style={{ fontSize: 13, color: 'var(--accent2)', fontFamily: 'var(--mono)', fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 999 }}>
          <div style={{ height: 4, width: `${pct}%`, background: 'var(--accent)', borderRadius: 999, transition: 'width 0.3s' }} />
        </div>
      </div>
      {checklist.map(group => (
        <div key={group.group} style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--mono)' }}>{group.group}</div>
          {group.items.map(item => {
            const key = group.group + item
            const done = !!checked[key]
            return (
              <div key={item} onClick={() => toggle(key)}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 5, border: done ? 'none' : '1px solid var(--border2)',
                  background: done ? 'var(--accent)' : 'transparent',
                  flexShrink: 0, marginTop: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: 'white', transition: 'all 0.15s',
                }}>{done ? '✓' : ''}</div>
                <span style={{ fontSize: 13, color: done ? 'var(--muted)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', transition: 'all 0.2s' }}>{item}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [active, setActive] = useState('naming')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const tabs = [...Object.entries(standards).map(([k, v]) => ({ key: k, label: v.label, icon: v.icon, color: v.color })), { key: 'checklist', label: 'PR Checklist', icon: '☑', color: '#a78bfa' }]

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(10,10,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s',
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🐍</div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>Python Standards</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>v1.0 · small team edition</span>
      </header>

      {/* Hero */}
      <div style={{
        padding: '4rem 2rem 3rem',
        maxWidth: 860,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block', fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 700,
          color: 'var(--accent2)', background: 'rgba(124,109,250,0.12)', padding: '4px 14px',
          borderRadius: 999, marginBottom: '1.2rem', letterSpacing: '0.05em',
        }}>FOR TEAMS OF 2–10 DEVS</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
          Python Coding<br />
          <span style={{ color: 'var(--accent)' }}>Standards</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          A shared rulebook so your team writes code that feels like it was written by one person — consistent, readable, and maintainable.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActive(t.key)} style={{
              padding: '7px 16px', borderRadius: 999, border: active === t.key ? `1px solid ${t.color}` : '1px solid var(--border)',
              background: active === t.key ? `${t.color}18` : 'transparent',
              color: active === t.key ? t.color : 'var(--muted)',
              fontSize: 13, fontFamily: 'var(--sans)', fontWeight: active === t.key ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 12 }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ paddingBottom: '4rem' }}>
          {active === 'checklist' ? (
            <ChecklistPanel />
          ) : (
            standards[active]?.rules.map((rule, i) => <RuleCard key={i} rule={rule} />)
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem 2rem', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          python-coding-standards · habibullahmkc · github pages
        </span>
      </footer>
    </div>
  )
}
