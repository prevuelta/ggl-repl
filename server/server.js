import express from "express";
import config from "./config";
import path from "path";
import glob from "glob";
import fs from "fs";
import { guid, generateName, saveThumbnail } from "./util";
import { exec } from "child_process";
import cors from "cors";

const app = express();
const { port } = config;

const appDir = path.join(__dirname, "../build");
const storage = `${__dirname}/../stored`;
const thumbDir = `${storage}/thumbs`;
const tmpDir = `${__dirname}/../tmp`;

// app.use(cors);
app.use(express.static(appDir));
app.use("/thumbs", express.static(`${storage}/thumbs`));
app.use(express.json());

app.use((req, res, next) => {
  // res.header("Access-Control-Allow-Origin", "http://localhost:5100"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app
  .route("/rune/:id?")
  .get((req, res) => {
    const { id } = req.params;
    if (id) {
      const filePath = path.join(storage, `${id}.json`);
      if (fs.existsSync(filePath)) {
        if (req.query.svg) {
          const rune = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          res.send(rune.svg);
        } else {
          res.sendFile(filePath);
        }
      } else {
        res.send(500);
      }
    } else {
      res.send(400);
    }
  })
  .post((req, res) => {
    const rune = req.body;

    const now = new Date().toJSON();
    rune.modified = now;

    if (!rune.created) {
      console.log("Adding created");
      rune.created = now;
    }

    const filePath = `${storage}/${rune.id}.json`;
    const thumbFileName = `${rune.id}.png`;
    const thumbPath = `${thumbDir}/${thumbFileName}`;
    rune.thumb = thumbFileName;

    console.log("Writing file");

    fs.writeFile(filePath, JSON.stringify(rune), err => {
      if (rune.svg !== "") {
        try {
          saveThumbnail(thumbPath, rune.svg)
            .then(() => {
              res.sendStatus(200);
            })
            .catch(err => {
              console.log(err2);
              res.sendStatus(500);
            });
        } catch (err) {
          console.log(err);
          res.status(500).send("Failure creating thumbnail");
        }
      }
    });
  })
  .put((req, res) => {
    const now = new Date().toJSON();
    const { group, source = "" } = req.body;
    console.log("New rune", req.body);
    const rune = {
      id: guid(),
      source,
      svg: "<svg></svg>",
      name: generateName(),
      group,
      modified: now,
      created: now,
      padding: 0,
    };
    const filePath = `${storage}/${rune.id}.json`;

    const thumbFileName = `${rune.id}.png`;
    const thumbPath = `${thumbDir}/${thumbFileName}`;
    rune.thumb = thumbFileName;

    fs.writeFile(filePath, JSON.stringify(rune), err => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      saveThumbnail(thumbPath, rune.svg)
        .then(() => {
          res.sendStatus(200);
        })
        .catch(err => {
          console.log(err);
          res.sendStatus(500);
        });
    });
  })
  .delete((req, res) => {
    const { id } = req.body;
    fs.unlink(`${storage}/${id}.json`, err => {
      if (err) console.log("huh", err);
      const thumbPath = `${storage}/thumbs/${id}.png`;
      if (fs.existsSync(thumbPath)) {
        fs.unlink(thumbPath, err => {
          if (err) console.log("Wat", err);
          res.sendStatus(204);
        });
      } else {
        res.sendStatus(204);
      }
    });
  });

// const output = `${tmpDir}/montage.png`;
// exec(`montage ${storage}/thumbs/*.png ${output}`, (err, stdout, stderr) => {
//   console.log('Montage generated');
// });
glob(`${storage}/*.json`, (err, files) => {
  files.forEach(file => {
    const frag = path.parse(file);
    const thumbPath = `${storage}/thumbs/${frag.name}.png`;
    if (!fs.existsSync(thumbPath)) {
      const rune = JSON.parse(fs.readFileSync(file));
      saveThumbnail(thumbPath, rune.svg);
    }
  });
});

app.get("/preview", (req, res) => {
  const output = `${tmpDir}/montage.png`;
  exec(`montage ${storage}/thumbs/*.png ${output}`, (err, stdout, stderr) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.sendFile(path.resolve(output));
  });
});

function getRunes() {
  const runes = glob.sync(`${storage}/*.json`).map(f => {
    return JSON.parse(fs.readFileSync(f, "utf-8"));
  });
  return runes;
}

app.get("/runes", (req, res) => {
  const runes = getRunes();
  runes.sort((a, b) => {
    const dateA = +new Date(a.created);
    const dateB = +new Date(b.created);
    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;
    return 0;
  });
  res.send(runes);
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
