import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import Tesseract from "tesseract.js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import multer from "multer";
import * as fs from "fs";
import * as path from "path";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as XLSX from "xlsx";

const upload = multer({ 
  dest: "/tmp/uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/documents", async (_req, res) => {
    try {
      const docs = await storage.getDocuments();
      res.json(docs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const doc = await storage.getDocument(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const parsed = insertDocumentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid document data" });
      }
      const doc = await storage.createDocument(parsed.data);
      res.status(201).json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const { title, filter, pageCount } = req.body;
      const updateData: { title?: string; filter?: string; pageCount?: number } = {};
      
      if (title !== undefined && typeof title === "string") {
        updateData.title = title;
      }
      if (filter !== undefined && typeof filter === "string") {
        updateData.filter = filter;
      }
      if (pageCount !== undefined && typeof pageCount === "number") {
        updateData.pageCount = pageCount;
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      const doc = await storage.updateDocument(req.params.id, updateData);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const success = await storage.deleteDocument(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  app.post("/api/ocr", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imagePath = req.file.path;
      
      const { data: { text, confidence } } = await Tesseract.recognize(
        imagePath,
        "eng",
        {
          logger: (m) => console.log(m)
        }
      );

      fs.unlinkSync(imagePath);

      res.json({ 
        text: text.trim(),
        confidence: Math.round(confidence),
        wordCount: text.trim().split(/\s+/).filter(w => w.length > 0).length
      });
    } catch (error) {
      console.error("OCR error:", error);
      res.status(500).json({ error: "Failed to process OCR" });
    }
  });

  app.post("/api/signature", upload.fields([
    { name: "document", maxCount: 1 },
    { name: "signature", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.document?.[0] || !files.signature?.[0]) {
        return res.status(400).json({ error: "Document and signature images required" });
      }

      const documentPath = files.document[0].path;
      const signaturePath = files.signature[0].path;
      const { x, y, width, height } = req.body;

      const signatureX = parseInt(x) || 50;
      const signatureY = parseInt(y) || 50;
      const signatureWidth = parseInt(width) || 200;
      const signatureHeight = parseInt(height) || 100;

      const documentBuffer = await sharp(documentPath).png().toBuffer();
      const documentMetadata = await sharp(documentPath).metadata();

      const signatureBuffer = await sharp(signaturePath)
        .resize(signatureWidth, signatureHeight, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer();

      const outputBuffer = await sharp(documentBuffer)
        .composite([{
          input: signatureBuffer,
          left: signatureX,
          top: signatureY,
        }])
        .png()
        .toBuffer();

      fs.unlinkSync(documentPath);
      fs.unlinkSync(signaturePath);

      res.set("Content-Type", "image/png");
      res.set("Content-Disposition", "attachment; filename=signed_document.png");
      res.send(outputBuffer);
    } catch (error) {
      console.error("Signature error:", error);
      res.status(500).json({ error: "Failed to apply signature" });
    }
  });

  app.post("/api/pdf/protect", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No document file provided" });
      }

      const { password, title } = req.body;
      
      if (!password || password.length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters" });
      }

      const documentPath = req.file.path;
      const imageBuffer = fs.readFileSync(documentPath);
      
      const pdfDoc = await PDFDocument.create();
      
      const image = await pdfDoc.embedPng(
        await sharp(imageBuffer).png().toBuffer()
      ).catch(async () => {
        return await pdfDoc.embedJpg(
          await sharp(imageBuffer).jpeg().toBuffer()
        );
      });

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      pdfDoc.setTitle(title || "Protected Document");
      pdfDoc.setCreator("CamNote");

      const pdfBytes = await pdfDoc.save();

      fs.unlinkSync(documentPath);

      res.set("Content-Type", "application/pdf");
      res.set("Content-Disposition", `attachment; filename=${(title || "protected").replace(/\s+/g, "_")}.pdf`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("PDF protection error:", error);
      res.status(500).json({ error: "Failed to create protected PDF" });
    }
  });

  app.post("/api/pdf/merge", upload.array("documents", 20), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length < 2) {
        return res.status(400).json({ error: "At least 2 documents required for merge" });
      }

      const { title } = req.body;
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        try {
          const imageBuffer = fs.readFileSync(file.path);
          
          const image = await pdfDoc.embedPng(
            await sharp(imageBuffer).png().toBuffer()
          ).catch(async () => {
            return await pdfDoc.embedJpg(
              await sharp(imageBuffer).jpeg().toBuffer()
            );
          });

          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        } catch (imgError) {
          console.error(`Error processing image ${file.originalname}:`, imgError);
        }
      }

      pdfDoc.setTitle(title || "Merged Document");
      pdfDoc.setCreator("CamNote");

      const pdfBytes = await pdfDoc.save();

      for (const file of files) {
        try {
          fs.unlinkSync(file.path);
        } catch {}
      }

      res.set("Content-Type", "application/pdf");
      res.set("Content-Disposition", `attachment; filename=${(title || "merged").replace(/\s+/g, "_")}.pdf`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("PDF merge error:", error);
      res.status(500).json({ error: "Failed to merge documents" });
    }
  });

  app.post("/api/export/docx", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imagePath = req.file.path;

      const { data: { text } } = await Tesseract.recognize(imagePath, "eng", {
        logger: (m) => console.log(m),
      });

      fs.unlinkSync(imagePath);

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: text
              .trim()
              .split("\n")
              .map(
                (line) =>
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: line || " ",
                        font: "Calibri",
                        size: 22,
                      }),
                    ],
                  })
              ),
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      res.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.set("Content-Disposition", "attachment; filename=document.docx");
      res.send(buffer);
    } catch (error) {
      console.error("DOCX export error:", error);
      res.status(500).json({ error: "Failed to export as DOCX" });
    }
  });

  app.post("/api/export/xlsx", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imagePath = req.file.path;

      const { data: { text } } = await Tesseract.recognize(imagePath, "eng", {
        logger: (m) => console.log(m),
      });

      fs.unlinkSync(imagePath);

      const lines = text.trim().split("\n");
      const data = lines.map((line) => [line]);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Text");

      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

      res.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.set("Content-Disposition", "attachment; filename=document.xlsx");
      res.send(buffer);
    } catch (error) {
      console.error("XLSX export error:", error);
      res.status(500).json({ error: "Failed to export as XLSX" });
    }
  });

  app.post("/api/export/txt", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imagePath = req.file.path;

      const { data: { text } } = await Tesseract.recognize(imagePath, "eng", {
        logger: (m) => console.log(m),
      });

      fs.unlinkSync(imagePath);

      res.set("Content-Type", "text/plain");
      res.set("Content-Disposition", "attachment; filename=document.txt");
      res.send(text.trim());
    } catch (error) {
      console.error("TXT export error:", error);
      res.status(500).json({ error: "Failed to export as TXT" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
