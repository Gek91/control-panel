package cash_manager.records.service.impl;

import cash_manager.records.model.Category;
import cash_manager.records.repository.CategoriesRepository;
import cash_manager.records.service.CategoriesApplicationService;
import cash_manager.records.service.data.CategoryNode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Transactional(readOnly = true)
public class CategoriesApplicationServiceImpl implements CategoriesApplicationService {

    private static final Logger log = LoggerFactory.getLogger(CategoriesApplicationServiceImpl.class);

    private final CategoriesRepository categoriesRepository;

    public CategoriesApplicationServiceImpl(CategoriesRepository categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }

    @Override
    public List<CategoryNode> findAll() {
        List<Category> all = categoriesRepository.findAll();

        Map<String, List<Category>> byParentId = all.stream()
                .filter(c -> c.getParentId() != null)
                .collect(Collectors.groupingBy(Category::getParentId));

        List<CategoryNode> tree = all.stream()
                .filter(Category::isTopLevel)
                .sorted(Comparator.comparing(Category::getName))
                .map(top -> CategoryNode.withChildren(
                        top,
                        byParentId.getOrDefault(top.getId(), List.of()).stream()
                                .sorted(Comparator.comparing(Category::getName))
                                .map(CategoryNode::leaf)
                                .toList()))
                .toList();

        log.debug("getCategoryTree: {} top-level categories, {} total", tree.size(), all.size());
        return tree;
    }

    @Override
    public Optional<Category> findById(String id) {
        return categoriesRepository.findAll().stream()
                .filter(c -> c.getId().equals(id))
                .findFirst();
    }
            
}
