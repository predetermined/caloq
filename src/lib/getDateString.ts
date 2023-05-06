export function getDateString(date: Date) {
  const _day = date.getDate();
  const day = _day < 10 ? "0" + _day : _day;
  const _month = date.getMonth() + 1;
  const month = _month < 10 ? "0" + _month : _month;

  return `${month}/${day}/${date.getFullYear().toString().slice(-2)}`;
}
