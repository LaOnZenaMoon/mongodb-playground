const handleErrorResponse = (res, e) => {
  console.log(e);
  return res.status(500).send({
    success: false,
    message: e.message,
  });
};

module.exports = {handleErrorResponse};
