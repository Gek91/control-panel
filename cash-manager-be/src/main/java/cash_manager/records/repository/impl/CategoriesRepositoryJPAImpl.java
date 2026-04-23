package cash_manager.records.repository.impl;

import cash_manager.core.commons.persistence.BaseJPARepository;
import cash_manager.records.model.Category;
import cash_manager.records.repository.CategoriesRepository;

import java.util.List;

public class CategoriesRepositoryJPAImpl extends BaseJPARepository<Category> implements CategoriesRepository {

    @Override
    public List<Category> findAll() {
        return entityManager
                .createQuery("SELECT c FROM Category c", Category.class)
                .getResultList();
    }
}
