package cash_manager.records.service.impl;

import java.util.Optional;
import java.util.UUID;

import cash_manager.core.commons.utils.PagedList;
import cash_manager.records.model.Category;
import cash_manager.records.model.RecordEntry;
import cash_manager.records.repository.RecordsRepository;
import cash_manager.records.service.CategoriesApplicationService;
import cash_manager.records.service.RecordsApplicationService;
import cash_manager.records.service.data.CreateRecordData;
import cash_manager.records.service.data.UpdateRecordData;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public class RecordsApplicationServiceImpl implements RecordsApplicationService{

    private static final Logger log = LoggerFactory.getLogger(RecordsApplicationServiceImpl.class);

    private final RecordsRepository recordRepository;
    private final CategoriesApplicationService categoriesService;

    public RecordsApplicationServiceImpl(RecordsRepository recordRepository,
                                         CategoriesApplicationService categoriesService) {
        this.recordRepository = recordRepository;
        this.categoriesService = categoriesService;
    }

    @Transactional(readOnly = true)
    @Override
    public RecordEntry findById(String id) {

        log.debug("findById id={}", id);

        Optional<RecordEntry> recordOptional = recordRepository.findById(id);

        if(recordOptional.isEmpty()) {
            throw new EntityNotFoundException("Record with id " + id + " not found.");
        }

        return recordOptional.get();
    }

    @Transactional(readOnly = true)
    @Override
    public PagedList<RecordEntry> getPagedList(int pageSize, int offset) {

        if(pageSize <= 0) {
            pageSize = 10;
        }

        if(offset < 0) {
            offset = 0;
        }

        log.debug("getPagedList (pageSize={}, offset={})", pageSize, offset);

        return recordRepository.getPagedList(pageSize, offset);
    }

    @Override
    public RecordEntry create(CreateRecordData data) {

        Category category = resolveCategory(data.getCategoryId());

        String uuid = UUID.randomUUID().toString();
        RecordEntry record = new RecordEntry(uuid);

        record.update(data.getDescription(), data.getRecordDate(), data.getAmount(), category);

        recordRepository.add(record);

        log.info("create id={} amount={} date={} categoryId={}", uuid, data.getAmount(), data.getRecordDate(), data.getCategoryId());

        return record;
    }

    @Override
    public RecordEntry update(String id, UpdateRecordData data) {

        Category category = resolveCategory(data.getCategoryId());

        RecordEntry record = this.findById(id);

        record.update(data.getDescription(), data.getRecordDate(), data.getAmount(), category);

        log.info("update id={} amount={} date={} categoryId={}", id, data.getAmount(), data.getRecordDate(), data.getCategoryId());

        return record;
    }

    @Override
    public void delete(String id) {
        recordRepository.remove(this.findById(id));
        log.info("delete id={}", id);
    }

    private Category resolveCategory(String categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoriesService.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown categoryId: " + categoryId));
    }
}
