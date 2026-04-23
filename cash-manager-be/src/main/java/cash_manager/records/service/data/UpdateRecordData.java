package cash_manager.records.service.data;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Digits;
import lombok.Data;

@Data
public class UpdateRecordData {
    @NotNull
    @NotBlank
    @Size(max = 255)
    private String description;
    @NotNull @Digits(integer = 17, fraction = 2)
    private BigDecimal amount;
    @NotNull @PastOrPresent
	private LocalDate recordDate;
    private String categoryId;
}
