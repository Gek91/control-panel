package cash_manager.api.controllers.impl;

import org.springframework.http.ResponseEntity;

import cash_manager.api.controllers.HealthRestController;

public class HealthRestControllerImpl implements HealthRestController {

    @Override
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok().build();
    }

}