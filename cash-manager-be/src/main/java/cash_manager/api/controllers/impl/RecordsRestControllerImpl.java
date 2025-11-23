package cash_manager.api.controllers.impl;

import cash_manager.api.controllers.RecordsRestController;
import cash_manager.api.controllers.data.CreateRecordEntryDTO;
import cash_manager.api.controllers.data.RecordEntryDTO;
import cash_manager.api.controllers.data.UpdateRecordEntryDTO;
import cash_manager.core.commons.utils.PagedList;
import cash_manager.core.service.MapperService;
import cash_manager.records.service.RecordsApplicationService;
import cash_manager.records.model.RecordEntry;

public class RecordsRestControllerImpl implements RecordsRestController {

    private final RecordsApplicationService recordApplicationService;
    private final MapperService mapperService;

    public RecordsRestControllerImpl(
        RecordsApplicationService recordApplicationService,
                    MapperService mapperService
) {
        this.recordApplicationService = recordApplicationService;
        this.mapperService = mapperService;
    }


    @Override
    public PagedList<RecordEntryDTO> getRecords(int pageSize, int offset) {
        
        PagedList<RecordEntry> entries = this.recordApplicationService.getPagedList(pageSize, offset);

        return this.mapperService.mapPagedList(
            entries,
            RecordEntryDTO.class
        );
    }

    @Override
    public RecordEntryDTO getRecord(String id) {

       RecordEntry record = this.recordApplicationService.findById(id);

       return this.mapperService.map(
            record,
            RecordEntryDTO.class
        );
    }

    @Override
    public RecordEntryDTO addRecord(CreateRecordEntryDTO input) {
        
        RecordEntry record = this.recordApplicationService.create(
            this.mapperService.map(input, cash_manager.records.service.data.CreateRecordData.class)
        );

        return this.mapperService.map(
            record,
            RecordEntryDTO.class
        );
    }

    @Override
    public RecordEntryDTO updateRecord(String id, UpdateRecordEntryDTO record) {
        
        RecordEntry updatedRecord = this.recordApplicationService.update(
            id,
            this.mapperService.map(record, cash_manager.records.service.data.UpdateRecordData.class)
        );

        return this.mapperService.map(
            updatedRecord,
            RecordEntryDTO.class
        );
    }

    @Override
    public void deleteRecord(String id) {
        
        this.recordApplicationService.delete(id);
    }
    
}
