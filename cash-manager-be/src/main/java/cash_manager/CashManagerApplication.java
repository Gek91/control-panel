package cash_manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import cash_manager.api.ApiModuleConfiguration;

@SpringBootApplication
@Import({ApiModuleConfiguration.class, WebSecurityConfiguration.class})
public class CashManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(CashManagerApplication.class, args);
	}

}
