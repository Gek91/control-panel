package cash_manager.records.repository;

import cash_manager.records.model.RecordEntry;
import java.util.Optional;
import cash_manager.core.commons.utils.PagedList;

public interface RecordsRepository {
    
    PagedList<RecordEntry> getPagedList(int pageSize, int offset);

    Optional<RecordEntry> findById(String id);

    void add(RecordEntry record);

    void remove(RecordEntry record);
}
