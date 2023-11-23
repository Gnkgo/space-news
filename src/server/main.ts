import express from "express";
import ViteExpress from "vite-express";
import path from "path";

// creates the expres app do not change
const app = express();

// VALENTIN START
/*
type LoggedError = {
  apiName: string,
  timeStamp: number,
  error: unknown
};
type FetchGenerator<TReq> = (req: TReq) => string;
function regFile(target: string, ...paths: string[]): void {
  app.get(target, (_req, res) => {
    res.sendFile(path.resolve(...paths));
  });
}
function regHtml(target: string, file: string) {
  regFile(target, 'src', 'client', 'html', file);
}
function regApi<TReq>(target: string, gen: FetchGenerator<TReq>) {
  app.get(target, async (req, res) => {
    try {
      const apiReq = req.query as TReq;
      const apiRes = await fetch(gen(apiReq));
      res.json(await apiRes.json());
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
}
regHtml('/', 'home.html');
regHtml('/nea.html', 'nea.html');
regApi<CADReq>('/nasa-cad-api', req => `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${req["date-min"]}&date-max=%2B${req["date-max"]}&dist-max=${req["dist-max"]}`);
*/
// VALENTIN END

app.get('/', (_req, res) => {
  res.sendFile(path.resolve('src', 'client', 'html', 'home.html'));
});
app.get('/nea.html', (_req, res) => {
  res.sendFile(path.resolve('src', 'client', 'html', 'nea.html'));
});
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
