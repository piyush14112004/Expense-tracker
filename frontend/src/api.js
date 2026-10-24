const API_BASE_URL = 'https://expense-tracker-szql.onrender.com/api'

async function sendRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  })

  if (!response.ok) {
    const responseText = await response.text()
    let message = responseText || `Request failed (${response.status})`

    try {
      const errorData = JSON.parse(responseText)
      message = errorData.error || errorData.message || message
    } catch {
      // JSON response na ho toh original message use hoga.
    }

    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function registerAccount(account) {
  return sendRequest(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(account)
  })
}

export async function loginAccount(account) {
  try {
    return await sendRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(account)
    })
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      throw new Error('Email or password is incorrect.')
    }
    throw error
  }
}

export function logoutAccount() {
  return sendRequest(`${API_BASE_URL}/auth/logout`, {
    method: 'POST'
  })
}

export function getCurrentUser() {
  return sendRequest(`${API_BASE_URL}/auth/me`)
}

export function getExpenses() {
  return sendRequest(`${API_BASE_URL}/expenses`)
}

export function createExpense(expense) {
  return sendRequest(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    body: JSON.stringify(expense)
  })
}

export function deleteExpense(id) {
  return sendRequest(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE'
  })
}