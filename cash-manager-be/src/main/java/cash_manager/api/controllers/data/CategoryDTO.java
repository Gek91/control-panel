package cash_manager.api.controllers.data;

import lombok.Data;

import java.util.List;

@Data
public class CategoryDTO {
    private String id;
    private String name;
    private String color;
    private String icon;
    private List<CategoryDTO> children;
}
