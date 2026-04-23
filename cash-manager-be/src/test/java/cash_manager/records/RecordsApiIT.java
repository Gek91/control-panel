package cash_manager.records;

import cash_manager.TestcontainersConfiguration;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.Sql.ExecutionPhase;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Sql(
        scripts = {"/schema.sql", "/schema-postgres.sql", "/data.sql"},
        executionPhase = ExecutionPhase.BEFORE_TEST_METHOD
)
class RecordsApiIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /records/{id} returns the seeded record (with its categoryId)")
    void getReturnsSeededRecord() throws Exception {
        mockMvc.perform(get("/records/seed-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("seed-1"))
                .andExpect(jsonPath("$.description").value("seed groceries"))
                .andExpect(jsonPath("$.amount").value(25.00))
                .andExpect(jsonPath("$.categoryId").value("seed-cat-food-groceries"));
    }

    @Test
    @DisplayName("GET /records/{id} exposes a null categoryId when the record has no category")
    void getReturnsNullCategoryWhenAbsent() throws Exception {
        mockMvc.perform(get("/records/seed-3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryId").value(nullValue()));
    }

    @Test
    @DisplayName("GET /records lists exactly the seeded records")
    void listReturnsSeededRecords() throws Exception {
        mockMvc.perform(get("/records")
                        .param("pageSize", "100")
                        .param("offset", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(3))
                .andExpect(jsonPath("$.items.length()").value(3));
    }

    @Test
    @DisplayName("GET /records/{id} returns 404 when the id is unknown")
    void getUnknownIdReturns404() throws Exception {
        mockMvc.perform(get("/records/this-id-does-not-exist"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /records creates a new record (and the list grows by one)")
    void postCreatesRecord() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "description", "lunch",
                "amount", new BigDecimal("9.50"),
                "recordDate", LocalDate.now().minusDays(1).toString()
        ));

        mockMvc.perform(post("/records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.description").value("lunch"))
                .andExpect(jsonPath("$.amount").value(9.50))
                .andExpect(jsonPath("$.creationTimestamp", notNullValue()))
                .andExpect(jsonPath("$.lastModificationTimestamp", notNullValue()));

        mockMvc.perform(get("/records").param("pageSize", "100").param("offset", "0"))
                .andExpect(jsonPath("$.totalItems").value(4));
    }

    @Test
    @DisplayName("PUT /records/{id} updates an existing seeded record")
    void putUpdatesSeededRecord() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "description", "seed groceries (updated)",
                "amount", new BigDecimal("99.00"),
                "recordDate", LocalDate.now().toString()
        ));

        mockMvc.perform(put("/records/seed-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("seed-1"))
                .andExpect(jsonPath("$.description").value("seed groceries (updated)"))
                .andExpect(jsonPath("$.amount").value(99.00));

        mockMvc.perform(get("/records/seed-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("seed groceries (updated)"));
    }

    @Test
    @DisplayName("POST /records accepts a valid categoryId and persists it")
    void postWithValidCategoryIdPersistsIt() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "description", "fuel",
                "amount", new BigDecimal("50.00"),
                "recordDate", LocalDate.now().minusDays(1).toString(),
                "categoryId", "seed-cat-transport"
        ));

        mockMvc.perform(post("/records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryId").value("seed-cat-transport"));
    }

    @Test
    @DisplayName("POST /records returns 400 when the categoryId does not exist")
    void postWithUnknownCategoryIdReturns400() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "description", "x",
                "amount", new BigDecimal("1.00"),
                "recordDate", LocalDate.now().toString(),
                "categoryId", "does-not-exist"
        ));

        mockMvc.perform(post("/records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /records/{id} returns 404 when the id is unknown")
    void putUnknownIdReturns404() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "description", "x",
                "amount", new BigDecimal("1.00"),
                "recordDate", LocalDate.now().toString()
        ));

        mockMvc.perform(put("/records/missing")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /records/{id} removes a seeded record (subsequent GET returns 404)")
    void deleteRemovesSeededRecord() throws Exception {
        mockMvc.perform(delete("/records/seed-2"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/records/seed-2"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/records").param("pageSize", "100").param("offset", "0"))
                .andExpect(jsonPath("$.totalItems").value(2));
    }

    @Test
    @DisplayName("each test starts with a clean DB: previous mutations do not leak")
    void databaseIsResetBetweenTests() throws Exception {
        mockMvc.perform(get("/records").param("pageSize", "100").param("offset", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(3));

        mockMvc.perform(get("/records/seed-2"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /records/{id} returns 404 when the id is unknown")
    void deleteUnknownIdReturns404() throws Exception {
        mockMvc.perform(delete("/records/missing"))
                .andExpect(status().isNotFound());
    }
}
