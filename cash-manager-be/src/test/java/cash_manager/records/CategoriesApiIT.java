package cash_manager.records;

import cash_manager.TestcontainersConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.Sql.ExecutionPhase;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.empty;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Sql(
        scripts = {"/schema.sql", "/data.sql"},
        executionPhase = ExecutionPhase.BEFORE_TEST_METHOD
)
class CategoriesApiIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /categories returns top-level categories sorted by name")
    void listReturnsTopLevelCategoriesSorted() throws Exception {
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[*].name", contains("Food", "Other", "Transport")));
    }

    @Test
    @DisplayName("GET /categories nests subcategories under their parent")
    void listNestsSubcategoriesUnderParent() throws Exception {
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("seed-cat-food"))
                .andExpect(jsonPath("$[0].name").value("Food"))
                .andExpect(jsonPath("$[0].children.length()").value(2))
                .andExpect(jsonPath("$[0].children[*].name", containsInAnyOrder("Groceries", "Restaurants")));
    }

    @Test
    @DisplayName("GET /categories returns an empty children array for leaf top-level categories")
    void leafTopLevelHasEmptyChildren() throws Exception {
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='seed-cat-other')].children[0]", empty()));
    }

    @Test
    @DisplayName("GET /categories exposes color and icon when present on the category")
    void exposesPresentationFields() throws Exception {
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='seed-cat-food')].color[0]").value("#E67E22"))
                .andExpect(jsonPath("$[?(@.id=='seed-cat-food')].icon[0]").value("utensils"));
    }
}
