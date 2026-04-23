package cash_manager.records.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;


@Getter
@Entity
public class Category {

    @Id
    @Column
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "parent_id")
    private String parentId;

    @Column
    private String color;

    @Column
    private String icon;

    protected Category() {
        // For JPA
    }

    public boolean isTopLevel() {
        return this.parentId == null;
    }
}
