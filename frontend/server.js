const app = require("./app");

const PORT = Number(process.env.WEB_PORT || 4000);

app.listen(PORT, () => {
  console.log(`Aplicacao web iniciada em http://localhost:${PORT}`);
});
