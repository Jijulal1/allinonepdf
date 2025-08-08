const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Merge PDFs route
app.post('/merge', upload.array('files', 10), async (req, res) => {
  const pdfDocs = [];
  for (const file of req.files) {
    const data = fs.readFileSync(file.path);
    pdfDocs.push(await PDFDocument.load(data));
  }
  const mergedPdf = await PDFDocument.create();
  for (const pdfDoc of pdfDocs) {
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }
  const mergedPdfBytes = await mergedPdf.save();
  res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
  res.contentType("application/pdf");
  res.send(Buffer.from(mergedPdfBytes));
  // Clean up uploaded files
  req.files.forEach(file => fs.unlinkSync(file.path));
});

// Placeholder: Add more routes for split, compress, convert, etc.

app.listen(5000, () => console.log('PDF server running on port 5000'));