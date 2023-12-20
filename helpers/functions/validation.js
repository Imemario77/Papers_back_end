export const isEmpty = (value) => {
  if (value.length <= 0) return true;
  else return false;
};

export const isMatch = (value1, value2) => {
  if (value1 === value2) return true;
  else return false;
};
