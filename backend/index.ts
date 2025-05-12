import express from "express";
import expressWs from "express-ws";
import cors from "cors";

const app = express();
const wsInstance = expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();
wsInstance.applyTo(router);


app.use(router);
app.listen(port, () => console.log(`Listening on port ${port}`));