package org.example.springapp.controller;

import org.example.springapp.entity.Complaint;
import org.example.springapp.entity.User;
import org.example.springapp.repository.ComplaintRepository;
import org.example.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        List<Complaint> complaints = complaintRepository.findAll();
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/officers")
    public ResponseEntity<List<User>> getOfficers() {
        List<User> officers = userRepository.findByRole("officer");
        return ResponseEntity.ok(officers);
    }

    @GetMapping("/complaints/stats")
    public ResponseEntity<Map<String, Long>> getComplaintStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", complaintRepository.count());
        stats.put("new", complaintRepository.countByStatus("New"));
        stats.put("assigned", complaintRepository.countByStatus("IN PROGRESS"));
        stats.put("resolved", complaintRepository.countByStatus("Resolved"));
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<String> assignComplaint(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        Long officerId = request.get("officerId");
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        User officer = userRepository.findById(officerId).orElse(null);
        
        if (complaint != null && officer != null) {
            complaint.setAssignedTo(officer);
            complaint.setStatus("IN PROGRESS");
            complaintRepository.save(complaint);
            return ResponseEntity.ok("Complaint assigned successfully");
        }
        return ResponseEntity.badRequest().body("Invalid complaint or officer ID");
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<String> updateComplaintStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        
        if (complaint != null) {
            complaint.setStatus(status);
            complaintRepository.save(complaint);
            return ResponseEntity.ok("Status updated successfully");
        }
        return ResponseEntity.badRequest().body("Invalid complaint ID");
    }

    @GetMapping("/complaints/{id}/notes")
    public ResponseEntity<List<String>> getComplaintNotes(@PathVariable Long id) {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/complaints/{id}/replies")
    public ResponseEntity<List<String>> getComplaintReplies(@PathVariable Long id) {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/complaints/escalated")
    public ResponseEntity<List<Complaint>> getEscalatedComplaints() {
        try {
            List<Complaint> escalatedComplaints = complaintRepository.findEscalatedComplaints();
            return ResponseEntity.ok(escalatedComplaints);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/reports/generate")
    public ResponseEntity<byte[]> generateReport(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) String categories,
            @RequestParam String format) {
        
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            List<Complaint> complaints = complaintRepository.findAll().stream()
                .filter(c -> {
                    LocalDate complaintDate = c.getCreatedAt().toLocalDate();
                    return !complaintDate.isBefore(start) && !complaintDate.isAfter(end);
                })
                .collect(Collectors.toList());

            if (categories != null && !categories.isEmpty()) {
                List<String> categoryList = List.of(categories.split(","));
                complaints = complaints.stream()
                    .filter(c -> categoryList.contains(c.getCategory()))
                    .collect(Collectors.toList());
            }
            
            byte[] reportData;
            String fileName;
            MediaType mediaType;
            
            if ("csv".equalsIgnoreCase(format)) {
                reportData = generateCSVReport(complaints);
                fileName = "complaints_report_" + startDate + "_to_" + endDate + ".csv";
                mediaType = MediaType.parseMediaType("text/csv");
            } else {
                reportData = generatePDFReport(complaints, startDate, endDate);
                fileName = "complaints_report_" + startDate + "_to_" + endDate + ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setContentLength(reportData.length);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    private byte[] generateCSVReport(List<Complaint> complaints) {
        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);

        writer.println("Complaint ID,Subject,Category,Priority,Status,Submission Type,Date Created,Submitted By,Assigned To");

        for (Complaint complaint : complaints) {
            writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                complaint.getId(),
                escapeCSV(complaint.getSubject()),
                complaint.getCategory() != null ? complaint.getCategory() : "",
                complaint.getPriority() != null ? complaint.getPriority() : "",
                complaint.getStatus() != null ? complaint.getStatus() : "",
                complaint.getSubmissionType() != null ? complaint.getSubmissionType() : "",
                complaint.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")),
                complaint.getUser() != null ? complaint.getUser().getUsername() : "Anonymous",
                complaint.getAssignedTo() != null ? complaint.getAssignedTo().getUsername() : "Unassigned"
            );
        }
        
        return stringWriter.toString().getBytes();
    }
    
    private byte[] generatePDFReport(List<Complaint> complaints, String startDate, String endDate) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();
            
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
            
            Paragraph title = new Paragraph("COMPLAINTS REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            
            document.add(new Paragraph(" "));
            
            Paragraph period = new Paragraph("Report Period: " + startDate + " to " + endDate, normalFont);
            period.setAlignment(Element.ALIGN_CENTER);
            document.add(period);
            
            Paragraph total = new Paragraph("Total Complaints: " + complaints.size(), normalFont);
            total.setAlignment(Element.ALIGN_CENTER);
            document.add(total);
            
            document.add(new Paragraph(" "));
            
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1, 3, 1.5f, 1.5f, 1.5f, 2});
            
            table.addCell(new PdfPCell(new Phrase("ID", headerFont)));
            table.addCell(new PdfPCell(new Phrase("Subject", headerFont)));
            table.addCell(new PdfPCell(new Phrase("Category", headerFont)));
            table.addCell(new PdfPCell(new Phrase("Priority", headerFont)));
            table.addCell(new PdfPCell(new Phrase("Status", headerFont)));
            table.addCell(new PdfPCell(new Phrase("Created Date", headerFont)));
            
            for (Complaint complaint : complaints) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(complaint.getId()), normalFont)));
                table.addCell(new PdfPCell(new Phrase(complaint.getSubject() != null ? complaint.getSubject() : "", normalFont)));
                table.addCell(new PdfPCell(new Phrase(complaint.getCategory() != null ? complaint.getCategory() : "", normalFont)));
                table.addCell(new PdfPCell(new Phrase(complaint.getPriority() != null ? complaint.getPriority() : "", normalFont)));
                table.addCell(new PdfPCell(new Phrase(complaint.getStatus() != null ? complaint.getStatus() : "", normalFont)));
                table.addCell(new PdfPCell(new Phrase(complaint.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")), normalFont)));
            }
            
            document.add(table);
            document.close();
            
            return baos.toByteArray();
        } catch (DocumentException e) {
            return "Error generating PDF".getBytes();
        }
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        return value.replace("\"", "\\\"").replace("\n", " ").replace("\r", " ");
    }
}