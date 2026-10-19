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
    date: new Date().toISOString().slice(0, 10)
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
        date: new Date().toISOString().slice(0, 10)
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
            <p className="empty-message">No expenses yet. Add your first one above.</p>
          ) : (
            expenses.map((expense) => (
              <article className="expense-item" key={expense.id}>
                <div>
                  <strong>{expense.description}</strong>
                  <span>{expense.category} · {expense.date}</span>
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
      </section>
    </main>
  )
}

export default App