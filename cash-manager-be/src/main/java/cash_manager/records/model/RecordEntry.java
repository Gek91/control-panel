package cash_manager.records.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import org.hibernate.annotations.DialectOverride.DiscriminatorFormulas;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Id;


@Getter
@Entity
public class RecordEntry {

    @Id
	@Column
	private String id;
	@Column
	private String description;
	private LocalDate recordDate;
	@Column(name = "`value`")
	private BigDecimal value;
	@Column
	private Instant creationTimestamp;
	@Column
	private Instant lastModificationTimestamp;

	private RecordEntry() {
		// For JPA
	}

	public RecordEntry(String id) {
		this.id = id;

		Instant now = Instant.now();
		this.creationTimestamp = now;
		this.lastModificationTimestamp = now;
	}

	public RecordEntry setRecordDate(LocalDate recordDate) {
		this.recordDate = recordDate;
		this.lastModificationTimestamp = Instant.now();

		return this;
	}

	public RecordEntry setValue(BigDecimal value) {
		this.value = value;
		this.lastModificationTimestamp = Instant.now();

		return this;
	}
	
	public RecordEntry setDescription(String description) {
		this.description = description;
		this.lastModificationTimestamp = Instant.now();

		return this;
	}

}