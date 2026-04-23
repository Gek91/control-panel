package cash_manager.records.service.impl;

import cash_manager.core.commons.utils.PagedList;
import cash_manager.records.model.RecordEntry;
import cash_manager.records.repository.CategoriesRepository;
import cash_manager.records.repository.RecordsRepository;
import cash_manager.records.repository.impl.CategoriesRepositoryJPAImpl;
import cash_manager.records.repository.impl.RecordsRepositoryJPAImpl;
import cash_manager.records.service.CategoriesApplicationService;
import cash_manager.records.service.RecordsApplicationService;
import cash_manager.records.service.data.CreateRecordData;
import cash_manager.records.service.data.UpdateRecordData;
import jakarta.persistence.EntityNotFoundException;
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

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;


@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:records_unit_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password="
})
@Import(RecordsApplicationServiceImplTest.Config.class)
@Sql(
        scripts = {"/schema.sql", "/data.sql"},
        executionPhase = ExecutionPhase.BEFORE_TEST_METHOD,
        config = @SqlConfig(transactionMode = TransactionMode.ISOLATED)
)
class RecordsApplicationServiceImplTest {

    @TestConfiguration
    static class Config {

        @Bean
        RecordsRepository recordsRepository() {
            return new RecordsRepositoryJPAImpl();
        }

        @Bean
        CategoriesRepository categoriesRepository() {
            return new CategoriesRepositoryJPAImpl();
        }

        @Bean
        CategoriesApplicationService categoriesApplicationService(CategoriesRepository repository) {
            return new CategoriesApplicationServiceImpl(repository);
        }

        @Bean
        RecordsApplicationService recordsApplicationService(RecordsRepository repository,
                                                            CategoriesApplicationService categoriesService) {
            return new RecordsApplicationServiceImpl(repository, categoriesService);
        }
    }

    @Autowired
    private RecordsApplicationService service;

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("returns the seeded record with all fields populated")
        void returnsSeededRecord() {
            RecordEntry result = service.findById("seed-1");

            assertThat(result.getId()).isEqualTo("seed-1");
            assertThat(result.getDescription()).isEqualTo("seed groceries");
            assertThat(result.getAmount()).isEqualByComparingTo("25.00");
            assertThat(result.getRecordDate()).isEqualTo(LocalDate.of(2024, 1, 1));
            assertThat(result.getCreationTimestamp()).isNotNull();
            assertThat(result.getLastModificationTimestamp()).isNotNull();
        }

        @Test
        @DisplayName("throws EntityNotFoundException when the id is unknown")
        void throwsWhenMissing() {
            assertThatThrownBy(() -> service.findById("missing"))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("missing");
        }
    }

    @Nested
    @DisplayName("getPagedList")
    class GetPagedList {

        @Test
        @DisplayName("returns the seeded records (3) when pageSize is large enough")
        void returnsSeededRecords() {
            PagedList<RecordEntry> result = service.getPagedList(100, 0);

            assertThat(result.getTotalItems()).isEqualTo(3L);
            assertThat(result.getItems()).hasSize(3);
            assertThat(result.getItems())
                    .extracting(RecordEntry::getId)
                    .containsExactlyInAnyOrder("seed-1", "seed-2", "seed-3");
        }

        @Test
        @DisplayName("falls back to pageSize=10 when pageSize <= 0")
        void defaultsPageSizeWhenNonPositive() {
            PagedList<RecordEntry> withZero = service.getPagedList(0, 0);
            PagedList<RecordEntry> withNegative = service.getPagedList(-5, 0);

            assertThat(withZero.getItems()).hasSize(3);
            assertThat(withNegative.getItems()).hasSize(3);
            assertThat(withZero.getTotalItems()).isEqualTo(3L);
        }

        @Test
        @DisplayName("falls back to offset=0 when offset is negative")
        void defaultsOffsetWhenNegative() {
            PagedList<RecordEntry> result = service.getPagedList(100, -5);

            assertThat(result.getItems()).hasSize(3);
        }

        @Test
        @DisplayName("respects pageSize and offset (pages of 2 over 3 records)")
        void respectsPagination() {
            PagedList<RecordEntry> firstPage = service.getPagedList(2, 0);
            PagedList<RecordEntry> secondPage = service.getPagedList(2, 2);

            assertThat(firstPage.getItems()).hasSize(2);
            assertThat(secondPage.getItems()).hasSize(1);
            assertThat(firstPage.getTotalItems()).isEqualTo(3L);
            assertThat(secondPage.getTotalItems()).isEqualTo(3L);

            assertThat(firstPage.getItems())
                    .extracting(RecordEntry::getId)
                    .doesNotContainAnyElementsOf(
                            secondPage.getItems().stream().map(RecordEntry::getId).toList()
                    );
        }

        @Test
        @DisplayName("returns empty items when offset is beyond totalItems (count is still correct)")
        void emptyWhenOffsetTooLarge() {
            PagedList<RecordEntry> result = service.getPagedList(10, 100);

            assertThat(result.getTotalItems()).isEqualTo(3L);
            assertThat(result.getItems()).isEmpty();
        }
    }

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("persists a new record and returns it (re-readable via findById)")
        void persistsAndReturnsRecord() {
            CreateRecordData data = new CreateRecordData();
            data.setDescription("groceries");
            data.setAmount(new BigDecimal("12.34"));
            data.setRecordDate(LocalDate.of(2024, 1, 15));

            RecordEntry created = service.create(data);

            assertThat(created.getId()).isNotBlank();
            assertThat(created.getCreationTimestamp()).isNotNull();
            assertThat(created.getLastModificationTimestamp()).isNotNull();

            RecordEntry reloaded = service.findById(created.getId());
            assertThat(reloaded.getDescription()).isEqualTo("groceries");
            assertThat(reloaded.getAmount()).isEqualByComparingTo("12.34");
            assertThat(reloaded.getRecordDate()).isEqualTo(LocalDate.of(2024, 1, 15));
            assertThat(reloaded.getCategory()).isNull();
        }

        @Test
        @DisplayName("persists categoryId when it points to an existing category")
        void persistsValidCategoryId() {
            CreateRecordData data = new CreateRecordData();
            data.setDescription("lunch");
            data.setAmount(new BigDecimal("10.00"));
            data.setRecordDate(LocalDate.of(2024, 1, 20));
            data.setCategoryId("seed-cat-food-restaurants");

            RecordEntry created = service.create(data);

            assertThat(service.findById(created.getId()).getCategory())
                    .isNotNull()
                    .extracting("id")
                    .isEqualTo("seed-cat-food-restaurants");
        }

        @Test
        @DisplayName("rejects a categoryId that does not exist")
        void rejectsUnknownCategoryId() {
            CreateRecordData data = new CreateRecordData();
            data.setDescription("x");
            data.setAmount(new BigDecimal("1.00"));
            data.setRecordDate(LocalDate.now());
            data.setCategoryId("does-not-exist");

            assertThatThrownBy(() -> service.create(data))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("does-not-exist");
        }

        @Test
        @DisplayName("totalItems grows by one")
        void totalItemsGrows() {
            CreateRecordData data = new CreateRecordData();
            data.setDescription("x");
            data.setAmount(new BigDecimal("1.00"));
            data.setRecordDate(LocalDate.now());

            service.create(data);

            assertThat(service.getPagedList(100, 0).getTotalItems()).isEqualTo(4L);
        }

        @Test
        @DisplayName("two consecutive creates yield two different ids")
        void generatesDifferentIds() {
            CreateRecordData data = new CreateRecordData();
            data.setDescription("x");
            data.setAmount(new BigDecimal("1.00"));
            data.setRecordDate(LocalDate.now());

            RecordEntry first = service.create(data);
            RecordEntry second = service.create(data);

            assertThat(first.getId()).isNotEqualTo(second.getId());
        }
    }

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        @DisplayName("mutates the seeded record (verifiable via fresh findById)")
        void updatesSeededRecord() {
            UpdateRecordData data = new UpdateRecordData();
            data.setDescription("updated description");
            data.setAmount(new BigDecimal("99.99"));
            data.setRecordDate(LocalDate.of(2024, 2, 20));
            data.setCategoryId("seed-cat-transport");

            RecordEntry returned = service.update("seed-1", data);

            assertThat(returned.getDescription()).isEqualTo("updated description");
            assertThat(returned.getAmount()).isEqualByComparingTo("99.99");
            assertThat(returned.getCategory()).isNotNull()
                    .extracting("id").isEqualTo("seed-cat-transport");

            RecordEntry reloaded = service.findById("seed-1");
            assertThat(reloaded.getDescription()).isEqualTo("updated description");
            assertThat(reloaded.getAmount()).isEqualByComparingTo("99.99");
            assertThat(reloaded.getRecordDate()).isEqualTo(LocalDate.of(2024, 2, 20));
            assertThat(reloaded.getCategory()).isNotNull()
                    .extracting("id").isEqualTo("seed-cat-transport");
        }

        @Test
        @DisplayName("can clear the categoryId by passing null")
        void canClearCategoryId() {
            UpdateRecordData data = new UpdateRecordData();
            data.setDescription("x");
            data.setAmount(new BigDecimal("1.00"));
            data.setRecordDate(LocalDate.now());
            data.setCategoryId(null);

            service.update("seed-1", data);

            assertThat(service.findById("seed-1").getCategory()).isNull();
        }

        @Test
        @DisplayName("rejects a categoryId that does not exist")
        void rejectsUnknownCategoryId() {
            UpdateRecordData data = new UpdateRecordData();
            data.setDescription("x");
            data.setAmount(new BigDecimal("1.00"));
            data.setRecordDate(LocalDate.now());
            data.setCategoryId("does-not-exist");

            assertThatThrownBy(() -> service.update("seed-1", data))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("does-not-exist");
        }

        @Test
        @DisplayName("throws EntityNotFoundException when the id is unknown")
        void throwsWhenMissing() {
            UpdateRecordData data = new UpdateRecordData();
            data.setDescription("x");
            data.setAmount(new BigDecimal("1.00"));
            data.setRecordDate(LocalDate.now());

            assertThatThrownBy(() -> service.update("missing", data))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        @DisplayName("removes the seeded record (subsequent findById throws)")
        void removesSeededRecord() {
            service.delete("seed-1");

            assertThatThrownBy(() -> service.findById("seed-1"))
                    .isInstanceOf(EntityNotFoundException.class);

            assertThat(service.getPagedList(100, 0).getTotalItems()).isEqualTo(2L);
        }

        @Test
        @DisplayName("throws EntityNotFoundException when the id is unknown")
        void throwsWhenMissing() {
            assertThatThrownBy(() -> service.delete("missing"))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Test
    @DisplayName("each test starts with a clean DB: previous mutations do not leak")
    void databaseIsResetBetweenTests() {
        assertThat(service.getPagedList(100, 0).getTotalItems()).isEqualTo(3L);
        assertThat(service.findById("seed-1")).isNotNull();
    }
}
