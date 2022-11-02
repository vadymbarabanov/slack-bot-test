export const bodyParser = (func) => (req, res) => {
  const data = [];
  req.on("data", (chunk) => {
    data.push(chunk);
  });

  req.on("end", () => {
    if (data.length) {
      req.body = JSON.parse(Buffer.concat(data).toString());
    }

    func(req, res);
  });
};
