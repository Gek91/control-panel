package cash_manager.records.service;

import cash_manager.records.service.data.CategoryNode;

import java.util.List;
import java.util.Optional;

import cash_manager.records.model.Category;

public interface CategoriesApplicationService {

    List<CategoryNode> findAll();

    Optional<Category> findById(String id);
}
