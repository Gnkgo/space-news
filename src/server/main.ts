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

app.get('/nasa-cad-api', async (req, res) => {
  try {
    const {'date-min': dateMin, 'date-max': dateMax, 'dist-max': distMax} = req.query as {'date-min': string, 'date-max': string, 'dist-max': string};
    const response = await fetch(`https://ssd-api.jpl.nasa.gov/cad.api?date-min=${dateMin}&date-max=%2B${dateMax}&dist-max=${distMax}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Do not change below this line
ViteExpress.listen(app, 5173, () =>
    console.log("Server is listening on http://localhost:5173"),
);
