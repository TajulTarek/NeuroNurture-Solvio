package com.example.doctor.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

@Service
public class EmailService {
    
    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;
    
    @Value("${sendgrid.from-email}")
    private String fromEmail;
    
    @Value("${sendgrid.from-name}")
    private String fromName;
    
    public void sendVerificationEmail(String toEmail, String doctorName, String verificationToken) {
        try {
            SendGrid sg = new SendGrid(sendGridApiKey);
            
            Email from = new Email(fromEmail, fromName);
            String subject = "Verify Your Doctor Account - NeuroNurture";
            Email to = new Email(toEmail);
            
            String verificationUrl = "http://localhost:8081/doctor/verify-email?token=" + verificationToken;
            
            String htmlContent = buildVerificationEmailHtml(doctorName, verificationUrl);
            Content content = new Content("text/html", htmlContent);
            
            Mail mail = new Mail(from, subject, to, content);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sg.api(request);
            System.out.println("Email sent with status: " + response.getStatusCode());
            
        } catch (IOException ex) {
            System.err.println("Error sending email: " + ex.getMessage());
            throw new RuntimeException("Failed to send verification email", ex);
        }
    }
    
    private String buildVerificationEmailHtml(String doctorName, String verificationUrl) {
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
                "<meta charset=\"utf-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "<title>Verify Your Doctor Account</title>" +
                "<style>" +
                    "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                    ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                    ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                    ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                    ".button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                    ".button:hover { background: #5a6fd8; }" +
                    ".footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }" +
                "</style>" +
            "</head>" +
            "<body>" +
                "<div class=\"container\">" +
                    "<div class=\"header\">" +
                        "<h1>Welcome to NeuroNurture!</h1>" +
                        "<p>Your Doctor Account Verification</p>" +
                    "</div>" +
                    "<div class=\"content\">" +
                        "<h2>Hello Dr. " + doctorName + "!</h2>" +
                        "<p>Thank you for registering with NeuroNurture. We're excited to help you track and improve your patients' cognitive development.</p>" +
                        
                        "<p>To complete your registration and access your doctor dashboard, please verify your email address by clicking the button below:</p>" +
                        
                        "<div style=\"text-align: center;\">" +
                            "<a href=\"" + verificationUrl + "\" class=\"button\">Verify Email Address</a>" +
                        "</div>" +
                        
                        "<p>If the button doesn't work, you can also copy and paste this link into your browser:</p>" +
                        "<p style=\"word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px;\">" + verificationUrl + "</p>" +
                        
                        "<p><strong>What happens next?</strong></p>" +
                        "<ul>" +
                            "<li>After email verification, your doctor account will be reviewed by our administration team</li>" +
                            "<li>Once approved, you'll have full access to all NeuroNurture features</li>" +
                            "<li>You'll be able to manage patients, track progress, and access detailed analytics</li>" +
                        "</ul>" +
                        
                        "<p>This verification link will expire in 24 hours for security reasons.</p>" +
                    "</div>" +
                    "<div class=\"footer\">" +
                        "<p>If you didn't create this account, please ignore this email.</p>" +
                        "<p>&copy; 2024 NeuroNurture. All rights reserved.</p>" +
                    "</div>" +
                "</div>" +
            "</body>" +
            "</html>";
    }
    
    /**
     * Send email notification to parent when doctor reviews their child's performance report
     */
    public void sendReportReviewNotification(String toEmail, String parentName, String childName, 
                                             String doctorName, String doctorResponse, String verdict) {
        try {
            SendGrid sg = new SendGrid(sendGridApiKey);
            
            Email from = new Email(fromEmail, fromName);
            String subject = "Performance Report Review - " + childName + " | NeuroNurture";
            Email to = new Email(toEmail);
            
            String htmlContent = buildReportReviewEmailHtml(parentName, childName, doctorName, doctorResponse, verdict);
            Content content = new Content("text/html", htmlContent);
            
            Mail mail = new Mail(from, subject, to, content);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sg.api(request);
            System.out.println("Report review notification email sent with status: " + response.getStatusCode());
            
        } catch (IOException ex) {
            System.err.println("Error sending report review notification email: " + ex.getMessage());
            throw new RuntimeException("Failed to send report review notification email", ex);
        }
    }
    
    private String buildReportReviewEmailHtml(String parentName, String childName, String doctorName, 
                                              String doctorResponse, String verdict) {
        String verdictText = "";
        String verdictColor = "";
        String verdictIcon = "";
        
        if ("SCREENING_NEEDED".equals(verdict)) {
            verdictText = "Screening Recommended";
            verdictColor = "#f59e0b";
            verdictIcon = "⚠️";
        } else if ("NOT_NEEDED".equals(verdict)) {
            verdictText = "No Screening Needed";
            verdictColor = "#10b981";
            verdictIcon = "✅";
        } else if ("INCONCLUSIVE".equals(verdict)) {
            verdictText = "Inconclusive - Further Assessment Needed";
            verdictColor = "#6366f1";
            verdictIcon = "❓";
        }
        
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
                "<meta charset=\"utf-8\">" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "<title>Performance Report Review</title>" +
                "<style>" +
                    "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                    ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                    ".header { background: linear-gradient(135deg, #3fa8d2 0%, #483a35 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                    ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                    ".verdict-box { background: white; border-left: 4px solid " + verdictColor + "; padding: 15px; margin: 20px 0; border-radius: 5px; }" +
                    ".response-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid #e5e7eb; }" +
                    ".footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }" +
                "</style>" +
            "</head>" +
            "<body>" +
                "<div class=\"container\">" +
                    "<div class=\"header\">" +
                        "<h1>📊 Performance Report Review</h1>" +
                        "<p>Your child's report has been reviewed</p>" +
                    "</div>" +
                    "<div class=\"content\">" +
                        "<h2>Hello " + parentName + "!</h2>" +
                        "<p>We're writing to inform you that <strong>Dr. " + doctorName + "</strong> has completed the review of <strong>" + childName + "'s</strong> performance report.</p>" +
                        
                        "<div class=\"verdict-box\">" +
                            "<h3 style=\"margin-top: 0; color: " + verdictColor + ";\">" + verdictIcon + " " + verdictText + "</h3>" +
                        "</div>" +
                        
                        "<div class=\"response-box\">" +
                            "<h3 style=\"margin-top: 0;\">Doctor's Response:</h3>" +
                            "<p style=\"white-space: pre-wrap;\">" + (doctorResponse != null ? doctorResponse : "No additional comments provided.") + "</p>" +
                        "</div>" +
                        
                        "<p><strong>What's next?</strong></p>" +
                        "<ul>" +
                            "<li>You can view the full report and doctor's response in your NeuroNurture dashboard</li>" +
                            "<li>If screening is recommended, please schedule an appointment with your healthcare provider</li>" +
                            "<li>Continue tracking your child's progress through the games</li>" +
                        "</ul>" +
                        
                        "<p style=\"background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0;\">" +
                            "<strong>💡 Tip:</strong> Regular game sessions help track your child's development over time. Keep encouraging your child to play!" +
                        "</p>" +
                    "</div>" +
                    "<div class=\"footer\">" +
                        "<p>If you have any questions, please contact your doctor or our support team.</p>" +
                        "<p>&copy; 2024 NeuroNurture. All rights reserved.</p>" +
                    "</div>" +
                "</div>" +
            "</body>" +
            "</html>";
    }
}
