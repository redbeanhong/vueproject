export default time => {
  let NewTime = new Date(time)
  if (time.toString().length < 13) {
    NewTime = new Date(time * 1000)
  }

  const NewDate = `${NewTime.getFullYear()}/${NewTime.getMonth() +
    1}/${NewTime.getDate()}`
  return NewDate
}
