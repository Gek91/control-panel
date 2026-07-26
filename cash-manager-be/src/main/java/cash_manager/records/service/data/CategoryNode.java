package cash_manager.records.service.data;

import java.util.Collections;
import java.util.List;

import cash_manager.records.model.Category;

/**
 * Hierarchical view of a {@link Category}: a top-level category plus its
 * direct children. This is a transient aggregate built by the service from
 * flat {@link Category} rows; it is not persisted.
 */
public record CategoryNode(
        String id,
        String name,
        String color,
        String icon,
        List<CategoryNode> children
) {

    public CategoryNode {
        children = children == null ? List.of() : Collections.unmodifiableList(children);
    }

    public static CategoryNode leaf(Category category) {
        return new CategoryNode(category.getId(), category.getName(), category.getColor(), category.getIcon(), List.of());
    }

    public static CategoryNode withChildren(Category category, List<CategoryNode> children) {
        return new CategoryNode(category.getId(), category.getName(), category.getColor(), category.getIcon(), children);
    }
}
