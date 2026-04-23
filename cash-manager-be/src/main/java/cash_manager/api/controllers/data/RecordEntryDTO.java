package cash_manager.api.controllers.data;

import java.time.Instant;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class RecordEntryDTO extends CreateRecordEntryDTO {
    private String id;
	private Instant creationTimestamp;
	private Instant lastModificationTimestamp;
}
