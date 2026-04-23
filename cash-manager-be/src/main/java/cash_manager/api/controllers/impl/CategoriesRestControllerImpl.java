package cash_manager.api.controllers.impl;

import cash_manager.api.controllers.CategoriesRestController;
import cash_manager.api.controllers.data.CategoryDTO;
import cash_manager.records.service.CategoriesApplicationService;
import cash_manager.records.service.data.CategoryNode;

import java.util.List;

import cash_manager.core.service.MapperService;

public class CategoriesRestControllerImpl implements CategoriesRestController {

    private final CategoriesApplicationService categoriesService;
    private final MapperService mapperService;

    public CategoriesRestControllerImpl(CategoriesApplicationService categoriesService, MapperService mapperService) {
        this.categoriesService = categoriesService;
        this.mapperService = mapperService;
    }

    @Override
    public List<CategoryDTO> getCategoryTree() {
        List<CategoryNode> categories = categoriesService.findAll();

        return this.mapperService.mapAll(
            categories,
            CategoryDTO.class
        );
    }
}
