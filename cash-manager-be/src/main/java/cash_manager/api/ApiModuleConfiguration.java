package cash_manager.api;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import cash_manager.api.controllers.HealthRestController;
import cash_manager.api.controllers.impl.HealthRestControllerImpl;
import cash_manager.api.controllers.RecordsRestController;
import cash_manager.api.controllers.impl.RecordsRestControllerImpl;
import cash_manager.records.RecordsModuleConfiguration;
import cash_manager.records.service.RecordsApplicationService;
import cash_manager.core.service.MapperService;

@Configuration
@Import({RecordsModuleConfiguration.class})
public class ApiModuleConfiguration {
    
    @Bean
    public HealthRestController healthRestController() {
        return new HealthRestControllerImpl();
    }

    @Bean
    public RecordsRestController recordsRestController(RecordsApplicationService recordsApplicationService, MapperService mapperService) {
        return new RecordsRestControllerImpl(recordsApplicationService, mapperService);
    }
}
