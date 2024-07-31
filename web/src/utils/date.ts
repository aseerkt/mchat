export const isToday = (date: Date) => {
  const now = new Date()

  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

export const isYesterday = (date: Date) => {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}
export const formateChatDate = (date: string | number | Date) => {
  const dateObj =
    typeof date === 'number' || typeof date === 'string' ? new Date(date) : date

  if (isToday(dateObj)) {
    return (
      'Today ' +
      dateObj.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    ) // e.g., "14:23"
  } else if (isYesterday(dateObj)) {
    return (
      'Yesterday ' +
      dateObj.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
  } else {
    return dateObj.toTimeString() // e.g., "June 18, 2023"
  }
}

export const formatGroupDate = (date: string | number | Date) => {
  const dateObj =
    typeof date === 'number' || typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay =
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()

  const isSameYesterday =
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()

  if (isSameDay) {
    // Format time if the date is today
    return `${('0' + dateObj.getHours()).slice(-2)}:${('0' + dateObj.getMinutes()).slice(-2)}`
  } else if (isSameYesterday) {
    // Show "Yesterday" if the date is yesterday
    return 'Yesterday'
  } else if (
    dateObj >= new Date(today.setDate(today.getDate() - today.getDay()))
  ) {
    // Show day of the week for dates within this week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[dateObj.getDay()]
  } else {
    // Show date in MMM DD format for older dates
    const options = { month: 'short', day: 'numeric' } as const
    return dateObj.toLocaleDateString('en-US', options)
  }
}

// Example usage:
