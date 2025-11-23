package cash_manager;

import org.springframework.boot.SpringApplication;

public class TestCashManagerApplication {

	public static void main(String[] args) {
		SpringApplication.from(CashManagerApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
