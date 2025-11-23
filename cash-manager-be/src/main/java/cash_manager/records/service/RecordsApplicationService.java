package cash_manager.records.service;

import cash_manager.core.commons.utils.PagedList;
import cash_manager.records.model.RecordEntry;
import cash_manager.records.service.data.UpdateRecordData;
import cash_manager.records.service.data.CreateRecordData;

public interface RecordsApplicationService {
    
    RecordEntry findById(String id);

    PagedList<RecordEntry> getPagedList(int pageSize, int offset);

    RecordEntry create(CreateRecordData data);

    RecordEntry update(String id, UpdateRecordData data);

    void delete(String id);
}
