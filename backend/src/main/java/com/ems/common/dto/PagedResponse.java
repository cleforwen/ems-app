package com.ems.common.dto;

import java.util.List;

public record PagedResponse<T>(
    List<T> data,
    long total,
    int page,
    int size,
    int totalPages
) {
    public static <T> PagedResponse<T> of(List<T> data, long total, int page, int size) {
        int totalPages = size > 0 ? (int) Math.ceil((double) total / size) : 0;
        return new PagedResponse<>(data, total, page, size, totalPages);
    }
}
