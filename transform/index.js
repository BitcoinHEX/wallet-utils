const transform = {
  dayProxy(day) {
    let dayProxy = day;
    if (day === -2) dayProxy = 351;
    if (day === -1) dayProxy = 352;
    return dayProxy;
  },
};

module.exports = transform;
