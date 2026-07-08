const PDFDocument = require('pdfkit');

// Builds a plain JSON-serializable object of decrypted entries
const buildJsonExport = (user, entries) => {
  return {
    exportedAt: new Date().toISOString(),
    user: { name: user.name, email: user.email },
    entryCount: entries.length,
    entries: entries.map((e) => ({
      date: e.date,
      prompt: e.prompt,
      content: e.content, // already decrypted before reaching here
      mood: e.mood,
      energy: e.energy,
    })),
  };
};

// Streams a PDF document directly to the HTTP response
const streamPdfExport = (res, user, entries) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="mindwell-journal-export.pdf"');
  doc.pipe(res);

  doc.fontSize(20).text('MindWell Journal Export', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).fillColor('gray').text(`Exported for: ${user.email}`);
  doc.text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown(2);

  entries.forEach((entry, i) => {
    doc.fillColor('black').fontSize(12).text(`Entry ${i + 1} — ${new Date(entry.date).toLocaleDateString()}`, {
      underline: true,
    });
    if (entry.prompt) {
      doc.fontSize(10).fillColor('gray').text(`Prompt: ${entry.prompt}`);
    }
    doc.fontSize(11).fillColor('black').text(entry.content, { paragraphGap: 4 });
    doc.fontSize(9).fillColor('gray').text(`Mood: ${entry.mood}/10   Energy: ${entry.energy}/10`);
    doc.moveDown(1.5);
  });

  doc.end();
};

module.exports = { buildJsonExport, streamPdfExport };
