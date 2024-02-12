const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // For generating unique file names
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Set the directory where uploaded files will be stored
const uploadDirectory = path.join(__dirname, 'uploads');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function(req, file, cb) {
        // Since we cannot directly access form fields here in the filename function,
        // we'll temporarily skip custom naming here and handle it later
        cb(null, uuidv4() + path.extname(file.originalname)); // Generate a unique name to avoid conflicts
    }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/files', (req, res) => {
  const directoryPath = path.join(__dirname, 'uploads');

  fs.readdir(directoryPath, function (err, files) {
      if (err) {
          res.status(500).send({
              message: "Unable to scan files!",
          });
      } 
      let fileList = [];
      files.forEach((file) => {
          fileList.push(file);
      });
      res.send(fileList);
  });
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const directoryPath = path.join(__dirname, 'uploads');
  const filePath = path.join(directoryPath, filename);

  res.download(filePath, filename, (err) => {
      if (err) {
          res.status(500).send({
              message: "Could not download the file. " + err,
          });
      }
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
    const { name = 'Unknown Show', dateOfAir = 'Unknown Date', description = 'Unknown Description' } = req.body;

    if (!req.file) {
        return res.status(400).send({ error: "Please upload a file." });
    }

    // Generate new filename based on form data
    const newFilename = `${name} - ${dateOfAir} (${description}).mp3`;
    const secureName = path.basename(newFilename); // This is a basic way to avoid path traversal issues
    const oldPath = req.file.path;
    const newPath = path.join(uploadDirectory, secureName);

    // Rename the file
    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            return res.status(500).send({ error: "Error saving file with new name." });
        }

        // File has been renamed and saved, respond to the client
        res.json({
            success: true,
            message: `File saved as ${newFilename}`,
            filePath: newPath
        });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
