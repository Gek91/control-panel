package cash_manager.api.controllers;

import cash_manager.api.controllers.data.CategoryDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public interface CategoriesRestController {

    @GetMapping(path = "/categories", produces = "application/json")
    List<CategoryDTO> getCategoryTree();
}
