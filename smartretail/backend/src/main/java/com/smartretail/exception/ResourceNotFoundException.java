package com.smartretail.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String msg) { super(msg); }
    public ResourceNotFoundException(String entity, String id) {
        super(entity + " not found with id: " + id);
    }
    // Keep Long overload for backward compat (not used in MongoDB version)
    public ResourceNotFoundException(String entity, Long id) {
        super(entity + " not found with id: " + id);
    }
}
