package cash_manager.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;


@RestController
public interface HealthRestController {
    
    @GetMapping(path = "/health")
	ResponseEntity<String> healthCheck();
}
