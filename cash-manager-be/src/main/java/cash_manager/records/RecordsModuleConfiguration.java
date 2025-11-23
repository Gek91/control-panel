package cash_manager.records;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import cash_manager.records.repository.RecordsRepository;
import cash_manager.records.repository.impl.RecordsRepositoryJPAImpl;
import cash_manager.records.service.impl.RecordsApplicationServiceImpl;
import cash_manager.records.service.RecordsApplicationService;
import cash_manager.core.CoreModuleConfiguration;

@Configuration
@Import({CoreModuleConfiguration.class})

public class RecordsModuleConfiguration {
 
    @Bean
    public RecordsRepository recordsRepository() {
        return new RecordsRepositoryJPAImpl();
    }

    @Bean
    public RecordsApplicationService recordsApplicationService() {
        return new RecordsApplicationServiceImpl(recordsRepository());
    }
}
