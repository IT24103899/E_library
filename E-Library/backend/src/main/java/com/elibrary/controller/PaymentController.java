package com.elibrary.controller;

import com.elibrary.model.Payment;
import com.elibrary.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.parseLong(body.get("userId").toString());
            String planType = body.get("planType").toString();
            Map<String, String> result = paymentService.createCheckoutSession(userId, planType);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (StripeException e) {
            logger.error("Stripe error creating checkout session: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Payment service unavailable. Please try again later."));
        }
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, String> body) {
        try {
            String sessionId = body.get("sessionId");
            if (sessionId == null || sessionId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "sessionId is required"));
            }
            Map<String, Object> result = paymentService.confirmPayment(sessionId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (StripeException e) {
            logger.error("Stripe error confirming payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Payment verification failed. Please contact support."));
        }
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getSubscriptionStatus(@PathVariable Long userId) {
        try {
            Map<String, Object> status = paymentService.getSubscriptionStatus(userId);
            return ResponseEntity.ok(status);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/cancel/{userId}")
    public ResponseEntity<?> cancelSubscription(@PathVariable Long userId) {
        try {
            Map<String, Object> result = paymentService.cancelSubscription(userId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getPaymentHistory(@PathVariable Long userId) {
        List<Payment> payments = paymentService.getPaymentHistory(userId);
        List<Map<String, Object>> result = payments.stream().map(p -> Map.<String, Object>of(
                "id", p.getId(),
                "planType", p.getPlanType(),
                "amountCents", p.getAmountCents(),
                "currency", p.getCurrency(),
                "status", p.getStatus(),
                "createdAt", p.getCreatedAt().toString(),
                "completedAt", p.getCompletedAt() != null ? p.getCompletedAt().toString() : null
        )).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            paymentService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook processed");
        } catch (SignatureVerificationException e) {
            logger.warn("Stripe webhook signature verification failed");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (StripeException e) {
            logger.error("Stripe webhook error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook error");
        }
    }
}
