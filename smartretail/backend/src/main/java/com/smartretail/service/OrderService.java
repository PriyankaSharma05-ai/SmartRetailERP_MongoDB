package com.smartretail.service;

import com.smartretail.dto.*;
import com.smartretail.entity.*;
import com.smartretail.exception.*;
import com.smartretail.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final InventoryRepository inventoryRepo;
    private final CustomerRepository customerRepo;
    private final StoreRepository storeRepo;
    private final UserRepository userRepo;
    private final StockMovementRepository stockMovementRepo;
    private final SimpMessagingTemplate messagingTemplate;

    private static final AtomicLong invoiceCounter = new AtomicLong(System.currentTimeMillis() % 100000);

    private String generateInvoiceNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String seq  = String.format("%05d", invoiceCounter.incrementAndGet());
        return "INV-" + year + "-" + seq;
    }

    public OrderResponse createOrder(OrderRequest req, String username) {
        storeRepo.findById(req.getStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + req.getStoreId()));
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User: " + username));
        Customer customer = req.getCustomerId() != null
                ? customerRepo.findById(req.getCustomerId()).orElse(null) : null;

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : req.getItems()) {
            Product product = productRepo.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));
            Inventory inventory = inventoryRepo.findByProductId(product.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory for product: " + product.getId()));

            if (inventory.getQuantity() < itemReq.getQuantity())
                throw new BusinessException("Insufficient stock for: " + product.getName()
                        + ". Available: " + inventory.getQuantity());

            BigDecimal qty         = BigDecimal.valueOf(itemReq.getQuantity());
            BigDecimal unitPrice   = product.getSellingPrice();
            BigDecimal itemDisc    = itemReq.getDiscountAmount() != null ? itemReq.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal taxableAmt  = unitPrice.multiply(qty).subtract(itemDisc);
            BigDecimal gstAmt      = taxableAmt.multiply(product.getGstPercentage())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            BigDecimal itemTotal   = taxableAmt.add(gstAmt);
            BigDecimal itemProfit  = product.getSellingPrice().subtract(product.getCostPrice()).multiply(qty);

            subtotal = subtotal.add(unitPrice.multiply(qty));
            totalTax = totalTax.add(gstAmt);

            orderItems.add(OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice).costPrice(product.getCostPrice())
                    .gstPercentage(product.getGstPercentage()).gstAmount(gstAmt)
                    .discountAmount(itemDisc).totalPrice(itemTotal).profit(itemProfit)
                    .build());

            // Deduct stock
            inventory.setQuantity(inventory.getQuantity() - itemReq.getQuantity());
            inventory.setLastUpdated(LocalDateTime.now());
            inventoryRepo.save(inventory);

            // Stock movement log
            stockMovementRepo.save(StockMovement.builder()
                    .productId(product.getId()).storeId(req.getStoreId())
                    .movementType(StockMovement.MovementType.OUT)
                    .quantity(itemReq.getQuantity())
                    .referenceType("ORDER").createdById(user.getId())
                    .createdAt(LocalDateTime.now()).build());
        }

        BigDecimal orderDiscount = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount   = subtotal.subtract(orderDiscount).add(totalTax);
        BigDecimal paidAmount    = req.getPaidAmount() != null ? req.getPaidAmount() : totalAmount;
        BigDecimal dueAmount     = totalAmount.subtract(paidAmount).max(BigDecimal.ZERO);

        Order.PaymentMode payMode = req.getPaymentMode() != null
                ? Order.PaymentMode.valueOf(req.getPaymentMode()) : Order.PaymentMode.CASH;
        Order.OrderStatus status  = dueAmount.compareTo(BigDecimal.ZERO) > 0
                ? Order.OrderStatus.PARTIAL : Order.OrderStatus.COMPLETED;

        Order order = Order.builder()
                .invoiceNumber(generateInvoiceNumber())
                .customerId(customer != null ? customer.getId() : null)
                .storeId(req.getStoreId()).createdById(user.getId())
                .subtotal(subtotal).discountAmount(orderDiscount).taxAmount(totalTax)
                .totalAmount(totalAmount).paidAmount(paidAmount).dueAmount(dueAmount)
                .paymentMode(payMode).status(status).notes(req.getNotes())
                .items(orderItems).orderDate(LocalDateTime.now())
                .build();

        // Loyalty points
        if (customer != null) {
            int pts = totalAmount.divide(new BigDecimal("10"), 0, RoundingMode.DOWN).intValue();
            customer.setLoyaltyPoints(customer.getLoyaltyPoints() + pts);
            customerRepo.save(customer);
        }

        Order saved = orderRepo.save(order);
        messagingTemplate.convertAndSend("/topic/orders",
                Map.of("event", "NEW_ORDER", "invoiceNumber", saved.getInvoiceNumber(), "total", totalAmount));
        return toResponse(saved);
    }

    public List<OrderResponse> getOrdersByStore(String storeId) {
        return orderRepo.findByStoreId(storeId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByDateRange(String storeId, LocalDateTime from, LocalDateTime to) {
        return orderRepo.findByStoreAndDateRange(storeId, from, to).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponse getByInvoiceNumber(String invoiceNumber) {
        return toResponse(orderRepo.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + invoiceNumber)));
    }

    public List<OrderResponse> getByCustomer(String customerId) {
        return orderRepo.findByCustomerId(customerId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getPendingDue(String storeId) {
        return orderRepo.findPendingDueOrders(storeId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public String processReturn(String orderId, String productId, int qty, String reason) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        if (order.getStatus() == Order.OrderStatus.CANCELLED)
            throw new BusinessException("Cannot return from a cancelled order.");

        OrderItem item = order.getItems().stream()
                .filter(i -> i.getProductId().equals(productId)).findFirst()
                .orElseThrow(() -> new BusinessException("Product not found in this order."));

        if (qty > item.getQuantity())
            throw new BusinessException("Return qty exceeds ordered qty.");

        Inventory inv = inventoryRepo.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for product: " + productId));
        inv.setQuantity(inv.getQuantity() + qty);
        inv.setLastUpdated(LocalDateTime.now());
        inventoryRepo.save(inv);

        stockMovementRepo.save(StockMovement.builder()
                .productId(productId).storeId(order.getStoreId())
                .movementType(StockMovement.MovementType.RETURN).quantity(qty)
                .referenceType("RETURN").referenceId(orderId).notes(reason)
                .createdAt(LocalDateTime.now()).build());

        return "Return processed successfully. Stock restored.";
    }

    public OrderResponse toResponse(Order o) {
        // Lookup customer name
        String customerName = "Walk-in";
        if (o.getCustomerId() != null)
            customerName = customerRepo.findById(o.getCustomerId())
                    .map(Customer::getName).orElse("Walk-in");

        // Lookup creator name
        String createdBy = "";
        if (o.getCreatedById() != null)
            createdBy = userRepo.findById(o.getCreatedById())
                    .map(u -> u.getFullName() != null ? u.getFullName() : u.getUsername()).orElse("");

        List<OrderItemResponse> items = o.getItems().stream().map(oi -> {
            String sku = productRepo.findById(oi.getProductId())
                    .map(Product::getSku).orElse(null);
            return OrderItemResponse.builder()
                    .productId(oi.getProductId()).productName(oi.getProductName()).productSku(sku)
                    .quantity(oi.getQuantity()).unitPrice(oi.getUnitPrice())
                    .gstPercentage(oi.getGstPercentage()).gstAmount(oi.getGstAmount())
                    .discountAmount(oi.getDiscountAmount()).totalPrice(oi.getTotalPrice())
                    .profit(oi.getProfit()).build();
        }).collect(Collectors.toList());

        return OrderResponse.builder()
                .id(o.getId()).invoiceNumber(o.getInvoiceNumber())
                .customerName(customerName).customerId(o.getCustomerId())
                .createdBy(createdBy).subtotal(o.getSubtotal())
                .discountAmount(o.getDiscountAmount()).taxAmount(o.getTaxAmount())
                .totalAmount(o.getTotalAmount()).paidAmount(o.getPaidAmount()).dueAmount(o.getDueAmount())
                .paymentMode(o.getPaymentMode().name()).status(o.getStatus().name())
                .items(items).orderDate(o.getOrderDate())
                .build();
    }
}
