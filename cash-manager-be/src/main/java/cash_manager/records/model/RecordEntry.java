package cash_manager.records.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;

@Getter
@Entity
public class RecordEntry {

    @Id
	@Column
	private String id;
    @Column(nullable = false)
	private String description;
    @Column(name = "record_date", nullable = false)
	private LocalDate recordDate;
	@Column(name = "amount")
	private BigDecimal amount;
	@ManyToOne
	@JoinColumn(name = "category_id")
	private Category category;
    @Column(name = "creation_timestamp", nullable = false, updatable = false)
	private Instant creationTimestamp;
    @Column(name = "last_modification_timestamp", nullable = false)
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

	public RecordEntry update(String description, LocalDate recordDate, BigDecimal amount, Category category) {
		this.description = description;
		this.recordDate = recordDate;
		this.amount = amount;
		this.category = category;
		this.lastModificationTimestamp = Instant.now();
		return this;
	}
}