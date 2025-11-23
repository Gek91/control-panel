package cash_manager.records.repository.impl;

import java.util.Map;
import java.util.Optional;

import cash_manager.core.commons.persistence.BaseJPARepository;
import cash_manager.core.commons.utils.PagedList;
import cash_manager.records.model.RecordEntry;
import cash_manager.records.repository.RecordsRepository;
import jakarta.persistence.TypedQuery;

public class RecordsRepositoryJPAImpl extends BaseJPARepository<RecordEntry> implements RecordsRepository {

    @Override
    public PagedList<RecordEntry> getPagedList(int pageSize, int offset) {
        
        StringBuilder queryString = new StringBuilder("FROM RecordEntry re ");
        
        Map<String, Object> parameters = Map.of();

        TypedQuery<RecordEntry> query = entityManager.createQuery(queryString.toString(), RecordEntry.class);
        query.setFirstResult(offset);
        query.setMaxResults(pageSize);

        return new PagedList<>(query.getResultList(), getTotalCount(queryString.toString(), parameters));
    }

    @Override
    public Optional<RecordEntry> findById(String id) {
        
        return entityManager.createQuery("SELECT re FROM RecordEntry re WHERE re.id = :id", RecordEntry.class)
            .setParameter("id", id)
            .getResultList()
            .stream()
            .findFirst();
    }
    
}
