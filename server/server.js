import express from "express";
import config from "./config";
import path from "path";
import glob from "glob";
import fs from "fs-extra";
import { guid, generateName, saveThumbnail } from "./util";
import { exec } from "child_process";
import cors from "cors";
import webpack from "webpack";
import webpackMiddleware from "webpack-dev-middleware";
import webpackConfig from "../webpack.config";

const app = express();
const { port } = config;

const appDir = path.join(__dirname, "../build");
const dataDir = path.join(__dirname, "../data");
const projectDir = path.join(dataDir, "projects");
const thumbDir = path.join(dataDir, "thumbs");
const tmpDir = path.join(appDir, "tmp");

const compiler = webpack(webpackConfig);

// Check thumbnails
const allFiles = glob.sync(`${projectDir}/**/*.json`);
allFiles.forEach(file => {
  const fileContents = JSON.parse(fs.readFileSync(file));
  const thumbFileName = `${fileContents.id}.png`;
  const thumbPath = `${thumbDir}/${thumbFileName}`;

  if (!fs.existsSync(thumbPath)) {
    try {
      saveThumbnail(thumbPath, fileContents.svg)
        .then(() => {
          console.log("Thumb saved");
        })
        .catch(err => {
          console.log(err2);
        });
    } catch (err) {
      console.log(err);
    }
  }
});

app.use(
  webpackMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
  })
);

// app.use(cors);
app.use(express.static(appDir));
app.use("/thumbs", express.static(`${dataDir}/thumbs`));
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
  .route("/project/:project/:id?")
  .get((req, res) => {
    const { id, project } = req.params;
    if (id && project) {
      console.log(project, id);
      const filePath = path.join(dataDir, "projects", project, `${id}.json`);
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
    const { project } = req.params;

    const rune = req.body;

    const now = new Date().toJSON();
    rune.modified = now;

    if (!rune.created) {
      console.log("Adding created");
      rune.created = now;
    }

    const filePath = `${projectDir}/${project}/${rune.id}.json`;
    const thumbFileName = `${rune.id}.png`;
    const thumbPath = `${thumbDir}/${thumbFileName}`;
    rune.thumb = thumbFileName;

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
    const { project } = req.params;
    const { group, source = "" } = req.body;

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
    const filePath = `${projectDir}/${project}/${rune.id}.json`;

    const thumbFileName = `${rune.id}.png`;
    const thumbPath = `${thumbDir}/${thumbFileName}`;
    rune.thumb = thumbFileName;

    console.log(thumbPath);

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
    const { project } = req.params;
    const { id } = req.body;
    fs.unlink(`${projectDir}/${project}/${id}.json`, err => {
      if (err) console.log("huh", err);
      const thumbPath = `${dataDir}/thumbs/${id}.png`;
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
// exec(`montage ${dataDir}/thumbs/*.png ${output}`, (err, stdout, stderr) => {
//   console.log('Montage generated');
// });
glob(`${dataDir}/*.json`, (err, files) => {
  files.forEach(file => {
    const frag = path.parse(file);
    const thumbPath = `${dataDir}/thumbs/${frag.name}.png`;
    if (!fs.existsSync(thumbPath)) {
      const rune = JSON.parse(fs.readFileSync(file));
      saveThumbnail(thumbPath, rune.svg);
    }
  });
});

app.get("/preview", (req, res) => {
  const output = `${tmpDir}/montage.png`;
  exec(`montage ${dataDir}/thumbs/*.png ${output}`, (err, stdout, stderr) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.sendFile(path.resolve(output));
  });
});

function getRunes(project) {
  const runes = glob.sync(`${projectDir}/${project}/*.json`).map(f => {
    return JSON.parse(fs.readFileSync(f, "utf-8"));
  });
  return runes;
}

app.get("/projects", (req, res) => {
  const projects = glob
    .sync(`${projectDir}/*`)
    .map(dir => dir.split("/").pop())
    .reduce((a, b) => {
      a[b] = getRunes(b);
      return a;
    }, {});
  res.send(projects);
});

app
  .route("/projects/create/:projectName")
  .put(async (req, res) => {
    const { projectName } = req.params;
    const cleanProjectName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "");
    if (cleanProjectName) {
      try {
        const result = await fs.ensureDir(path.join(projectDir, projectName));
      } catch (err) {
        console.log(err);
        res.sendStatus(500);
      }
    } else {
      res.sendStatus(400);
    }
    console.log(projectName, cleanProjectName);
    res.sendStatus(200);
  })
  .delete((req, res) => {});

app.get("/:project/runes", (req, res) => {
  const { project } = req.params;
  const runes = getRunes(project);
  console.log("Project", project, runes.length);
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
