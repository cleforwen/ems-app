package com.ems.auth.dto;

import jakarta.validation.constraints.NotNull;

public record ExchangeTokenRequest(
        @NotNull(message = "Hospital ID is required") Long hospitalId) {
}
