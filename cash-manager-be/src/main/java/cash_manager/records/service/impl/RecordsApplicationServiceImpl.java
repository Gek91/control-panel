package cash_manager.records.service.impl;

import java.util.Optional;


import cash_manager.core.commons.utils.PagedList;
import cash_manager.records.model.RecordEntry;
import cash_manager.records.repository.RecordsRepository;
import cash_manager.records.service.RecordsApplicationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import cash_manager.records.service.data.CreateRecordData;
import cash_manager.records.service.data.UpdateRecordData;
import java.util.UUID;

@Transactional
public class RecordsApplicationServiceImpl implements RecordsApplicationService{

    private final RecordsRepository recordRepository;

    public RecordsApplicationServiceImpl(RecordsRepository recordRepository) {
        this.recordRepository = recordRepository;
    }   

    @Override
    public RecordEntry findById(String id) {

        Optional<RecordEntry> recordOptional = recordRepository.findById(id);

        if(recordOptional.isEmpty()) {
            throw new EntityNotFoundException("Record with id " + id + " not found.");
        }

        return recordOptional.get();
    }

    @Override
    public PagedList<RecordEntry> getPagedList(int pageSize, int offset) {
        
        return recordRepository.getPagedList(pageSize, offset);
    }

    @Override
    public RecordEntry create(CreateRecordData data) {
        
        String uuid = UUID.randomUUID().toString();
        RecordEntry record = new RecordEntry(uuid);

        record.setDescription(data.getDescription());
        record.setRecordDate(data.getRecordDate());
        record.setValue(data.getValue());

        recordRepository.add(record);

        return record;
    }

    @Override
    public RecordEntry update(String id, UpdateRecordData data) {
        
        RecordEntry record = this.findById(id);
        
        record.setDescription(data.getDescription());
        record.setRecordDate(data.getRecordDate());
        record.setValue(data.getValue());

        return record;
    }

    @Override
    public void delete(String id) {
        recordRepository.remove(this.findById(id));
    }
    
}
