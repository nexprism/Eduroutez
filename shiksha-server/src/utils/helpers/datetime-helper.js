function compareTime(timeString1, timeString2) {
  var date1 = new Date(timeString1);
  var date2 = new Date(timeString2);
  return date1.getTime() > date2.getTime();
}

export { compareTime };
