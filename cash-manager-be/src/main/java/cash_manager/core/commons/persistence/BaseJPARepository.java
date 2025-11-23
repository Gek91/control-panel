package cash_manager.core.commons.persistence;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.Map;


public abstract class BaseJPARepository<T>{
    
    @PersistenceContext
    protected EntityManager entityManager;

    public void add(T entity) {
        entityManager.persist(entity);
        entityManager.flush();
    }

    public void remove(T entity) {
        entityManager.remove(entity);
        entityManager.flush();
    }

    protected Long getTotalCount(String queryString, Map<String, Object> parameters) {
        
        queryString = "SELECT COUNT(*) " + queryString;
        Query query = entityManager.createQuery(queryString);
        parameters.forEach(query::setParameter);

        return (Long) query.getSingleResult();
    }

}
