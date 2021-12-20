export default (page, size) => {
  const limit = size ? +size : 7;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};
