package cash_manager.core;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import cash_manager.core.service.MapperService;
import cash_manager.core.service.impl.MapperServiceImpl;

@Configuration
@EnableConfigurationProperties(ConfigurationsValue.class)
public class CoreModuleConfiguration {
    @Bean
	public MapperService mapperService() {
		return new MapperServiceImpl();
	}
}
