package cash_manager.records.repository;

import cash_manager.records.model.Category;

import java.util.List;

public interface CategoriesRepository {

    List<Category> findAll();
}
