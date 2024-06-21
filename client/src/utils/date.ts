export const formateChatDate = (date: string | number | Date) => {
  const dateObj =
    typeof date === 'number' || typeof date === 'string' ? new Date(date) : date
  const now = new Date()

  const isToday = (date: Date) => {
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    )
  }

  const isYesterday = (date: Date) => {
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    )
  }

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
      'Yesterday' +
      dateObj.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
  } else {
    return dateObj.toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) // e.g., "June 18, 2023"
  }
}
