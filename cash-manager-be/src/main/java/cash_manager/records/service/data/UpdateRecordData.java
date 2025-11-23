package cash_manager.records.service.data;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateRecordData {
    @NotNull
    @NotBlank
    @Size(max = 255)
    private String description;
    @NotNull
    private BigDecimal value;
    @NotNull
	private LocalDate recordDate;
}
