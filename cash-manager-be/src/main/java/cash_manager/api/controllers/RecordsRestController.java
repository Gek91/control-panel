package cash_manager.api.controllers;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;

import cash_manager.api.controllers.data.CreateRecordEntryDTO;
import cash_manager.api.controllers.data.RecordEntryDTO;
import cash_manager.api.controllers.data.UpdateRecordEntryDTO;
import cash_manager.core.commons.utils.PagedList;

@RestController
public interface RecordsRestController {
    
    @GetMapping(path = "/records", produces = "application/json")
    PagedList<RecordEntryDTO> getRecords(int pageSize, int offset);

    @GetMapping(path = "/records/{id}", produces = "application/json")
    RecordEntryDTO getRecord(@PathVariable String id);

    @PostMapping(path = "/records", consumes = "application/json", produces = "application/json")
    RecordEntryDTO addRecord(@RequestBody CreateRecordEntryDTO record);

    @PutMapping(path = "/records/{id}", consumes = "application/json", produces = "application/json")
    RecordEntryDTO updateRecord(@PathVariable String id, @RequestBody UpdateRecordEntryDTO record);

    @DeleteMapping(path = "/records/{id}")
    void deleteRecord(@PathVariable String id); 

}