package cash_manager.api.controllers.data;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class CreateRecordEntryDTO {
    private String description;
	private LocalDate recordDate;
	private BigDecimal value;
}
