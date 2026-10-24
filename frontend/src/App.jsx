import { useEffect, useState } from 'react'
import {
  getExpenses,
  createExpense,
  deleteExpense as deleteExpenseFromApi,
  registerAccount,
  loginAccount,
  getCurrentUser,
  logoutAccount
} from './api'

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Other']

function getLocalDateString() {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

function escapeHtml(value) {
  const characters = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }

  return String(value ?? '').replace(/[&<>"']/g, (character) => characters[character])
}

function App() {
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [expenses, setExpenses] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: getLocalDateString()
  })

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false))
  }, [])

  useEffect(() => {
    if (!user) return

    getExpenses()
      .then(setExpenses)
      .catch(() => setError('Expenses load nahi ho paaye. Backend chalu hai?'))
  }, [user])

  async function submitAuthentication(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    try {
      if (authMode === 'register') {
        await registerAccount(authForm)
        setAuthMode('login')
        setAuthForm({ name: '', email: authForm.email, password: '' })
        setNotice('Account ban gaya. Ab login karo.')
      } else {
        const account = await loginAccount({
          email: authForm.email,
          password: authForm.password
        })
        setUser(account)
        setAuthForm({ name: '', email: '', password: '' })
      }
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function logout() {
    setError('')

    try {
      await logoutAccount()
      setUser(null)
      setExpenses([])
      setAuthMode('login')
      setAuthForm({ name: '', email: '', password: '' })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function addExpense(event) {
    event.preventDefault()
    setError('')

    try {
      const savedExpense = await createExpense({
        ...form,
        amount: Number(form.amount)
      })
      setExpenses((current) => [savedExpense, ...current])
      setForm({
        description: '',
        amount: '',
        category: 'Food',
        date: getLocalDateString()
      })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function deleteExpense(id) {
    setError('')

    try {
      await deleteExpenseFromApi(id)
      setExpenses((current) => current.filter((expense) => expense.id !== id))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const formatMoney = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)

  function downloadExpenseReport() {
    setError('')

    if (expenses.length === 0) {
      setError('Download karne ke liye pehle ek expense add karo.')
      return
    }

    const printWindow = window.open('', '_blank', 'width=900,height=700')

    if (!printWindow) {
      setError('Report kholne ke liye browser mein pop-ups allow karo.')
      return
    }

    const total = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    )

    const expenseRows = expenses
      .map(
        (expense) => `
          <tr>
            <td class="description">${escapeHtml(expense.description)}</td>
            <td>${escapeHtml(expense.category)}</td>
            <td>${escapeHtml(expense.date)}</td>
            <td class="amount">${escapeHtml(formatMoney(expense.amount))}</td>
          </tr>
        `
      )
      .join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Expense Report</title>
          <style>
            @page {
              size: A4;
              margin: 16mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              color: #24332d;
              font-family: Arial, sans-serif;
              background: #ffffff;
            }

            .report {
              max-width: 900px;
              margin: 0 auto;
            }

            .header {
              padding-bottom: 18px;
              border-bottom: 3px solid #397451;
            }

            .brand {
              color: #397451;
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 2px;
              text-transform: uppercase;
            }

            h1 {
              margin: 12px 0 5px;
              color: #24332d;
              font-size: 30px;
            }

            .subtitle {
              margin: 0;
              color: #64736b;
              font-size: 14px;
            }

            .details {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              margin: 22px 0;
              padding: 16px;
              border-radius: 12px;
              background: #edf5ef;
            }

            .detail-label {
              display: block;
              margin-bottom: 5px;
              color: #64736b;
              font-size: 11px;
            }

            .detail-value {
              color: #24332d;
              font-size: 17px;
              font-weight: bold;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              font-size: 12px;
            }

            th {
              padding: 11px 9px;
              color: white;
              background: #397451;
              text-align: left;
            }

            td {
              padding: 10px 9px;
              border-bottom: 1px solid #dce6df;
              vertical-align: top;
              overflow-wrap: anywhere;
            }

            tbody tr:nth-child(even) {
              background: #f5f8f6;
            }

            th:nth-child(1) { width: 42%; }
            th:nth-child(2) { width: 18%; }
            th:nth-child(3) { width: 18%; }
            th:nth-child(4) { width: 22%; }

            .amount {
              text-align: right;
              white-space: nowrap;
            }

            .total {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              padding: 15px 16px;
              border-radius: 10px;
              color: white;
              background: #397451;
              font-size: 17px;
              font-weight: bold;
            }

            .footer {
              margin-top: 24px;
              color: #64736b;
              font-size: 10px;
              text-align: center;
            }

            @media print {
              .report {
                max-width: none;
              }

              tr {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <main class="report">
            <header class="header">
              <div class="brand">Expense Tracker</div>
              <h1>My Expense Report</h1>
              <p class="subtitle">A complete record of your expenses</p>
            </header>

            <section class="details">
              <div>
                <span class="detail-label">Prepared for</span>
                <span class="detail-value">${escapeHtml(user.name)}</span>
              </div>
              <div>
                <span class="detail-label">Number of expenses</span>
                <span class="detail-value">${expenses.length}</span>
              </div>
              <div>
                <span class="detail-label">Report date</span>
                <span class="detail-value">${escapeHtml(
                  new Date().toLocaleDateString('en-IN')
                )}</span>
              </div>
            </section>

            <table>
              <thead>
                <tr>
                  <th>Full description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>${expenseRows}</tbody>
            </table>

            <div class="total">
              <span>Total recorded</span>
              <span>${escapeHtml(formatMoney(total))}</span>
            </div>

            <p class="footer">
              Generated from Expense Tracker
            </p>
          </main>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    window.setTimeout(() => {
      printWindow.print()
    }, 400)
  }

  if (checkingSession) {
    return <main className="app">Checking your session...</main>
  }

  if (!user) {
    return (
      <main className="app">
        <header className="topbar">
          <span className="brand">Expense Tracker</span>
        </header>

        <section className="welcome-card">
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h1>{authMode === 'login' ? 'Welcome back.' : 'Create your account.'}</h1>
          <p>Sign in to manage your expenses.</p>

          {notice && <p role="status">{notice}</p>}
          {error && <p role="alert">{error}</p>}

          <form className="expense-form" onSubmit={submitAuthentication}>
            {authMode === 'register' && (
              <label>
                Name
                <input
                  required
                  maxLength="80"
                  value={authForm.name}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, name: event.target.value })
                  }
                />
              </label>
            )}

            <label>
              Email
              <input
                required
                type="email"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm({ ...authForm, email: event.target.value })
                }
              />
            </label>

            <label>
              Password
              <input
                required
                type="password"
                minLength="8"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
              />
            </label>

            <button type="submit">
              {authMode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p>
            {authMode === 'login' ? 'New here? ' : 'Already registered? '}
            <button
              type="button"
              onClick={() => {
                setError('')
                setNotice('')
                setAuthMode(authMode === 'login' ? 'register' : 'login')
              }}
            >
              {authMode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </section>
      </main>
    )
  }

  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  return (
    <main className="app">
      <header className="topbar">
        <span className="brand">Expense Tracker</span>
        <div className="account-actions">
          <span>{user.name}</span>
          <button className="logout-button" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <section className="welcome-card">
        <p className="eyebrow">PERSONAL FINANCE</p>
        <h1>Track your spending.</h1>
        <p>Add an expense and keep an eye on your monthly total.</p>

        <div className="summary">
          <span>Total recorded</span>
          <strong>{formatMoney(total)}</strong>
          <span>{expenses.length} expenses</span>
        </div>

        {error && <p role="alert">{error}</p>}

        <form className="expense-form" onSubmit={addExpense}>
          <label>
            Description
            <input
              required
              maxLength="120"
              placeholder="e.g. Lunch"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
          <div className="form-row">
            <label>
              Amount (₹)
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
              />
            </label>

            <label>
              Date
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
              />
            </label>
          </div>

          <label>
            Category
            <select
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <button type="submit">Add expense</button>
        </form>

        <section className="expense-list">
          <h2>Recent expenses</h2>

          {expenses.length === 0 ? (
            <p className="empty-message">
              No expenses yet. Add your first one above.
            </p>
          ) : (
            expenses.map((expense) => (
              <article className="expense-item" key={expense.id}>
                <div>
                  <strong>{expense.description}</strong>
                  <span>
                    {expense.category} · {expense.date}
                  </span>
                </div>

                <b>{formatMoney(expense.amount)}</b>

                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteExpense(expense.id)}
                >
                  Delete
                </button>
              </article>
            ))
          )}
        </section>

        <button
          className="download-receipt-button"
          type="button"
          onClick={downloadExpenseReport}
          disabled={expenses.length === 0}
          style={{
            width: '100%',
            minHeight: '58px',
            marginTop: '24px',
            padding: '11px 18px',
            border: '0',
            borderRadius: '14px',
            color: '#ffffff',
            background:
              expenses.length === 0
                ? '#aaa3b7'
                : 'linear-gradient(135deg, #e44d9a 0%, #8757e8 55%, #4f46e5 100%)',
            boxShadow:
              expenses.length === 0
                ? 'none'
                : '0 8px 20px rgba(111, 72, 190, 0.28)',
            fontSize: '16px',
            fontWeight: '700',
            cursor: expenses.length === 0 ? 'not-allowed' : 'pointer',
            opacity: expenses.length === 0 ? 0.65 : 1
          }}
        >
          ✨ Get My Expense Receipt
          <span
            style={{
              display: 'block',
              marginTop: '3px',
              fontSize: '11px',
              fontWeight: '500',
              opacity: 0.9
            }}
          >
            Full descriptions, dates, categories and total
          </span>
        </button>

        <span
          style={{
            display: 'block',
            marginTop: '7px',
            color: '#66736d',
            fontSize: '12px',
            textAlign: 'center'
          }}
        >
          Opens a print window where you can save it as a PDF.
        </span>
      </section>
    </main>
  )
}

export default App