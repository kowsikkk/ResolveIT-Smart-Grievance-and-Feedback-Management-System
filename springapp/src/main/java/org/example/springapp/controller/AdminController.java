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
import java.time.LocalDateTime;
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
import com.itextpdf.text.BaseColor;
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

    @PutMapping("/complaints/{id}/escalation")
    public ResponseEntity<String> updateEscalationDays(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        Integer escalationDays = request.get("escalationDays");
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        
        if (complaint != null) {
            complaint.setEscalationDays(escalationDays);
            complaintRepository.save(complaint);
            return ResponseEntity.ok("Escalation days updated successfully");
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

        writer.println("Complaint ID,Subject,Description,Category,Priority,Status,Submission Type,Date Created,Submitted By,Assigned To");

        for (Complaint complaint : complaints) {
            writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                complaint.getId(),
                escapeCSV(complaint.getSubject()),
                escapeCSV(complaint.getDescription()),
                complaint.getCategory() != null ? complaint.getCategory() : "",
                complaint.getPriority() != null ? complaint.getPriority() : "",
                complaint.getStatus() != null ? complaint.getStatus() : "",
                complaint.getSubmissionType() != null ? complaint.getSubmissionType() : "",
                complaint.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")),
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
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL);
            Font smallFont = new Font(Font.FontFamily.HELVETICA, 7, Font.NORMAL);
            
            Paragraph title = new Paragraph("GRIEVANCE & FEEDBACK MANAGEMENT SYSTEM", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            
            Paragraph subtitle = new Paragraph("COMPLAINTS REPORT", headerFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);
            
            document.add(new Paragraph(" "));
            
            Paragraph period = new Paragraph("Report Period: " + startDate + " to " + endDate, normalFont);
            period.setAlignment(Element.ALIGN_CENTER);
            document.add(period);
            
            Paragraph total = new Paragraph("Total Complaints: " + complaints.size(), normalFont);
            total.setAlignment(Element.ALIGN_CENTER);
            document.add(total);
            
            document.add(new Paragraph(" "));
            
            // Summary Statistics
            long newCount = complaints.stream().filter(c -> "NEW".equals(c.getStatus())).count();
            long inProgressCount = complaints.stream().filter(c -> "IN PROGRESS".equals(c.getStatus())).count();
            long resolvedCount = complaints.stream().filter(c -> "Resolved".equals(c.getStatus())).count();
            Paragraph stats = new Paragraph(String.format("Status Summary - New: %d | In Progress: %d | Resolved: %d", 
                newCount, inProgressCount, resolvedCount), normalFont);
            stats.setAlignment(Element.ALIGN_CENTER);
            document.add(stats);
            
            document.add(new Paragraph(" "));
            
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.8f, 2.5f, 2.5f, 1f, 1f, 1.2f, 1.5f});
            
            // Headers
            addTableHeader(table, "ID", headerFont);
            addTableHeader(table, "Subject", headerFont);
            addTableHeader(table, "Description", headerFont);
            addTableHeader(table, "Category", headerFont);
            addTableHeader(table, "Priority", headerFont);
            addTableHeader(table, "Status", headerFont);
            addTableHeader(table, "Date", headerFont);
            
            for (Complaint complaint : complaints) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(complaint.getId()), smallFont)));
                table.addCell(new PdfPCell(new Phrase(truncateText(complaint.getSubject(), 40), smallFont)));
                table.addCell(new PdfPCell(new Phrase(truncateText(complaint.getDescription(), 60), smallFont)));
                table.addCell(new PdfPCell(new Phrase(complaint.getCategory() != null ? complaint.getCategory() : "", smallFont)));
                table.addCell(new PdfPCell(new Phrase(complaint.getPriority() != null ? complaint.getPriority() : "", smallFont)));
                table.addCell(new PdfPCell(new Phrase(complaint.getStatus() != null ? complaint.getStatus() : "", smallFont)));
                table.addCell(new PdfPCell(new Phrase(complaint.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yy")), smallFont)));
            }
            
            document.add(table);
            
            // Footer
            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("Generated on: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")), smallFont);
            footer.setAlignment(Element.ALIGN_RIGHT);
            document.add(footer);
            
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
    

    
    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(new BaseColor(240, 240, 240));
        table.addCell(cell);
    }
    
    private String truncateText(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }
}