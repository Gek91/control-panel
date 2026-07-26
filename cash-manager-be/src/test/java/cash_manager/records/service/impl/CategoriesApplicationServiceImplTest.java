package cash_manager.records.service.impl;

import cash_manager.records.model.Category;
import cash_manager.records.repository.CategoriesRepository;
import cash_manager.records.repository.impl.CategoriesRepositoryJPAImpl;
import cash_manager.records.service.CategoriesApplicationService;
import cash_manager.records.service.data.CategoryNode;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.Sql.ExecutionPhase;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.context.jdbc.SqlConfig.TransactionMode;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:categories_unit_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password="
})
@Import(CategoriesApplicationServiceImplTest.Config.class)
@Sql(
        scripts = {"/schema.sql", "/data.sql"},
        executionPhase = ExecutionPhase.BEFORE_TEST_METHOD,
        config = @SqlConfig(transactionMode = TransactionMode.ISOLATED)
)
class CategoriesApplicationServiceImplTest {

    @TestConfiguration
    static class Config {

        @Bean
        CategoriesRepository categoriesRepository() {
            return new CategoriesRepositoryJPAImpl();
        }

        @Bean
        CategoriesApplicationService categoriesApplicationService(CategoriesRepository repo) {
            return new CategoriesApplicationServiceImpl(repo);
        }
    }

    @Autowired
    private CategoriesApplicationService service;

    @Nested
    @DisplayName("findAll")
    class FindAllTree {

        @Test
        @DisplayName("returns only top-level categories at the root, sorted by name")
        void rootContainsOnlyTopLevel() {
            List<CategoryNode> tree = service.findAll();

            assertThat(tree)
                    .extracting(CategoryNode::name)
                    .containsExactly("Food", "Other", "Transport");
        }

        @Test
        @DisplayName("nests Food's subcategories under Food, sorted by name")
        void nestsSubcategoriesUnderParent() {
            List<CategoryNode> tree = service.findAll();

            CategoryNode food = tree.stream()
                    .filter(n -> n.id().equals("seed-cat-food"))
                    .findFirst()
                    .orElseThrow();

            assertThat(food.children())
                    .extracting(CategoryNode::name)
                    .containsExactly("Groceries", "Restaurants");
        }

        @Test
        @DisplayName("top-level categories without children expose an empty children list (never null)")
        void leafTopLevelHasEmptyChildren() {
            List<CategoryNode> tree = service.findAll();

            CategoryNode other = tree.stream()
                    .filter(n -> n.id().equals("seed-cat-other"))
                    .findFirst()
                    .orElseThrow();

            assertThat(other.children()).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("returns the seeded top-level category")
        void returnsSeededTopLevel() {
            Optional<Category> found = service.findById("seed-cat-food");

            assertThat(found).isPresent();
            assertThat(found.get().getId()).isEqualTo("seed-cat-food");
            assertThat(found.get().getName()).isEqualTo("Food");
            assertThat(found.get().getParentId()).isNull();
        }

        @Test
        @DisplayName("returns the seeded subcategory with its parentId populated")
        void returnsSeededSubcategory() {
            Optional<Category> found = service.findById("seed-cat-food-groceries");

            assertThat(found).isPresent();
            assertThat(found.get().getId()).isEqualTo("seed-cat-food-groceries");
            assertThat(found.get().getParentId()).isEqualTo("seed-cat-food");
        }

        @Test
        @DisplayName("returns empty when the id is unknown")
        void emptyWhenMissing() {
            assertThat(service.findById("does-not-exist")).isEmpty();
        }

        @Test
        @DisplayName("returns empty when the id is null (defensive)")
        void emptyWhenNull() {
            assertThat(service.findById(null)).isEmpty();
        }
    }
}
