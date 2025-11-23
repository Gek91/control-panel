package cash_manager.core;

import org.springframework.boot.context.properties.ConfigurationProperties;
import lombok.Data;

@Data
@ConfigurationProperties(prefix = "properties")
public class ConfigurationsValue {

    String env;
}