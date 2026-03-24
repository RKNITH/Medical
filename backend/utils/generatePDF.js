import PDFDocument from "pdfkit";

export const generatePrescriptionPDF = (res, data) => {
    const { patient, doctor, medicines, diagnosis, notes, date } = data;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=prescription_${patient.name}_${date}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor("#0ea5e9").text("MediCore", { align: "center" });
    doc.fontSize(10).fillColor("#64748b").text("Hospital Management System", { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#0ea5e9").stroke();
    doc.moveDown();

    // Doctor & Patient Info
    doc.fontSize(12).fillColor("#000");
    doc.text(`Doctor : Dr. ${doctor.name}`, { continued: true });
    doc.text(`   Specialization: ${doctor.specialization}`, { align: "right" });
    doc.text(`Patient: ${patient.name}`, { continued: true });
    doc.text(`   Age: ${patient.age}  |  Gender: ${patient.gender}`, { align: "right" });
    doc.text(`Date   : ${date}`);
    doc.moveDown();

    // Diagnosis
    doc.fontSize(13).fillColor("#0ea5e9").text("Diagnosis");
    doc.fontSize(11).fillColor("#000").text(diagnosis);
    doc.moveDown();

    // Medicines
    doc.fontSize(13).fillColor("#0ea5e9").text("Prescribed Medicines");
    medicines.forEach((med, i) => {
        doc
            .fontSize(11)
            .fillColor("#000")
            .text(`${i + 1}. ${med.name}  —  ${med.dosage}  |  ${med.duration}  |  ${med.instruction}`);
    });
    doc.moveDown();

    // Notes
    if (notes) {
        doc.fontSize(13).fillColor("#0ea5e9").text("Notes");
        doc.fontSize(11).fillColor("#000").text(notes);
        doc.moveDown();
    }

    // Footer
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#0ea5e9").stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#64748b").text("This is a computer-generated prescription — MediCore HMS", { align: "center" });

    doc.end();
};

export const generateBillPDF = (res, data) => {
    const { patient, billNo, items, totalAmount, paymentMode, date } = data;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=bill_${billNo}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor("#0ea5e9").text("MediCore", { align: "center" });
    doc.fontSize(10).fillColor("#64748b").text("Hospital Management System", { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#0ea5e9").stroke();
    doc.moveDown();

    // Bill Info
    doc.fontSize(12).fillColor("#000");
    doc.text(`Bill No  : ${billNo}`, { continued: true });
    doc.text(`   Date: ${date}`, { align: "right" });
    doc.text(`Patient  : ${patient.name}`);
    doc.text(`Payment  : ${paymentMode}`);
    doc.moveDown();

    // Items Table Header
    doc.fontSize(13).fillColor("#0ea5e9").text("Charges Breakdown");
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#000");
    items.forEach((item, i) => {
        doc.text(`${i + 1}. ${item.description}`, { continued: true });
        doc.text(`   Rs. ${item.amount}`, { align: "right" });
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#cbd5e1").stroke();
    doc.moveDown(0.3);
    doc.fontSize(13).fillColor("#0ea5e9").text("Total Amount", { continued: true });
    doc.text(`Rs. ${totalAmount}`, { align: "right" });

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#0ea5e9").stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#64748b").text("Thank you for choosing MediCore — Get Well Soon!", { align: "center" });

    doc.end();
};