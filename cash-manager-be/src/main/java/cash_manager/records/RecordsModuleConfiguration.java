package cash_manager.records;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import cash_manager.records.repository.CategoriesRepository;
import cash_manager.records.repository.RecordsRepository;
import cash_manager.records.repository.impl.CategoriesRepositoryJPAImpl;
import cash_manager.records.repository.impl.RecordsRepositoryJPAImpl;
import cash_manager.records.service.CategoriesApplicationService;
import cash_manager.records.service.RecordsApplicationService;
import cash_manager.records.service.impl.CategoriesApplicationServiceImpl;
import cash_manager.records.service.impl.RecordsApplicationServiceImpl;
import cash_manager.core.CoreModuleConfiguration;

@Configuration
@Import({CoreModuleConfiguration.class})
public class RecordsModuleConfiguration {

    @Bean
    public RecordsRepository recordsRepository() {
        return new RecordsRepositoryJPAImpl();
    }

    @Bean
    public CategoriesRepository categoriesRepository() {
        return new CategoriesRepositoryJPAImpl();
    }

    @Bean
    public CategoriesApplicationService categoriesApplicationService(CategoriesRepository categoriesRepository) {
        return new CategoriesApplicationServiceImpl(categoriesRepository);
    }

    @Bean
    public RecordsApplicationService recordsApplicationService(RecordsRepository recordsRepository,
                                                               CategoriesApplicationService categoriesApplicationService) {
        return new RecordsApplicationServiceImpl(recordsRepository, categoriesApplicationService);
    }
}
