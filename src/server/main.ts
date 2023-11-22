import express from "express";
import ViteExpress from "vite-express";
import path from "path";

// creates the expres app do not change
const app = express();

app.get('/', (_req, res) => {
  res.sendFile(path.resolve('src', 'client', 'html', 'home.html'));
});

app.get('/nea.html', (_req, res) => {
  res.sendFile(path.resolve('src', 'client', 'html', 'nea.html'));
})

// Do not change below this line
ViteExpress.listen(app, 5173, () =>
    console.log("Server is listening on http://localhost:5173"),
);
