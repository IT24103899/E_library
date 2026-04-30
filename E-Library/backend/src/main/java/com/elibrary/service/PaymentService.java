package com.elibrary.service;

import com.elibrary.model.Payment;
import com.elibrary.model.User;
import com.elibrary.repository.PaymentRepository;
import com.elibrary.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    private static final String PLAN_MONTHLY = "MONTHLY";
    private static final String PLAN_YEARLY = "YEARLY";

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.monthly-price-cents}")
    private Long monthlyPriceCents;

    @Value("${stripe.yearly-price-cents}")
    private Long yearlyPriceCents;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public PaymentService(PaymentRepository paymentRepository, UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public Map<String, String> createCheckoutSession(Long userId, String planType) throws StripeException {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (!PLAN_MONTHLY.equals(planType) && !PLAN_YEARLY.equals(planType)) {
            throw new IllegalArgumentException("Invalid plan type. Must be MONTHLY or YEARLY.");
        }

        long priceCents = PLAN_MONTHLY.equals(planType) ? monthlyPriceCents : yearlyPriceCents;
        String planLabel = PLAN_MONTHLY.equals(planType) ? "E-Library Premium — Monthly" : "E-Library Premium — Yearly";

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomerEmail(user.getEmail())
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(priceCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(planLabel)
                                                                .setDescription(PLAN_MONTHLY.equals(planType)
                                                                        ? "30 days of unlimited access to all premium books"
                                                                        : "365 days of unlimited access to all premium books")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("userId", String.valueOf(userId))
                .putMetadata("planType", planType)
                .build();

        Session session = Session.create(params);

        Payment payment = new Payment(user, session.getId(), planType, priceCents);
        paymentRepository.save(payment);

        logger.info("Created Stripe checkout session {} for user {} plan {}", session.getId(), userId, planType);

        Map<String, String> result = new HashMap<>();
        result.put("url", session.getUrl());
        result.put("sessionId", session.getId());
        return result;
    }

    @Transactional
    public Map<String, Object> confirmPayment(String sessionId) throws StripeException {
        Session session = Session.retrieve(sessionId);

        Optional<Payment> paymentOpt = paymentRepository.findByStripeSessionId(sessionId);
        if (paymentOpt.isEmpty()) {
            throw new IllegalArgumentException("Payment record not found for session: " + sessionId);
        }

        Payment payment = paymentOpt.get();

        if ("COMPLETED".equals(payment.getStatus())) {
            return buildStatusResponse(payment.getUser());
        }

        if (!"paid".equals(session.getPaymentStatus())) {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            throw new IllegalStateException("Payment not completed. Status: " + session.getPaymentStatus());
        }

        payment.setStatus("COMPLETED");
        payment.setStripePaymentIntentId(session.getPaymentIntent());
        payment.setCompletedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        User user = payment.getUser();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentExpiry = user.getPremiumExpiresAt();
        LocalDateTime base = (currentExpiry != null && currentExpiry.isAfter(now)) ? currentExpiry : now;

        LocalDateTime newExpiry = PLAN_MONTHLY.equals(payment.getPlanType())
                ? base.plusDays(30)
                : base.plusDays(365);

        user.setIsPremium(true);
        user.setPremiumExpiresAt(newExpiry);
        user.setSubscriptionPlan(payment.getPlanType());
        userRepository.save(user);

        logger.info("User {} upgraded to premium {} until {}", user.getId(), payment.getPlanType(), newExpiry);

        return buildStatusResponse(user);
    }

    public Map<String, Object> getSubscriptionStatus(Long userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        LocalDateTime now = LocalDateTime.now();
        boolean active = Boolean.TRUE.equals(user.getIsPremium())
                && user.getPremiumExpiresAt() != null
                && user.getPremiumExpiresAt().isAfter(now);

        if (!active && Boolean.TRUE.equals(user.getIsPremium())) {
            user.setIsPremium(false);
            user.setSubscriptionPlan(null);
            userRepository.save(user);
        }

        return buildStatusResponse(user);
    }

    @Transactional
    public Map<String, Object> cancelSubscription(Long userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setIsPremium(false);
        user.setPremiumExpiresAt(null);
        user.setSubscriptionPlan(null);
        userRepository.save(user);

        logger.info("User {} subscription cancelled", userId);

        return buildStatusResponse(user);
    }

    public List<Payment> getPaymentHistory(Long userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void handleWebhook(String payload, String sigHeader) throws StripeException {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            logger.warn("Invalid Stripe webhook signature");
            throw e;
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElseThrow(() -> new IllegalStateException("Failed to deserialize Stripe event"));

            try {
                confirmPayment(session.getId());
                logger.info("Webhook: confirmed payment for session {}", session.getId());
            } catch (Exception e) {
                logger.error("Webhook: failed to confirm payment for session {}: {}", session.getId(), e.getMessage());
            }
        }
    }

    private Map<String, Object> buildStatusResponse(User user) {
        LocalDateTime now = LocalDateTime.now();
        boolean active = Boolean.TRUE.equals(user.getIsPremium())
                && user.getPremiumExpiresAt() != null
                && user.getPremiumExpiresAt().isAfter(now);

        Map<String, Object> response = new HashMap<>();
        response.put("isPremium", active);
        response.put("subscriptionPlan", user.getSubscriptionPlan());
        response.put("premiumExpiresAt", user.getPremiumExpiresAt() != null ? user.getPremiumExpiresAt().toString() : null);
        response.put("userId", user.getId());
        return response;
    }
}
