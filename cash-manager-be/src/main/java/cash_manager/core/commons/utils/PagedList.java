package cash_manager.core.commons.utils;

import lombok.Getter;
import java.util.List;

@Getter
public class PagedList<T> {
    private final List<T> items;
    private final long totalItems;

    public PagedList(List<T> items, long totalItems) {
        this.items = items;
        this.totalItems = totalItems;
    }
}