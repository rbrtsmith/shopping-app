export const formatDateFromTimestamp = id => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const plurals = {
    1: 'st',
    2: 'nd',
    3: 'rd',
    4: 'th',
    5: 'th',
    6: 'th',
    7: 'th',
    8: 'th',
    9: 'th',
    10: 'th',
    11: 'th',
    12: 'th',
    13: 'th',
    14: 'th',
    15: 'th',
    16: 'th',
    17: 'th',
    18: 'th',
    19: 'th',
    20: 'th',
    21: 'st',
    22: 'nd',
    23: 'rd',
    24: 'th',
    25: 'th',
    26: 'th',
    27: 'th',
    28: 'th',
    29: 'th',
    30: 'th',
    31: 'st'
  }
  const date = id.toDate()
  const weekday = days[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${weekday}, ${day}${plurals[day]} ${month}, ${hours}:${minutes < 10 ? `0${minutes}` : minutes}`
}